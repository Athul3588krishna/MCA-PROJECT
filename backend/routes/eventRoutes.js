const eventController = require('../controllers/eventController')
const { send } = require('../utils/http')

async function handleEventRoutes(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/events') {
    return send(res, 200, eventController.listEvents())
  }

  return false
}

module.exports = handleEventRoutes
