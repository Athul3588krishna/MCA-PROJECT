const { publish } = require('./eventController')

function raiseSos(body) {
  const alert = { id: `SOS-${Date.now()}`, ...body, createdAt: new Date().toISOString() }
  publish('sos:raised', alert)
  return alert
}

module.exports = {
  raiseSos,
}
