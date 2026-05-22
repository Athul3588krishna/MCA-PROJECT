const http = require('http')
const { URL } = require('url')
const env = require('./config/env')
const { seedAdmin } = require('./controllers/authController')
const { handleApiRoutes } = require('./routes')
const { send } = require('./utils/http')
const { serveStatic } = require('./utils/staticServer')

seedAdmin()

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    return send(res, 204)
  }

  try {
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRoutes(req, res, url)
    }

    if (req.method === 'GET') {
      return serveStatic(url.pathname, res)
    }

    return send(res, 404, { error: 'Route not found' })
  } catch (error) {
    const status = error.status || 500
    return send(res, status, { error: error.message || 'Server error' })
  }
})

server.listen(env.port, () => {
  console.log(`VARAS 2.0 API running on http://localhost:${env.port}`)
})
