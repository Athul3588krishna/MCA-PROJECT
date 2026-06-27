import { useEffect, useMemo, useState } from 'react'
import PageContent from './pages/AppPages'
import PublicHome from './pages/PublicHome'
import RoleAuthPage from './pages/RoleAuthPage'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const roles = ['Passenger', 'Driver', 'Admin']

const emptyAnalytics = {
  ridesToday: null,
  monthlyRevenue: null,
  averageRating: null,
  onlineDrivers: null,
  pendingVerifications: null,
  peakBookingTime: 'No ride data yet',
  areaWiseRideStatistics: {},
  demandPrediction: [],
}

const pageConfig = {
  Passenger: ['Dashboard', 'Book Ride', 'Track Ride', 'History', 'Support', 'Profile'],
  Driver: ['Dashboard', 'Requests', 'Earnings', 'Vehicle', 'Support', 'Profile'],
  Admin: ['Dashboard', 'Rides', 'Drivers', 'Analytics', 'Support', 'Settings'],
}

function App() {
  const [role, setRole] = useState('Passenger')
  const [screen, setScreen] = useState(() => (localStorage.getItem('varasToken') ? 'app' : 'home'))
  const [activePage, setActivePage] = useState('Dashboard')
  const [token, setToken] = useState(() => localStorage.getItem('varasToken') || '')
  const [user, setUser] = useState(() => readStoredUser())
  const [rides, setRides] = useState([])
  const [drivers, setDrivers] = useState([])
  const [complaints, setComplaints] = useState([])
  const [events, setEvents] = useState([])
  const [analytics, setAnalytics] = useState(emptyAnalytics)
  const [activeRide, setActiveRide] = useState(null)
  const [notice, setNotice] = useState('Login to connect to the API.')
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState({
    pickup: '',
    destination: '',
    distance: 1,
    peak: false,
  })

  const fare = estimateFare(booking.distance, booking.peak)
  const pages = pageConfig[role]

  const stats = useMemo(() => {
    const completed = rides.filter((ride) => ride.status === 'Completed')
    const revenue = rides.reduce((sum, ride) => sum + Number(ride.fare || 0), 0)
    const avgRating = completed.reduce((sum, ride) => sum + Number(ride.rating || 0), 0) / completed.length || 0

    return {
      rides: analytics.ridesToday ?? rides.length,
      revenue: analytics.monthlyRevenue ?? revenue,
      avgRating: Number(analytics.averageRating || avgRating).toFixed(1),
      onlineDrivers: analytics.onlineDrivers ?? drivers.filter((driver) => driver.status === 'Online').length,
      pendingVerifications: analytics.pendingVerifications ?? drivers.filter((driver) => !driver.verified).length,
      openComplaints: complaints.filter((item) => item.status !== 'Closed').length,
    }
  }, [analytics, complaints, drivers, rides])

  useEffect(() => {
    if (!pages.includes(activePage)) setActivePage('Dashboard')
  }, [activePage, pages])

  useEffect(() => {
    if (token) refreshData(token)
    // The refresh function reads the latest UI state; this effect should only react to auth changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const text = response.status === 204 ? '' : await response.text()
    const data = text ? JSON.parse(text) : null
    if (response.status === 401) {
      logout()
      throw new Error(data?.error || 'Session expired. Please log in again.')
    }
    if (!response.ok) throw new Error(data?.error || 'Request failed')
    return data
  }

  async function refreshData(activeToken = token, activeRole = role) {
    if (!activeToken) return
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${activeToken}` }
      
      const promises = [
        api('/api/rides', { headers }),
        api('/api/drivers', { headers }),
        api('/api/events', { headers }),
      ]
      
      const isAdmin = activeRole === 'Admin'
      if (isAdmin) {
        promises.push(api('/api/admin/complaints', { headers }))
        promises.push(api('/api/admin/analytics', { headers }))
      }
      
      const results = await Promise.all(promises)
      const rideData = results[0]
      const driverData = results[1]
      const eventData = results[2]
      const complaintData = isAdmin ? results[3] : []
      const analyticsData = isAdmin ? results[4] : emptyAnalytics

      setRides(rideData)
      setDrivers(driverData)
      setComplaints(complaintData)
      setAnalytics(analyticsData)
      setEvents(eventData)
      setActiveRide(rideData[0] || null)
      setNotice('Live API connected. Dashboard data refreshed.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAuth({ mode, identifier, password, name, mobile, email }) {
    setLoading(true)
    try {
      const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload =
        mode === 'register'
          ? { name: name || `${role} User`, role, mobile: mobile || identifier, email: email || (identifier.includes('@') ? identifier : ''), password }
          : { identifier, password }
      const data = await api(path, { method: 'POST', body: JSON.stringify(payload), headers: {} })

      localStorage.setItem('varasToken', data.token)
      localStorage.setItem('varasUser', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setRole(data.user.role || role)
      setScreen('app')
      setNotice(`${mode === 'register' ? 'Registered' : 'Logged in'} as ${data.user.name || data.user.role}.`)
      await refreshData(data.token)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('varasToken')
    localStorage.removeItem('varasUser')
    setToken('')
    setUser(null)
    setScreen('home')
    setActivePage('Dashboard')
    setNotice('Logged out successfully.')
  }

  function openRoleAuth(selectedRole) {
    setRole(selectedRole)
    setScreen('auth')
    setNotice(`${selectedRole} access selected.`)
  }

  async function bookRide() {
    if (!booking.pickup || !booking.destination) {
      setNotice('Pickup and destination are required.')
      return
    }

    try {
      const ride = await api('/api/rides', {
        method: 'POST',
        body: JSON.stringify({
          pickup: booking.pickup,
          destination: booking.destination,
          distance: Number(booking.distance),
          peak: booking.peak,
        }),
      })
      setRides((current) => [ride, ...current])
      setActiveRide(ride)
      setActivePage('Track Ride')
      setNotice(`Ride request sent: ${ride.id} ${ride.driver ? `matched with ${ride.driver.name}` : 'is searching for drivers'}.`)
      await refreshData()
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function updateDriverStatus(driverId, patch = {}) {
    const driver = drivers.find((item) => item.id === driverId)
    if (!driver) return
    try {
      const updated = await api(`/api/drivers/${driverId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: patch.status || (driver.status === 'Online' ? 'Offline' : 'Online'),
          ...patch,
        }),
      })
      setDrivers((current) => current.map((item) => (item.id === driverId ? updated : item)))
      setNotice(`${updated.name} updated successfully.`)
      await refreshData()
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function updateRideStatus(id, status, patch = {}) {
    try {
      const ride = await api(`/api/rides/${id}`, { method: 'PATCH', body: JSON.stringify({ status, ...patch }) })
      setRides((current) => current.map((item) => (item.id === id ? ride : item)))
      setActiveRide((current) => (current?.id === id ? ride : current))
      setNotice(`Ride update: ${id} is now ${status}.`)
      await refreshData()
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function sendSos() {
    try {
      const alert = await api('/api/sos', {
        method: 'POST',
        body: JSON.stringify({
          rideId: activeRide?.id,
          passenger: activeRide?.passenger || user?.name || 'Passenger',
          pickup: activeRide?.pickup || booking.pickup,
          destination: activeRide?.destination || booking.destination,
        }),
      })
      setNotice(`SOS alert raised: ${alert.id}`)
      await refreshData()
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function createSupportComplaint(template) {
    try {
      const complaint = await api('/api/support/complaints', {
        method: 'POST',
        body: JSON.stringify(template),
      })
      setComplaints((current) => [complaint, ...current])
      setNotice(`${complaint.title} complaint added to the support queue.`)
      await refreshData()
    } catch (error) {
      setNotice(error.message)
    }
  }

  if (screen === 'home') {
    return <PublicHome onSelectRole={openRoleAuth} stats={stats} />
  }

  if (screen === 'auth') {
    return (
      <RoleAuthPage
        loading={loading}
        notice={notice}
        onAuth={handleAuth}
        onBack={() => setScreen('home')}
        role={role}
        setRole={setRole}
      />
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">V</span>
          <div>
            <p className="eyebrow">VARAS 2.0</p>
            <strong>Auto Ride System</strong>
          </div>
        </div>

        <nav className="page-nav" aria-label="Main pages">
          {pages.map((page) => (
            <button className={activePage === page ? 'active' : ''} key={page} onClick={() => setActivePage(page)}>
              <span>{navIcon(page)}</span>
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <span>{token ? 'Live API' : 'Login required'}</span>
          <strong>{stats.onlineDrivers} drivers online</strong>
          <button disabled={loading || !token} onClick={() => refreshData()}>
            Sync
          </button>
        </div>
      </aside>

      <section className="main-stage">
        <header className="topbar">
          <div>
            <p className="eyebrow">{role} workspace</p>
            <h1>{activePage}</h1>
          </div>
          <div className="topbar-actions">
            {!token && (
              <div className="role-tabs" aria-label="Role selector">
                {roles.map((item) => (
                  <button className={role === item ? 'active' : ''} key={item} onClick={() => setRole(item)}>
                    {item}
                  </button>
                ))}
              </div>
            )}
            <AccountMenu onGoHome={() => setScreen('home')} onLogout={logout} token={token} user={user} />
          </div>
        </header>

        <StatusStrip loading={loading} notice={notice} stats={stats} token={token} />

        <PageContent
          activePage={activePage}
          activeRide={activeRide}
          analytics={analytics}
          booking={booking}
          bookRide={bookRide}
          complaints={complaints}
          createSupportComplaint={createSupportComplaint}
          drivers={drivers}
          events={events}
          fare={fare}
          rides={rides}
          role={role}
          sendSos={sendSos}
          setActivePage={setActivePage}
          setActiveRide={setActiveRide}
          setBooking={setBooking}
          stats={stats}
          token={token}
          updateDriverStatus={updateDriverStatus}
          updateRideStatus={updateRideStatus}
          user={user}
        />
      </section>
    </main>
  )
}

function AccountMenu({ onGoHome, onLogout, token, user }) {
  return (
    <section className="auth-card">
      <div>
        <strong>{user ? user.name || user.role : 'Guest workspace'}</strong>
        <span>{token ? 'Authenticated' : 'Login required'}</span>
      </div>
      <div className="button-row compact">
        <button onClick={onGoHome}>Home</button>
        {token && <button onClick={onLogout}>Logout</button>}
      </div>
    </section>
  )
}

function StatusStrip({ loading, notice, stats, token }) {
  return (
    <section className="status-strip">
      <p>{loading ? 'Syncing live data...' : notice}</p>
      <div>
        <Metric label="Rides" value={stats.rides} />
        <Metric label="Online" value={stats.onlineDrivers} />
        <Metric label="Mode" value={token ? 'Live' : 'Guest'} />
      </div>
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function estimateFare(distance, peak) {
  const multiplier = peak ? 1.35 : 1
  return Math.round((35 + Number(distance || 0) * 17) * multiplier)
}

function navIcon(page) {
  return {
    Dashboard: 'H',
    'Book Ride': '+',
    'Track Ride': 'O',
    History: '=',
    Support: '!',
    Profile: 'P',
    Requests: '+',
    Earnings: 'Rs',
    Vehicle: 'A',
    Rides: '=',
    Drivers: 'D',
    Analytics: '%',
    Settings: 'S',
  }[page]
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('varasUser')) || null
  } catch {
    return null
  }
}

export default App
