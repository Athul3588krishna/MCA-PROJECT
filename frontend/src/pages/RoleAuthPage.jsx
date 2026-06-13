import { useEffect, useState } from 'react'

const roles = ['Passenger', 'Driver', 'Admin']

function RoleAuthPage({ loading, notice, onAuth, onBack, role, setRole }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(() => defaultAuthForm(role))

  useEffect(() => {
    setMode('login')
    setForm(defaultAuthForm(role))
  }, [role])

  const canRegister = role !== 'Admin'
  const isRegister = mode === 'register'

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onAuth({
      mode,
      identifier: form.identifier,
      password: form.password,
      name: form.name,
      mobile: form.mobile || form.identifier,
      email: form.email,
    })
  }

  return (
    <main className="auth-page">
      <section className="auth-hero-panel">
        <button className="text-button back-button" onClick={onBack}>Back to home</button>
        <p className="eyebrow">Secure {role} access</p>
        <h1>{authHeadline(role, isRegister)}</h1>
        <p>{roleDescription(role)}</p>
        <div className="auth-benefits">
          {authBenefits(role).map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="role-tabs auth-role-tabs">
          {roles.map((item) => (
            <button className={role === item ? 'active' : ''} key={item} onClick={() => setRole(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="auth-mode-row">
          <button className={!isRegister ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          {canRegister && <button className={isRegister ? 'active' : ''} onClick={() => setMode('register')}>{role === 'Driver' ? 'Apply' : 'Signup'}</button>}
        </div>

        <form className="professional-form" onSubmit={submit}>
          {isRegister && (
            <>
              <label>
                Full name
                <input value={form.name} onChange={(event) => update('name', event.target.value)} required />
              </label>
              <label>
                Mobile number
                <input value={form.mobile} onChange={(event) => update('mobile', event.target.value)} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
              </label>
            </>
          )}

          {!isRegister && (
            <label>
              Mobile / Email
              <input value={form.identifier} onChange={(event) => update('identifier', event.target.value)} required />
            </label>
          )}

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
          </label>

          {role === 'Driver' && isRegister && (
            <div className="driver-application-note">
              Vehicle verification and route allocation are reviewed by the admin dashboard after signup.
            </div>
          )}

          <button className="primary wide" disabled={loading} type="submit">
            {isRegister ? (role === 'Driver' ? 'Submit driver application' : 'Create passenger account') : `Login as ${role}`}
          </button>
        </form>

        <div className="auth-helper">
          <p>{notice}</p>
        </div>
      </section>
    </main>
  )
}

function defaultAuthForm(role) {
  if (role === 'Admin') {
    return {
      identifier: '',
      password: '',
      name: '',
      mobile: '',
      email: '',
    }
  }

  if (role === 'Driver') {
    return {
      identifier: '',
      password: '',
      name: '',
      mobile: '',
      email: '',
    }
  }

  return {
    identifier: '',
    password: '',
    name: '',
    mobile: '',
    email: '',
  }
}

function roleDescription(role) {
  return {
    Passenger: 'Signup, book autos, track your live ride, view trip history, and raise SOS or support requests.',
    Driver: 'Login or apply as a verified auto partner, manage requests, update availability, and track earnings.',
    Admin: 'Monitor rides, verify drivers, review complaints, analyze demand, and control platform operations.',
  }[role]
}

function authHeadline(role, isRegister) {
  if (role === 'Admin') return 'Control the complete VARAS operation desk.'
  if (role === 'Driver' && isRegister) return 'Apply as a verified driver partner.'
  if (role === 'Driver') return 'Manage ride requests and earnings.'
  if (isRegister) return 'Create your passenger account.'
  return 'Login to book and track your ride.'
}

function authBenefits(role) {
  return {
    Passenger: ['Fast booking', 'Live tracking', 'SOS support', 'Trip history'],
    Driver: ['Request queue', 'Availability control', 'Earnings view', 'Verification status'],
    Admin: ['Driver verification', 'Demand analytics', 'Complaint desk', 'Ride monitoring'],
  }[role]
}

export default RoleAuthPage
