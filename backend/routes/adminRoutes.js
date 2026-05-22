const adminController = require('../controllers/adminController')
const { send } = require('../utils/http')

async function handleAdminRoutes(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/admin/analytics') {
    return send(res, 200, adminController.getAnalytics())
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/complaints') {
    return send(res, 200, adminController.listComplaints())
  }

  return false
}

module.exports = handleAdminRoutes
