const rideController = require('../controllers/rideController')
const { readBody, send } = require('../utils/http')

async function handleRideRoutes(req, res, url, user) {
  if (req.method === 'GET' && url.pathname === '/api/rides') {
    return send(res, 200, rideController.listRides())
  }

  if (req.method === 'POST' && url.pathname === '/api/rides') {
    const body = await readBody(req)
    return send(res, 201, rideController.createRide(body, user))
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/api/rides/')) {
    const id = url.pathname.split('/').at(-1)
    const body = await readBody(req)
    return send(res, 200, rideController.updateRide(id, body))
  }

  return false
}

module.exports = handleRideRoutes
