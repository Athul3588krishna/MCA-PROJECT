const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

function resolvePath(value, fallback) {
  if (!value) return fallback
  return path.isAbsolute(value) ? value : path.resolve(__dirname, '..', value)
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'varas-demo-secret',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@varas.local',
  adminMobile: process.env.ADMIN_MOBILE || '+910000000000',
  adminName: process.env.ADMIN_NAME || 'VARAS Admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'varas@2026',
  dataFile: resolvePath(process.env.DATA_FILE, path.join(__dirname, '..', 'data.json')),
  frontendDist: resolvePath(process.env.FRONTEND_DIST, path.join(__dirname, '..', '..', 'frontend', 'dist')),
}

if (env.nodeEnv === 'production') {
  const missing = []
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'varas-demo-secret') missing.push('JWT_SECRET')
  if (!process.env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL')
  if (!process.env.ADMIN_MOBILE) missing.push('ADMIN_MOBILE')
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'varas@2026') missing.push('ADMIN_PASSWORD')

  if (missing.length) {
    throw new Error(`Missing secure production environment values: ${missing.join(', ')}`)
  }
}

module.exports = env
