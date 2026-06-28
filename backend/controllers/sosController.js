const { publish } = require('./eventController')

function raiseSos(body) {
  const alert = { 
    id: `SOS-${Date.now()}`, 
    ...body, 
    policeStatus: 'Notified',
    policeDispatchTime: new Date(Date.now() + 5000).toISOString(),
    createdAt: new Date().toISOString() 
  }
  publish('sos:raised', alert)
  return alert
}

module.exports = {
  raiseSos,
}
