const { db, saveDb } = require('../connect/database')

function listEvents() {
  return db.events.slice(-20)
}

function publish(type, payload) {
  db.events.push({ id: `EV-${Date.now()}`, type, payload, createdAt: new Date().toISOString() })
  saveDb()
}

module.exports = {
  listEvents,
  publish,
}
