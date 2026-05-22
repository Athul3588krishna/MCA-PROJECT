const sosController = require('../controllers/sosController')
const { readBody, send } = require('../utils/http')

async function handleSupportRoutes(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/sos') {
    const body = await readBody(req)
    return send(res, 201, sosController.raiseSos(body))
  }

  return false
}

module.exports = handleSupportRoutes
