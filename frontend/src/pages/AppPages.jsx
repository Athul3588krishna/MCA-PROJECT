import { useState, useEffect } from 'react'

const supportTemplates = [
  { title: 'Ride support request', owner: 'Passenger', priority: 'Medium', status: 'Open' },
  { title: 'Driver support request', owner: 'Driver', priority: 'Medium', status: 'Open' },
  { title: 'Payment support request', owner: 'Passenger', priority: 'High', status: 'Open' },
]

function PageContent(props) {
  const page = props.activePage
  const { activeSosAlert, acknowledgeSos, role, rides } = props
  const [revUpdate, setRevUpdate] = useState(0)

  const acknowledgedReviews = JSON.parse(localStorage.getItem('acknowledgedReviews') || '[]')
  const poorReviews = rides ? rides.filter(ride => ride.status === 'Completed' && ride.rating > 0 && ride.rating <= 2) : []
  const activePoorReview = poorReviews.find(r => !acknowledgedReviews.includes(r.id))

  const dismissPoorReview = (rideId) => {
    const acknowledged = JSON.parse(localStorage.getItem('acknowledgedReviews') || '[]')
    acknowledged.push(rideId)
    localStorage.setItem('acknowledgedReviews', JSON.stringify(acknowledged))
    setRevUpdate(prev => prev + 1)
  }

  const renderPage = () => {
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

  return (
    <>
      <style>{`
        @keyframes sosPulse {
          0% { box-shadow: 0 0 0 0px rgba(255, 0, 0, 0.4); }
          100% { box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); }
        }
      `}</style>
      {activeSosAlert && role === 'Admin' && (
        <section className="safety-panel" style={{ 
          background: '#ffdddd', 
          borderColor: '#ff5c5c', 
          color: '#8b0000', 
          margin: '0 0 20px 0',
          animation: 'sosPulse 1.5s infinite alternate',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(255, 0, 0, 0.15)'
        }}>
          <div>
            <span className="brand-mark" style={{ background: '#d32f2f', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '10px', verticalAlign: 'middle' }}>CRITICAL</span>
            <strong style={{ fontSize: '16px' }}>SOS Alert Raised!</strong>
            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
              Ride: <strong>{activeSosAlert.rideId || 'Unknown'}</strong> | Passenger: <strong>{activeSosAlert.passenger}</strong> | Route: <strong>{activeSosAlert.pickup} → {activeSosAlert.destination}</strong>
            </p>
            <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#b71c1c', fontWeight: 'bold' }}>
              🚨 SIMULATED POLICE BROADCAST: Dispatching Kochi Police Control Room Patrol Vehicle...
            </p>
          </div>
          <button className="danger" onClick={acknowledgeSos} style={{ padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Acknowledge & Mute
          </button>
        </section>
      )}

      {activePoorReview && role === 'Admin' && (
        <section className="safety-panel" style={{ 
          background: '#fff3cd', 
          borderColor: '#ffeeba', 
          color: '#856404', 
          margin: '0 0 20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderRadius: '8px',
          borderLeft: '5px solid #ffc107',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div>
            <strong>⚠️ Warning: Low Rating Received!</strong>
            <p style={{ margin: '5px 0 0', fontSize: '13px' }}>
              Ride: <strong>{activePoorReview.id}</strong> | Driver: <strong>{activePoorReview.driver?.name || 'Unassigned'}</strong> | Rating: <strong style={{ color: '#d32f2f' }}>{activePoorReview.rating}/5 stars</strong>
            </p>
            {activePoorReview.feedback && (
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                Feedback: "{activePoorReview.feedback}"
              </p>
            )}
          </div>
          <button className="primary" onClick={() => dismissPoorReview(activePoorReview.id)} style={{ padding: '6px 12px', background: '#856404', borderColor: '#856404', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Dismiss Alert
          </button>
        </section>
      )}

      {renderPage()}
    </>
  )
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
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setRating(5)
    setFeedback('')
    setSubmitted(false)
  }, [activeRide])

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (activeRide) {
      updateRideStatus(activeRide.id, 'Completed', { rating, feedback })
      setSubmitted(true)
    }
  }

  const showReviewForm = activeRide?.status === 'Completed' && role === 'Passenger' && (!activeRide.rating || activeRide.rating === 0) && !submitted

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

        {showReviewForm && (
          <div className="safety-panel compact-panel" style={{ background: '#f5fff5', borderColor: '#c2f0c2', marginTop: '15px' }}>
            <form onSubmit={handleReviewSubmit} style={{ width: '100%' }}>
              <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>Rate your ride</h3>
              <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: star <= rating ? '#ffb300' : '#ccc', padding: '0' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Write your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'none', height: '60px', boxSizing: 'border-box' }}
              />
              <button className="primary" type="submit" style={{ marginTop: '10px', background: '#2e7d32', borderColor: '#2e7d32', width: '100%' }}>
                Submit Review
              </button>
            </form>
          </div>
        )}

        {activeRide?.status === 'Completed' && activeRide.rating > 0 && (
          <div className="safety-panel compact-panel" style={{ background: '#f9f9f9', borderColor: '#ddd', marginTop: '15px' }}>
            <h3 style={{ color: '#666', margin: '0 0 5px 0' }}>Feedback Logged</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>Rating: {Array(activeRide.rating).fill('★').join('')} ({activeRide.rating}/5)</p>
            {activeRide.feedback && <p style={{ margin: '5px 0 0', fontStyle: 'italic', fontSize: '13px', color: '#555' }}>"{activeRide.feedback}"</p>}
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
  const completedRides = rides.filter((ride) => ride.status === 'Completed')
  const grossFares = completedRides.reduce((sum, ride) => sum + Number(ride.fare || 0), 0)
  const platformFee = Math.round(grossFares * 0.15)
  const takeHome = grossFares - platformFee

  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle label="Earnings Breakdown" value="15% Platform Fee" />
        <div className="metric-grid">
          <Metric label="Gross Fares" value={`Rs ${grossFares}`} />
          <Metric label="Platform Fee" value={`Rs ${platformFee}`} />
          <Metric label="Net Take-Home" value={`Rs ${takeHome}`} />
          <Metric label="My Rating" value={currentDriver?.rating || stats.avgRating} />
        </div>
      </section>
      <section className="panel span-2">
        <PanelTitle label="Completed trips" value="Payout ready" />
        <div className="ride-table" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {completedRides.map((ride) => (
            <article key={ride.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '10px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <strong>{ride.id}</strong>
              <span>{ride.pickup} → {ride.destination}</span>
              <span>Gross: Rs {ride.fare}</span>
              <span style={{ color: '#d32f2f' }}>Fee: -Rs {Math.round(ride.fare * 0.15)}</span>
              <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Net: Rs {Math.round(ride.fare * 0.85)}</span>
            </article>
          ))}
          {!completedRides.length && <EmptyState message="Completed ride records will appear here." />}
        </div>
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
          <Metric label="Total Fares" value={`Rs ${stats.revenue}`} />
          <Metric label="Platform Profit" value={`Rs ${stats.platformCommission}`} />
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

function SupportPage({ complaints, createSupportComplaint, sendSos, token, role, events }) {
  const isAdmin = role === 'Admin'
  const sosEvents = events ? events.filter((e) => e.type === 'sos:raised') : []

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

      {isAdmin ? (
        <section className="panel">
          <PanelTitle label="Police Dispatch Desk" value={`${sosEvents.length} emergencies`} />
          <div className="action-stack" style={{ maxHeight: '350px', overflowY: 'auto', gap: '15px' }}>
            <style>{`
              .police-log { border-left: 2px dashed #ff5c5c; padding-left: 10px; margin-top: 10px; }
              .police-log-item { font-size: 12px; margin-bottom: 8px; color: #555; }
              .police-log-item strong { color: #b71c1c; }
            `}</style>
            {sosEvents.map((event) => {
              const payload = event.payload
              const dispatchTime = new Date(payload.policeDispatchTime || Date.now()).toLocaleTimeString()
              const createdTime = new Date(event.createdAt).toLocaleTimeString()
              return (
                <div key={event.id} style={{ padding: '10px', border: '1px solid #ffd2d2', borderRadius: '6px', background: '#fff5f5' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#b71c1c' }}>🚨 SOS: {payload.rideId || 'General'}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}><strong>Passenger:</strong> {payload.passenger}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}><strong>Route:</strong> {payload.pickup} → {payload.destination}</p>
                  <div className="police-log">
                    <div className="police-log-item">[{createdTime}] 📡 SOS Signal Broadcasted.</div>
                    <div className="police-log-item">[{createdTime}] 🚔 Kochi Police Control Desk Pinged.</div>
                    <div className="police-log-item">[{dispatchTime}] 🚨 Patrol Car Dispatched to {payload.pickup}.</div>
                  </div>
                </div>
              )
            })}
            {!sosEvents.length && <EmptyState message="No police alerts logged." />}
          </div>
        </section>
      ) : (
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
      )}
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
