const adminController = require('../controllers/adminController')
const sosController = require('../controllers/sosController')
const { readBody, send } = require('../utils/http')

async function handleSupportRoutes(req, res, url, user) {
  if (req.method === 'POST' && url.pathname === '/api/sos') {
    const body = await readBody(req)
    return send(res, 201, sosController.raiseSos(body))
  }

  if (req.method === 'POST' && url.pathname === '/api/support/complaints') {
    const body = await readBody(req)
    return send(res, 201, adminController.createComplaint(body, user))
  }

  return false
}

module.exports = handleSupportRoutes
