const supportTemplates = [
  { title: 'Late pickup', owner: 'Passenger', priority: 'Medium', status: 'Open' },
  { title: 'Payment mismatch', owner: 'Driver', priority: 'High', status: 'Review' },
  { title: 'Route concern', owner: 'Passenger', priority: 'Low', status: 'Open' },
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

function TrackingPage({ activeRide, drivers, fare, sendSos, token, updateRideStatus }) {
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
            <button className={activeRide?.status === step ? 'step active-step' : 'step'} disabled={!token || !activeRide} key={step} onClick={() => updateRideStatus(activeRide.id, step)}>
              {step}
            </button>
          ))}
        </div>
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
          <article className="request-card" key={ride.id}>
            <div>
              <h3>{ride.id}</h3>
              <p>{ride.pickup} to {ride.destination}</p>
              <span>Fare Rs {ride.fare} - {ride.distance || 1} km</span>
            </div>
            <div className="button-row compact">
              <button onClick={() => updateRideStatus(ride.id, 'Accepted')}>Accept</button>
              <button onClick={() => updateRideStatus(ride.id, 'Rejected')}>Reject</button>
              <button className="primary" onClick={() => updateRideStatus(ride.id, 'Completed')}>Complete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
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
  return (
    <section className="panel">
      <PanelTitle label="Vehicle and availability" value="Driver profile" />
      <DriverCards drivers={drivers} updateDriverStatus={updateDriverStatus} />
    </section>
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
          {(areaStats.length ? areaStats : [['Infopark Gate', 1], ['Vyttila Hub', 1]]).map(([area, count]) => (
            <article key={area}>
              <span>{area}</span>
              <div><i style={{ width: `${Math.min(100, Number(count) * 34)}%` }} /></div>
              <strong>{count}</strong>
            </article>
          ))}
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
        </div>
      </section>
      <section className="panel">
        <PanelTitle label="Create ticket" value="Support" />
        <div className="action-stack">
          {supportTemplates.map((template) => (
            <button key={template.title} onClick={() => createSupportComplaint(template)}>
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
            ['Name', user?.name || `${role} User`],
            ['Role', user?.role || role],
            ['Mobile', user?.mobile || '+919876543299'],
            ['Email', user?.email || 'admin@varas.local'],
          ]}
        />
      </section>
      <section className="panel span-2">
        <PanelTitle label="Deployment checklist" value="Ready" />
        <div className="checklist">
          {['Vite production build', 'Static serving from backend', 'JWT login flow', 'API fallback data', 'Responsive pages'].map((item) => (
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
    </div>
  )
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
