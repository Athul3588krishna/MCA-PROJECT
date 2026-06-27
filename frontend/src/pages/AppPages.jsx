import { useState, useEffect } from 'react'

const supportTemplates = [
  { title: 'Ride support request', owner: 'Passenger', priority: 'Medium', status: 'Open' },
  { title: 'Driver support request', owner: 'Driver', priority: 'Medium', status: 'Open' },
  { title: 'Payment support request', owner: 'Passenger', priority: 'High', status: 'Open' },
]

function PageContent(props) {
  const page = props.activePage
  if (page === 'Dashboard') return <DashboardPage {...props} />
  if (page === 'Book Ride') return <BookingPage {...props} />
  if (page === 'Track Ride') return <TrackingPage {...props} />
  if (page === 'History' || page === 'Rides') return <RidesPage {...props} />
  if (page === 'Requests') return <RequestsPage {...props} />
  if (page === 'Earnings') return <EarningsPage {...props} />
  if (page === 'Vehicle') return <VehiclePage {...props} />
  if (page === 'Drivers') return <DriversPage {...props} />
  if (page === 'Analytics') return <AnalyticsPage {...props} />
  if (page === 'Support') return <SupportPage {...props} />
  return <ProfilePage {...props} />
}

function DashboardPage({ activeRide, analytics, drivers, events, fare, rides, role, setActivePage, stats }) {
  return (
    <div className="content-grid">
      <section className="map-panel span-2" aria-label="Live ride tracking map">
        <MapHeader activeRide={activeRide} fare={fare} />
        <LiveMapCanvas drivers={drivers} />
        <div className="route-summary">
          <span>{activeRide?.pickup || 'Pickup pending'}</span>
          <span>{activeRide?.destination || 'Destination pending'}</span>
          <strong>{activeRide?.status || 'Idle'}</strong>
        </div>
      </section>

      <section className="panel">
        <PanelTitle label="Quick actions" value={role} />
        <div className="action-stack">
          <button className="primary" onClick={() => setActivePage(role === 'Passenger' ? 'Book Ride' : role === 'Driver' ? 'Requests' : 'Rides')}>
            {role === 'Passenger' ? 'Book a ride' : role === 'Driver' ? 'Open requests' : 'Review rides'}
          </button>
          <button onClick={() => setActivePage(role === 'Admin' ? 'Analytics' : 'Support')}>{role === 'Admin' ? 'Open analytics' : 'Get support'}</button>
          <button onClick={() => setActivePage(role === 'Passenger' ? 'Track Ride' : role === 'Driver' ? 'Earnings' : 'Drivers')}>
            {role === 'Passenger' ? 'Track active ride' : role === 'Driver' ? 'View earnings' : 'Manage drivers'}
          </button>
        </div>
      </section>

      <section className="panel">
        <PanelTitle label="Today" value="Ops" />
        <div className="metric-grid">
          <Metric label="Rides" value={stats.rides} />
          <Metric label="Revenue" value={`Rs ${stats.revenue}`} />
          <Metric label="Rating" value={stats.avgRating} />
          <Metric label="Open tickets" value={stats.openComplaints} />
        </div>
      </section>

      <section className="panel">
        <PanelTitle label="Demand forecast" value={analytics.peakBookingTime || 'Live'} />
        <HotspotList analytics={analytics} />
      </section>

      <section className="panel span-2">
        <PanelTitle label="Recent rides" value={`${rides.length} total`} />
        <RideTable rides={rides.slice(0, 5)} />
      </section>

      <section className="panel">
        <PanelTitle label="Activity feed" value={`${events.length} events`} />
        <EventFeed events={events} />
      </section>
    </div>
  )
}

function BookingPage({ booking, bookRide, fare, setBooking, token }) {
  return (
    <div className="content-grid booking-layout">
      <section className="panel span-2">
        <PanelTitle label="New booking" value="Smart fare" />
        <div className="form-grid two-fields">
          <label>
            Pickup
            <input value={booking.pickup} onChange={(event) => setBooking({ ...booking, pickup: event.target.value })} />
          </label>
          <label>
            Destination
            <input value={booking.destination} onChange={(event) => setBooking({ ...booking, destination: event.target.value })} />
          </label>
          <label>
            Distance km
            <input min="1" step="0.1" type="number" value={booking.distance} onChange={(event) => setBooking({ ...booking, distance: event.target.value })} />
          </label>
          <label className="toggle-line">
            <input checked={booking.peak} type="checkbox" onChange={(event) => setBooking({ ...booking, peak: event.target.checked })} />
            Peak-time pricing
          </label>
        </div>
        <div className="fare-box">
          <span>Estimated fare</span>
          <strong>Rs {fare}</strong>
        </div>
        <button className="primary wide" disabled={!token} onClick={bookRide}>
          Book ride
        </button>
      </section>

      <section className="panel">
        <PanelTitle label="Fare policy" value="Ready" />
        <InfoList
          items={[
            ['Base fare', 'Rs 35'],
            ['Per kilometer', 'Rs 17'],
            ['Peak multiplier', booking.peak ? '1.35x active' : 'Standard'],
            ['Payment mode', 'Cash / UPI ready'],
          ]}
        />
      </section>
    </div>
  )
}

