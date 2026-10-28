import { useEffect, useMemo, useState } from 'react';
import { BedDouble, CalendarDays, CheckCircle2, CircleUserRound, Hotel, LogIn, LogOut, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api } from './api';

const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hotelpro_user') || 'null'); } catch { return null; }
  });
  const [modal, setModal] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchType, setSearchType] = useState('All rooms');
  const [mobileMenu, setMobileMenu] = useState(false);

  async function loadRooms() {
    try { setRooms(await api('/rooms')); }
    catch (e) { setNotice(`${e.message}. Check that the server and MongoDB are running.`); }
  }
  async function loadBookings() {
    if (!user) return;
    try { setBookings(await api(user.role === 'admin' ? '/bookings' : '/bookings/my')); }
    catch (e) { setNotice(e.message); }
  }
  useEffect(() => { loadRooms(); }, []);
  useEffect(() => { loadBookings(); }, [user]);

  const visibleRooms = useMemo(() => searchType === 'All rooms' ? rooms : rooms.filter(r => r.type === searchType), [rooms, searchType]);

  async function submitAuth(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const result = await api(`/auth/${modal}`, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('hotelpro_token', result.token);
      localStorage.setItem('hotelpro_user', JSON.stringify(result.user));
      setUser(result.user); setModal(''); setNotice(`Welcome${result.user.name ? `, ${result.user.name}` : ''}!`);
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  function logout() {
    localStorage.removeItem('hotelpro_token'); localStorage.removeItem('hotelpro_user');
    setUser(null); setBookings([]); setNotice('You have signed out.');
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!user) { setSelectedRoom(selectedRoom); setModal('login'); setNotice('Please sign in to reserve a room.'); return; }
    setBusy(true); setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      const booking = await api('/bookings', { method: 'POST', body: JSON.stringify({
        roomId: selectedRoom._id, checkIn: form.get('checkIn'), checkOut: form.get('checkOut'), guests: Number(form.get('guests'))
      })});
      setNotice(`Reservation created. Total: ${money(booking.totalPrice)}. Status: ${booking.status}.`);
      setModal(''); setSelectedRoom(null); await loadBookings();
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  async function changeBookingStatus(id, status) {
    try { await api(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadBookings(); setNotice('Reservation updated.'); }
    catch (e) { setNotice(e.message); }
  }

  return <div className="app-shell">
    <nav className="navbar navbar-expand-lg hotel-nav">
      <div className="container">
        <a className="brand" href="#home" onClick={() => setMobileMenu(false)}><span className="brand-icon"><Hotel size={21}/></span>hotel<span>pro</span></a>
        <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X/> : <Menu/>}</button>
        <div className={`nav-links ${mobileMenu ? 'show' : ''}`}>
          <a href="#rooms" onClick={() => setMobileMenu(false)}>Rooms & suites</a>
          {user && <a href="#bookings" onClick={() => setMobileMenu(false)}>{user.role === 'admin' ? 'Reservations' : 'My stays'}</a>}
          {user?.role === 'admin' && <span className="admin-pill"><ShieldCheck size={14}/> Admin</span>}
          {user ? <button className="nav-login" onClick={logout}><LogOut size={16}/> Sign out</button> : <button className="nav-login" onClick={() => setModal('login')}><CircleUserRound size={17}/> Sign in</button>}
        </div>
      </div>
    </nav>

    <main>
      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="eyebrow"><Sparkles size={15}/> YOUR STAY, REIMAGINED</div>
          <h1>Arrive as you are.<br/><em>Stay somewhere special.</em></h1>
          <p>Thoughtful comfort, warm hospitality, and a simpler way to plan your next stay.</p>
          <a href="#rooms" className="btn btn-gold">Explore rooms <span>↗</span></a>
          <div className="hero-stats"><div><strong>Curated</strong><small>Rooms & suites</small></div><div><strong>Seamless</strong><small>Reservations</small></div><div><strong>Secure</strong><small>Guest accounts</small></div></div>
        </div>
        <div className="hero-caption"><span>01</span> / A MORE CONSIDERED STAY</div>
      </section>

      <section className="trust-strip">
        <div className="container trust-items">
          <div><CheckCircle2/><span>Easy reservations</span></div><div><ShieldCheck/><span>Secure accounts</span></div><div><CalendarDays/><span>Clear booking details</span></div><div><BedDouble/><span>Comfort comes first</span></div>
        </div>
      </section>

      <section id="rooms" className="section-pad">
        <div className="container">
          <div className="section-heading">
            <div><div className="eyebrow dark">FIND YOUR SPACE</div><h2>Rooms made for <em>unwinding.</em></h2><p>Choose the room that feels right for your next getaway.</p></div>
            <div className="filter-wrap"><label htmlFor="roomFilter">Room type</label><select id="roomFilter" className="form-select" value={searchType} onChange={e => setSearchType(e.target.value)}><option>All rooms</option><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Family</option></select></div>
          </div>
          {visibleRooms.length === 0 ? <div className="empty-state"><BedDouble size={30}/><h3>No rooms to show yet</h3><p>Start the server and seed the database to load demo rooms.</p></div> :
          <div className="row g-4">{visibleRooms.map((room, index) => <div className="col-md-6 col-xl-3" key={room._id}>
            <article className="room-card">
              <div className="room-image">{room.imageUrl ? <img src={room.imageUrl} alt={room.name} loading="lazy"/> : <div className="image-placeholder"><BedDouble size={40}/></div>}<span className="room-number">0{index + 1}</span></div>
              <div className="room-body"><div className="room-type">{room.type} room</div><h3>{room.name}</h3><p>{room.description || 'A welcoming space designed for your comfort.'}</p><div className="room-meta"><span><BedDouble size={15}/> Up to {room.capacity} guests</span><strong>{money(room.pricePerNight)}<small> / night</small></strong></div>
                <div className="amenities">{(room.amenities || []).slice(0, 3).map(a => <span key={a}>{a}</span>)}</div>
                <button className="btn btn-room" onClick={() => { setSelectedRoom(room); setModal('booking'); }}>Reserve this room <span>→</span></button>
              </div>
            </article>
          </div>)}</div>}
        </div>
      </section>

      <section className="experience">
        <div className="container experience-grid"><div className="experience-photo"><img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85" alt="Relaxing hotel pool and resort" loading="lazy"/><div className="photo-label">A LITTLE MORE ROOM TO BREATHE</div></div><div className="experience-copy"><div className="eyebrow">THE HOTELPRO DIFFERENCE</div><h2>Good stays are<br/>made of <em>little things.</em></h2><p>From choosing your room to keeping track of your reservation, HotelPro brings the essentials together in one clear, welcoming experience.</p><ul><li><CheckCircle2/> Browse room options and nightly rates</li><li><CheckCircle2/> Create a secure guest account</li><li><CheckCircle2/> Review your reservation details</li></ul><a href="#rooms" className="text-link">Find your room <span>↗</span></a></div></div>
      </section>

      {user && <section id="bookings" className="section-pad booking-section"><div className="container"><div className="section-heading"><div><div className="eyebrow dark">{user.role === 'admin' ? 'HOTEL OPERATIONS' : 'YOUR ACCOUNT'}</div><h2>{user.role === 'admin' ? 'Guest reservations.' : 'Your upcoming stays.'}</h2><p>{user.role === 'admin' ? 'Review reservations and update their status.' : 'Your reservation details, all in one place.'}</p></div></div>
        {bookings.length === 0 ? <div className="empty-state"><CalendarDays size={30}/><h3>No reservations yet</h3><p>Once a room is reserved, it will appear here.</p></div> : <div className="table-responsive booking-table-wrap"><table className="table booking-table"><thead><tr><th>Room / guest</th><th>Dates</th><th>Guests</th><th>Total</th><th>Status</th>{user.role === 'admin' && <th>Update</th>}</tr></thead><tbody>{bookings.map(b => <tr key={b._id}><td><strong>{b.room?.name || 'Room removed'}</strong>{user.role === 'admin' && <small>{b.user?.name} · {b.user?.email}</small>}</td><td>{new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}</td><td>{b.guests}</td><td>{money(b.totalPrice)}</td><td><span className={`status status-${b.status}`}>{b.status}</span></td>{user.role === 'admin' && <td><select className="form-select form-select-sm" value={b.status} onChange={e => changeBookingStatus(b._id, e.target.value)}><option>pending</option><option>confirmed</option><option>cancelled</option></select></td>}</tr>)}</tbody></table></div>}
      </div></section>}

      <section className="closing-cta"><div className="container"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Make room for <em>something good.</em></h2><a href="#rooms" className="btn btn-gold">Browse available rooms <span>↗</span></a></div></section>
    </main>

    <footer><div className="container footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-icon"><Hotel size={19}/></span>hotel<span>pro</span></a><p>Thoughtful stays. Simpler reservations.</p><small>© {new Date().getFullYear()} HotelPro. Built for a better guest experience.</small></div></footer>

    {notice && <div className="notice-toast" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={17}/></button></div>}

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) { setModal(''); } }}>
      <div className="hotel-modal">
        <button className="modal-close" onClick={() => setModal('')} aria-label="Close"><X/></button>
        {modal === 'booking' ? <>
          <div className="eyebrow dark">RESERVE YOUR STAY</div><h2>{selectedRoom?.name || 'Your room'}</h2><p className="modal-sub">{selectedRoom ? `${money(selectedRoom.pricePerNight)} per night · Up to ${selectedRoom.capacity} guests` : ''}</p>
          <form onSubmit={submitBooking} className="modal-form">
            <label>Check-in<input name="checkIn" type="date" min={today()} defaultValue={today()} required className="form-control"/></label>
            <label>Check-out<input name="checkOut" type="date" min={today()} defaultValue={today()} required className="form-control"/></label>
            <label>Guests<select name="guests" className="form-select" defaultValue="2">{Array.from({length: selectedRoom?.capacity || 2}, (_, i) => <option key={i} value={i + 1}>{i + 1} guest{i ? 's' : ''}</option>)}</select></label>
            <button disabled={busy} className="btn btn-gold w-100">{busy ? 'Please wait…' : user ? 'Create reservation' : 'Sign in to continue'}</button>
          </form>
          <p className="fine-print">No payment is collected in this demo. Your reservation will be created as pending.</p>
        </> : <>
          <div className="eyebrow dark">{modal === 'login' ? 'WELCOME BACK' : 'JOIN HOTELPRO'}</div><h2>{modal === 'login' ? 'Sign in to your stay.' : 'Make yourself at home.'}</h2><p className="modal-sub">{modal === 'login' ? 'Access your reservations and account.' : 'Create an account to reserve a room.'}</p>
          <form onSubmit={submitAuth} className="modal-form">
            {modal === 'register' && <label>Full name<input className="form-control" name="name" placeholder="Your name" required autoComplete="name"/></label>}
            <label>Email address<input className="form-control" type="email" name="email" placeholder="you@example.com" required autoComplete="email"/></label>
            <label>Password<input className="form-control" type="password" name="password" minLength="8" placeholder="At least 8 characters" required autoComplete={modal === 'login' ? 'current-password' : 'new-password'}/></label>
            <button disabled={busy} className="btn btn-gold w-100">{busy ? 'Please wait…' : modal === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
          <p className="switch-modal">{modal === 'login' ? 'New to HotelPro?' : 'Already have an account?'} <button onClick={() => setModal(modal === 'login' ? 'register' : 'login')}>{modal === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <p className="fine-print">Admin demo access is listed in the project README after seeding.</p>
        </>}
      </div>
    </div>}
  </div>;
}
