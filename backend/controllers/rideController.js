const { db, saveDb } = require('../connect/database')
const { estimateFare } = require('../utils/fareCalculator')
const { pick } = require('../utils/object')
const { publish } = require('./eventController')

function listRides(user) {
  return db.rides.filter((ride) => canReadRide(ride, user)).map((ride) => sanitizeRide(ride, user))
}

function createRide(body, user) {
  const required = ['pickup', 'destination']
  const missing = required.find((field) => !body[field])
  if (missing) throw Object.assign(new Error(`${missing} is required`), { status: 400 })

  const distance = Number(body.distance || 1)
  if (!Number.isFinite(distance) || distance <= 0) {
    throw Object.assign(new Error('distance must be a positive number'), { status: 400 })
  }

  const peak = Boolean(body.peak)
  const driver = allocateDriver(body.pickup)
  const ride = {
    id: `VR-${2050 + db.rides.length}`,
    passengerId: user.id,
    passenger: body.passenger || user.name || 'Passenger',
    pickup: body.pickup,
    destination: body.destination,
    driverId: driver?.id || null,
    fare: estimateFare(distance, peak),
    distance,
    status: driver ? 'Accepted' : 'Searching',
    otp: Math.floor(1000 + Math.random() * 9000).toString(),
    rating: 0,
    createdAt: new Date().toISOString(),
  }

  db.rides.unshift(ride)
  saveDb()
  publish('ride:requested', ride)
  return sanitizeRide(ride, user)
}

function updateRide(id, body, user) {
  const ride = db.rides.find((item) => item.id === id)
  if (!ride) throw Object.assign(new Error('Ride not found'), { status: 404 })
  if (!canUpdateRide(ride, user)) throw Object.assign(new Error('Ride access denied'), { status: 403 })

  const allowedFields = user.role === 'Passenger' ? ['rating', 'feedback'] : ['status', 'driverId', 'rating', 'feedback']
  const updates = pick(body, allowedFields)

  if (user.role === 'Driver') {
    const driver = db.drivers.find((item) => item.userId === user.id || item.mobile === user.mobile)
    if (driver) {
      if (updates.status === 'Accepted' && !ride.driverId) {
        updates.driverId = driver.id
      }
    }
  }

  if (updates.status === 'On trip') {
    if (user.role === 'Driver') {
      if (body.otp !== ride.otp) {
        throw Object.assign(new Error('Invalid Ride OTP'), { status: 400 })
      }
    }
  }

  if (updates.status === 'Completed' && ride.status !== 'Completed' && ride.driverId) {
    const driver = db.drivers.find((d) => d.id === ride.driverId)
    if (driver) {
      driver.earnings = (driver.earnings || 0) + ride.fare
    }
  }

  if (updates.rating && updates.rating !== ride.rating && ride.driverId) {
    const driver = db.drivers.find((d) => d.id === ride.driverId)
    if (driver) {
      const driverRides = db.rides.filter((r) => r.driverId === driver.id && r.id !== ride.id)
      const allRatings = driverRides.map((r) => r.rating).filter((r) => r > 0)
      allRatings.push(updates.rating)
      const avgRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      driver.rating = Number(avgRating.toFixed(1))
    }
  }

  Object.assign(ride, updates)
  saveDb()
  publish('ride:updated', ride)
  return sanitizeRide(ride, user)
}

function hydrateRide(ride) {
  return {
    ...ride,
    driver: db.drivers.find((driver) => driver.id === ride.driverId) || null,
  }
}

function sanitizeRide(ride, user) {
  const hydrated = hydrateRide(ride)
  if (user && user.role === 'Driver' && ride.status === 'Accepted') {
    const { otp, ...sanitized } = hydrated
    return sanitized
  }
  return hydrated
}

function allocateDriver(pickup = '') {
  const online = db.drivers.filter((driver) => driver.status === 'Online' && driver.verified)
  return online.find((driver) => pickup.toLowerCase().includes(driver.area.toLowerCase())) || online[0]
}

function canReadRide(ride, user) {
  if (user.role === 'Admin') return true
  if (user.role === 'Passenger') return ride.passengerId === user.id || (!ride.passengerId && ride.passenger === user.name)
  if (user.role === 'Driver') {
    const driver = db.drivers.find((item) => item.userId === user.id || item.mobile === user.mobile)
    return driver ? ride.driverId === driver.id || (!ride.driverId && ride.status === 'Searching') : false
  }
  return false
}

function canUpdateRide(ride, user) {
  if (user.role === 'Admin') return true
  if (user.role === 'Passenger') return ride.passengerId === user.id
  if (user.role === 'Driver') {
    const driver = db.drivers.find((item) => item.userId === user.id || item.mobile === user.mobile)
    return driver ? ride.driverId === driver.id || (!ride.driverId && ride.status === 'Searching') : false
  }
  return false
}

module.exports = {
  createRide,
  listRides,
  updateRide,
}
