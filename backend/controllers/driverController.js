const { db, saveDb } = require('../connect/database')
const { pick } = require('../utils/object')
const { publish } = require('./eventController')

function listDrivers(user) {
  if (user.role === 'Admin') return db.drivers
  if (user.role === 'Driver') return db.drivers.filter((driver) => driver.userId === user.id || driver.mobile === user.mobile)
  return db.drivers
    .filter((driver) => driver.status === 'Online' && driver.verified)
    .map(({ mobile, earnings, userId, ...driver }) => driver)
}

function updateDriver(id, body, user) {
  const driver = db.drivers.find((item) => item.id === id)
  if (!driver) throw Object.assign(new Error('Driver not found'), { status: 404 })
  const ownsDriverProfile = user.role === 'Driver' && (driver.userId === user.id || driver.mobile === user.mobile)
  if (user.role !== 'Admin' && !ownsDriverProfile) {
    throw Object.assign(new Error('Driver access denied'), { status: 403 })
  }

  const allowedFields = user.role === 'Admin' ? ['status', 'verified', 'area', 'auto'] : ['status', 'area', 'auto']
  Object.assign(driver, pick(body, allowedFields))
  saveDb()
  publish('driver:updated', driver)
  return driver
}

module.exports = {
  listDrivers,
  updateDriver,
}
