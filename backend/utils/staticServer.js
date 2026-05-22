const fs = require('fs')
const path = require('path')
const env = require('../config/env')
const { send } = require('./http')

function serveStatic(requestPath, res) {
  if (!fs.existsSync(env.frontendDist)) {
    return send(res, 404, { error: 'Frontend build not found. Run npm run build from the project root.' })
  }

  const normalizedPath = decodeURIComponent(requestPath.split('?')[0])
  const relativePath = normalizedPath === '/' ? 'index.html' : normalizedPath.replace(/^\/+/, '')
  const candidatePath = path.resolve(env.frontendDist, relativePath)
  const distRoot = path.resolve(env.frontendDist)

  if (!candidatePath.startsWith(distRoot)) {
    return send(res, 403, { error: 'Forbidden' })
  }

  const filePath = fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()
    ? candidatePath
    : path.join(env.frontendDist, 'index.html')

  fs.readFile(filePath, (error, content) => {
    if (error) return send(res, 500, { error: 'Could not read frontend asset' })
    res.writeHead(200, { 'Content-Type': contentType(filePath) })
    res.end(content)
  })
}

function contentType(filePath) {
  const types = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }
  return types[path.extname(filePath)] || 'application/octet-stream'
}

module.exports = {
  serveStatic,
}
