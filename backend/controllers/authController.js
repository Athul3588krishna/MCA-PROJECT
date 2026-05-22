const { db, saveDb } = require('../connect/database')
const { hashPassword, verifyPassword } = require('../utils/password')
const { signToken } = require('../utils/token')

function seedAdmin() {
  if (db.users.some((user) => user.id === 'U-ADMIN' || user.email === 'admin@varas.local')) return
  db.users.push({
    id: 'U-ADMIN',
    role: 'Admin',
    name: 'VARAS Admin',
    email: 'admin@varas.local',
    mobile: '+910000000000',
    password: hashPassword('varas@2026'),
  })
  saveDb()
}

function register(body) {
  const required = ['name', 'role', 'mobile', 'password']
  const missing = required.find((field) => !body[field])
  if (missing) throw Object.assign(new Error(`${missing} is required`), { status: 400 })

  const exists = db.users.some((user) => user.mobile === body.mobile || (body.email && user.email === body.email))
  if (exists) throw Object.assign(new Error('Account already exists'), { status: 409 })

  const user = {
    id: `U-${Date.now()}`,
    role: body.role,
    name: body.name,
    email: body.email || '',
    mobile: body.mobile,
    emergencyContact: body.emergencyContact || '',
    password: hashPassword(body.password),
  }

  db.users.push(user)
  saveDb()
  return publicUser(user, signToken(user))
}

function login(body) {
  const account = db.users.find((user) => user.mobile === body.identifier || user.email === body.identifier)
  if (!account || !verifyPassword(body.password || '', account.password)) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  return publicUser(account, signToken(account))
}

function publicUser(user, token) {
  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      emergencyContact: user.emergencyContact,
    },
  }
}

module.exports = {
  login,
  register,
  seedAdmin,
}
