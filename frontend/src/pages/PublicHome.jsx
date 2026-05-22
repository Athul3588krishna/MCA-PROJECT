const roles = ['Passenger', 'Driver', 'Admin']

function PublicHome({ onSelectRole, stats }) {
  return (
    <main className="home-page">
      <header className="home-nav">
        <div className="brand-block">
          <span className="brand-mark">V</span>
          <div>
            <p className="eyebrow">VARAS 2.0</p>
            <strong>Verified Auto Ride Assistance System</strong>
          </div>
        </div>
        <div className="home-nav-actions">
          <button onClick={() => onSelectRole('Passenger')}>Passenger Login</button>
          <button className="primary" onClick={() => onSelectRole('Admin')}>Admin Login</button>
        </div>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Kochi auto ride platform</p>
          <h1>Book, track, manage, and monitor auto rides from one trusted system.</h1>
          <p>
            A complete ride booking dashboard for passengers, drivers, and administrators with live ride status,
            smart fare estimation, driver verification, support tickets, SOS alerts, and analytics.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onSelectRole('Passenger')}>Book as passenger</button>
            <button onClick={() => onSelectRole('Driver')}>Join as driver</button>
            <button onClick={() => onSelectRole('Admin')}>Admin console</button>
          </div>
        </div>

        <div className="hero-visual" aria-label="VARAS live operation preview">
          <div className="hero-map">
            <span className="map-road road-a" />
            <span className="map-road road-b" />
            <span className="route-line" />
            <span className="pin pickup">P</span>
            <span className="pin destination">D</span>
            <span className="auto-marker marker-0">A</span>
            <span className="auto-marker marker-1">A</span>
          </div>
          <div className="hero-stat-row">
            <Metric label="Rides" value={stats.rides} />
            <Metric label="Online drivers" value={stats.onlineDrivers} />
            <Metric label="Rating" value={stats.avgRating} />
          </div>
        </div>
      </section>

      <section className="role-gateway" aria-label="Choose login type">
        {roles.map((item) => (
          <article key={item}>
            <span>{navIcon(item === 'Passenger' ? 'Book Ride' : item === 'Driver' ? 'Vehicle' : 'Analytics')}</span>
            <h3>{item}</h3>
            <p>{roleDescription(item)}</p>
            <div className="button-row">
              <button className="primary" onClick={() => onSelectRole(item)}>{item} access</button>
            </div>
          </article>
        ))}
      </section>
    </main>
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

function navIcon(page) {
  return {
    'Book Ride': '+',
    Vehicle: 'A',
    Analytics: '%',
  }[page]
}

function roleDescription(role) {
  return {
    Passenger: 'Signup, book autos, track your live ride, view trip history, and raise SOS or support requests.',
    Driver: 'Login or apply as a verified auto partner, manage requests, update availability, and track earnings.',
    Admin: 'Monitor rides, verify drivers, review complaints, analyze demand, and control platform operations.',
  }[role]
}

export default PublicHome