function TrackingPage({ activeRide, drivers, fare, role, sendSos, token, updateRideStatus }) {
  return (
    <div className="content-grid">
      <section className="map-panel span-2">
        <MapHeader activeRide={activeRide} fare={fare} />
        <LiveMapCanvas drivers={drivers} />
        <div className="route-summary">
          <span>{activeRide?.pickup || 'Pickup pending'}</span>
          <span>{activeRide?.destination || 'Destination pending'}</span>
          <strong>{activeRide?.status || 'Idle'}</strong>
        </div>
      </section>

      <section className="panel">
        <PanelTitle label="Ride controls" value={activeRide?.status || 'Idle'} />
        <div className="timeline">
          {['Requested', 'Accepted', 'On trip', 'Completed'].map((step) => (
            <button className={activeRide?.status === step ? 'step active-step' : 'step'} disabled={role === 'Passenger' || !token || !activeRide} key={step} onClick={() => updateRideStatus(activeRide.id, step)}>
              {step}
            </button>
          ))}
        </div>

        {activeRide?.status === 'Accepted' && role === 'Passenger' && activeRide.otp && (
          <div className="safety-panel compact-panel" style={{ background: '#eef6ff', borderColor: '#bcd8f3', marginTop: '15px' }}>
            <div>
              <span className="brand-mark" style={{ background: '#0070f3', fontSize: '12px' }}>OTP</span>
              <h3 style={{ color: '#0070f3' }}>Share OTP to Start Trip</h3>
              <p>Tell your driver this code to verify your ride: <strong style={{ fontSize: '18px', color: '#333' }}>{activeRide.otp}</strong></p>
            </div>
          </div>
        )}

        <div className="safety-panel compact-panel">
          <div>
            <span className="sos">SOS</span>
            <h3>Emergency support</h3>
            <p>Alert the admin desk with this ride information.</p>
          </div>
          <button className="danger" disabled={!token} onClick={sendSos}>
            Send SOS
          </button>
        </div>
      </section>
    </div>
  )
}

function RidesPage({ rides, setActiveRide, setActivePage, updateRideStatus }) {
  return (
    <section className="panel">
      <PanelTitle label="Ride management" value={`${rides.length} rides`} />
      <RideTable rides={rides} onSelect={(ride) => {
        setActiveRide(ride)
        setActivePage('Track Ride')
      }} updateRideStatus={updateRideStatus} />
    </section>
  )
}

function RequestsPage({ rides, updateRideStatus }) {
  return (
    <section className="panel">
      <PanelTitle label="Incoming requests" value="Live queue" />
      <div className="request-list">
        {rides.map((ride) => (
          <RequestCard key={ride.id} ride={ride} updateRideStatus={updateRideStatus} />
        ))}
        {!rides.length && <EmptyState message="Incoming ride requests will appear here." />}
      </div>
    </section>
  )
}

