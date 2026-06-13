const { db, saveDb } = require('../connect/database')
const { estimateFare } = require('../utils/fareCalculator')
const { pick } = require('../utils/object')
const { publish } = require('./eventController')

function listRides(user) {
  return db.rides.filter((ride) => canReadRide(ride, user)).map(hydrateRide)
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
    rating: 0,
    createdAt: new Date().toISOString(),
  }

  db.rides.unshift(ride)
  saveDb()
  publish('ride:requested', ride)
  return hydrateRide(ride)
}

function updateRide(id, body, user) {
  const ride = db.rides.find((item) => item.id === id)
  if (!ride) throw Object.assign(new Error('Ride not found'), { status: 404 })
  if (!canUpdateRide(ride, user)) throw Object.assign(new Error('Ride access denied'), { status: 403 })

  const allowedFields = user.role === 'Passenger' ? ['rating', 'feedback'] : ['status', 'driverId', 'rating', 'feedback']
  Object.assign(ride, pick(body, allowedFields))
  saveDb()
  publish('ride:updated', ride)
  return hydrateRide(ride)
}

function hydrateRide(ride) {
  return {
    ...ride,
    driver: db.drivers.find((driver) => driver.id === ride.driverId) || null,
  }
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
