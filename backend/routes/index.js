const { authenticate } = require('../middleware/auth')
const { send } = require('../utils/http')
const handleAdminRoutes = require('./adminRoutes')
const handleAuthRoutes = require('./authRoutes')
const handleDriverRoutes = require('./driverRoutes')
const handleEventRoutes = require('./eventRoutes')
const handleRideRoutes = require('./rideRoutes')
const handleSupportRoutes = require('./supportRoutes')

async function handleApiRoutes(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { status: 'ok', service: 'VARAS 2.0 API' })
  }

  const publicResponse = await handleAuthRoutes(req, res, url)
  if (publicResponse !== false) return publicResponse

  const user = authenticate(req)
  const routeHandlers = [
    (request, response, requestUrl) => handleRideRoutes(request, response, requestUrl, user),
    (request, response, requestUrl) => handleSupportRoutes(request, response, requestUrl, user),
    handleDriverRoutes,
    handleAdminRoutes,
    handleEventRoutes,
  ]

  for (const handleRoute of routeHandlers) {
    const handled = await handleRoute(req, res, url)
    if (handled !== false) return handled
  }

  return send(res, 404, { error: 'Route not found' })
}

module.exports = {
  handleApiRoutes,
}
