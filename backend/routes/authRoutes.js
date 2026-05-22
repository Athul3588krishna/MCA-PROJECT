const authController = require('../controllers/authController')
const { readBody, send } = require('../utils/http')

async function handleAuthRoutes(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    const body = await readBody(req)
    return send(res, 201, authController.register(body))
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(req)
    return send(res, 200, authController.login(body))
  }

  return false
}

module.exports = handleAuthRoutes