function RequestCard({ ride, updateRideStatus }) {
  const [otpInput, setOtpInput] = useState('')

  const handleStartTrip = () => {
    if (!otpInput) return
    updateRideStatus(ride.id, 'On trip', { otp: otpInput })
  }

  return (
    <article className="request-card" key={ride.id}>
      <div>
        <h3>{ride.id}</h3>
        <p>{ride.pickup} to {ride.destination}</p>
        <span>Fare Rs {ride.fare} - {ride.distance || 1} km</span>
        <div style={{ marginTop: '5px' }}>
          <strong>Status: <span style={{ color: ride.status === 'Accepted' ? '#0070f3' : ride.status === 'On trip' ? '#00b0ff' : '#666' }}>{ride.status}</span></strong>
        </div>
      </div>
      <div className="button-row compact" style={{ flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
        {ride.status === 'Searching' && (
          <>
            <button onClick={() => updateRideStatus(ride.id, 'Accepted')}>Accept</button>
            <button onClick={() => updateRideStatus(ride.id, 'Rejected')}>Reject</button>
          </>
        )}
        {ride.status === 'Accepted' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            <input
              placeholder="Enter OTP"
              type="text"
              maxLength="4"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              style={{ padding: '6px 10px', width: '110px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button className="primary" onClick={handleStartTrip} disabled={otpInput.length !== 4}>
              Start Trip
            </button>
          </div>
        )}
        {ride.status === 'On trip' && (
          <button className="primary" onClick={() => updateRideStatus(ride.id, 'Completed')}>
            Complete Trip
          </button>
        )}
        {ride.status === 'Completed' && (
          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Completed</span>
        )}
      </div>
    </article>
  )
}

function EarningsPage({ drivers, rides, stats }) {
  const currentDriver = drivers[0]
  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle label="Earnings" value="This month" />
        <div className="metric-grid">
          <Metric label="Today" value={`Rs ${currentDriver?.earnings || 0}`} />
          <Metric label="Platform rides" value={rides.length} />
          <Metric label="Rating" value={currentDriver?.rating || stats.avgRating} />
          <Metric label="Revenue" value={`Rs ${stats.revenue}`} />
        </div>
      </section>
      <section className="panel span-2">
        <PanelTitle label="Completed trips" value="Payout ready" />
        <RideTable rides={rides.filter((ride) => ride.status === 'Completed')} />
      </section>
    </div>
  )
}

function VehiclePage({ drivers, updateDriverStatus }) {
  const driver = drivers[0]
  const [auto, setAuto] = useState(driver?.auto || '')
  const [area, setArea] = useState(driver?.area || '')

  useEffect(() => {
    if (driver) {
      setAuto(driver.auto || '')
      setArea(driver.area || '')
    }
  }, [driver])

  const handleSave = (e) => {
    e.preventDefault()
    if (driver) {
      updateDriverStatus(driver.id, { auto, area })
    }
  }

  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle label="Vehicle & Area Profile" value={driver?.status || 'Offline'} />
        <form className="professional-form" onSubmit={handleSave}>
          <label>
            Auto Rickshaw Details (e.g. Plate Number)
            <input value={auto} onChange={(e) => setAuto(e.target.value)} required />
          </label>
          <label>
            Operating Area / Route
            <input value={area} onChange={(e) => setArea(e.target.value)} required />
          </label>
          <button className="primary wide" type="submit">Save Profile</button>
        </form>
      </section>
      
      <section className="panel">
        <PanelTitle label="Status & Availability" value="Controls" />
        <div className="driver-list" style={{ marginTop: '20px' }}>
          {driver && (
            <article className="driver-card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
              <div className="driver-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <strong>Status: {driver.status}</strong>
                  <p style={{ margin: '5px 0 0', color: '#666' }}>{driver.verified ? '✓ Verified Partner' : '✗ Needs Verification'}</p>
                </div>
                <button className="primary" onClick={() => updateDriverStatus(driver.id)}>
                  Toggle {driver.status === 'Online' ? 'Offline' : 'Online'}
                </button>
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}

function DriversPage({ drivers, updateDriverStatus }) {
  return (
    <section className="panel">
      <PanelTitle label="Driver verification" value={`${drivers.length} drivers`} />
      <DriverCards admin drivers={drivers} updateDriverStatus={updateDriverStatus} />
    </section>
  )
}

function AnalyticsPage({ analytics, stats }) {
  const areaStats = Object.entries(analytics.areaWiseRideStatistics || {})
  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle label="Performance" value="Live" />
        <div className="metric-grid">
          <Metric label="Rides" value={stats.rides} />
          <Metric label="Revenue" value={`Rs ${stats.revenue}`} />
          <Metric label="Online drivers" value={stats.onlineDrivers} />
          <Metric label="Pending verify" value={stats.pendingVerifications} />
        </div>
      </section>
      <section className="panel">
        <PanelTitle label="Demand prediction" value={analytics.peakBookingTime || 'Peak'} />
        <HotspotList analytics={analytics} />
      </section>
      <section className="panel span-2">
        <PanelTitle label="Area ride statistics" value={`${areaStats.length} areas`} />
        <div className="area-bars">
          {areaStats.map(([area, count]) => (
            <article key={area}>
              <span>{area}</span>
              <div><i style={{ width: `${Math.min(100, Number(count) * 34)}%` }} /></div>
              <strong>{count}</strong>
            </article>
          ))}
          {!areaStats.length && <EmptyState message="Area statistics will appear after rides are booked." />}
        </div>
      </section>
    </div>
  )
}

function SupportPage({ complaints, createSupportComplaint, sendSos, token }) {
  return (
    <div className="content-grid">
      <section className="panel span-2">
        <PanelTitle label="Support queue" value={`${complaints.length} tickets`} />
        <div className="complaint-list">
          {complaints.map((complaint) => (
            <article key={complaint.id}>
              <strong>{complaint.title}</strong>
              <span>{complaint.owner}</span>
              <em>{complaint.priority}</em>
              <small>{complaint.status}</small>
            </article>
          ))}
          {!complaints.length && <EmptyState message="Support tickets will appear here." />}
        </div>
      </section>
      <section className="panel">
        <PanelTitle label="Create ticket" value="Support" />
        <div className="action-stack">
          {supportTemplates.map((template) => (
            <button disabled={!token} key={template.title} onClick={() => createSupportComplaint(template)}>
              {template.title}
            </button>
          ))}
          <button className="danger" disabled={!token} onClick={sendSos}>Raise SOS</button>
        </div>
      </section>
    </div>
  )
}

function ProfilePage({ role, token, user }) {
  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle label="Account" value={token ? 'Signed in' : 'Guest'} />
        <InfoList
          items={[
            ['Name', user?.name || 'Not signed in'],
            ['Role', user?.role || role],
            ['Mobile', user?.mobile || 'Not provided'],
            ['Email', user?.email || 'Not provided'],
          ]}
        />
      </section>
      <section className="panel span-2">
        <PanelTitle label="Deployment checklist" value="Ready" />
        <div className="checklist">
          {['Vite production build', 'Static serving from backend', 'JWT login flow', 'Environment-based secrets', 'Responsive pages'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

function MapHeader({ activeRide, fare }) {
  return (
    <div className="map-top">
      <div>
        <p className="eyebrow">Live tracking</p>
        <h2>{activeRide?.id || 'No active ride'}</h2>
      </div>
      <span className="fare-chip">Rs {activeRide?.fare || fare}</span>
    </div>
  )
}

function LiveMapCanvas({ drivers }) {
  return (
    <div className="map-canvas">
      <span className="map-road road-a" />
      <span className="map-road road-b" />
      <span className="map-road road-c" />
      <span className="pin pickup">P</span>
      <span className="pin destination">D</span>
      <span className="route-line" />
      {drivers.slice(0, 3).map((driver, index) => (
        <span className={`auto-marker marker-${index}`} key={driver.id} title={driver.name}>
          A
        </span>
      ))}
      {!drivers.length && <span className="map-empty-state">No active drivers</span>}
    </div>
  )
}

function DriverCards({ admin = false, drivers, updateDriverStatus }) {
  return (
    <div className="driver-list">
      {drivers.map((driver) => (
        <article className="driver-card" key={driver.id}>
          <div>
            <h3>{driver.name}</h3>
            <p>{driver.auto} - {driver.area} - {driver.mobile}</p>
            <span className={driver.verified ? 'verified' : 'pending'}>{driver.verified ? 'Verified' : 'Needs verification'}</span>
          </div>
          <div className="driver-actions">
            <strong>Rs {driver.earnings}</strong>
            <button onClick={() => updateDriverStatus(driver.id)}>{driver.status}</button>
            {admin && !driver.verified && <button className="primary" onClick={() => updateDriverStatus(driver.id, { verified: true })}>Verify</button>}
          </div>
        </article>
      ))}
      {!drivers.length && <EmptyState message="Driver records will appear after partners register and are verified." />}
    </div>
  )
}

function RideTable({ onSelect, rides, updateRideStatus }) {
  return (
    <div className="ride-table">
      {rides.map((ride) => (
        <article key={ride.id}>
          <button className="text-button" onClick={() => onSelect?.(ride)}>{ride.id}</button>
          <span>{ride.passenger || 'Passenger'}</span>
          <span>{ride.pickup}</span>
          <span>{ride.destination}</span>
          <span>Rs {ride.fare}</span>
          <em>{ride.status}</em>
          {updateRideStatus && (
            <button onClick={() => updateRideStatus(ride.id, ride.status === 'Completed' ? 'On trip' : 'Completed')}>
              {ride.status === 'Completed' ? 'Reopen' : 'Complete'}
            </button>
          )}
        </article>
      ))}
      {!rides.length && <EmptyState message="Ride records will appear after the first booking." />}
    </div>
  )
}

function HotspotList({ analytics }) {
  return (
    <div className="hotspot-list">
      {(analytics.demandPrediction || []).map((spot) => (
        <article key={spot.area}>
          <div>
            <h3>{spot.area}</h3>
            <p>{spot.recommendation}</p>
          </div>
          <meter min="0" max="100" value={spot.demand}>{spot.demand}</meter>
        </article>
      ))}
      {!(analytics.demandPrediction || []).length && <EmptyState message="Demand insights will appear after ride activity is available." />}
    </div>
  )
}

function EventFeed({ events }) {
  return (
    <div className="event-feed">
      {events.slice().reverse().slice(0, 6).map((event) => (
        <article key={event.id}>
          <strong>{event.type.replace(':', ' ')}</strong>
          <span>{new Date(event.createdAt).toLocaleString()}</span>
        </article>
      ))}
      {!events.length && <EmptyState message="Activity events will appear here." />}
    </div>
  )
}

function EmptyState({ message }) {
  return <p className="empty-state">{message}</p>
}

function InfoList({ items }) {
  return (
    <dl className="info-list">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function PanelTitle({ label, value }) {
  return (
    <div className="panel-title">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

export default PageContent
