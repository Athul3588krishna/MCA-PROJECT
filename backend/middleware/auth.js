const { db } = require('../connect/database')
const { verifyToken } = require('../utils/token')

function authenticate(req) {
  const header = req.headers.authorization || ''
  const token = header.replace('Bearer ', '')
  if (!token) throw Object.assign(new Error('Authentication required'), { status: 401 })

  const payload = verifyToken(token)
  const user = db.users.find((item) => item.id === payload.sub)
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 })
  return user
}

module.exports = {
  authenticate,
}
