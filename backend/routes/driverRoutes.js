const driverController = require('../controllers/driverController')
const { readBody, send } = require('../utils/http')

async function handleDriverRoutes(req, res, url, user) {
  if (req.method === 'GET' && url.pathname === '/api/drivers') {
    return send(res, 200, driverController.listDrivers(user))
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/api/drivers/')) {
    const id = url.pathname.split('/').at(-1)
    const body = await readBody(req)
    return send(res, 200, driverController.updateDriver(id, body, user))
  }

  return false
}

module.exports = handleDriverRoutes
