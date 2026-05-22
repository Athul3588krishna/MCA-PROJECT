const { db, saveDb } = require('../connect/database')
const { pick } = require('../utils/object')
const { publish } = require('./eventController')

function listDrivers() {
  return db.drivers
}

function updateDriver(id, body) {
  const driver = db.drivers.find((item) => item.id === id)
  if (!driver) throw Object.assign(new Error('Driver not found'), { status: 404 })

  Object.assign(driver, pick(body, ['status', 'verified', 'area']))
  saveDb()
  publish('driver:updated', driver)
  return driver
}

module.exports = {
  listDrivers,
  updateDriver,
}
