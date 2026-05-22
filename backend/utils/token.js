const crypto = require('crypto')
const env = require('../config/env')

function signToken(user) {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' })
  const payload = base64Url({ sub: user.id, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 8 })
  const signature = crypto.createHmac('sha256', env.jwtSecret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

function verifyToken(token) {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw Object.assign(new Error('Invalid token'), { status: 401 })
  }

  const expected = crypto.createHmac('sha256', env.jwtSecret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url')
  if (signature !== expected) throw Object.assign(new Error('Invalid token'), { status: 401 })

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
  if (payload.exp < Date.now()) throw Object.assign(new Error('Token expired'), { status: 401 })
  return payload
}

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

module.exports = {
  signToken,
  verifyToken,
}
