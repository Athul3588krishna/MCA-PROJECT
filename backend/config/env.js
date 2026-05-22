const path = require('path')
const loadEnv = require('./loadEnv')

loadEnv()

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'varas-demo-secret',
  dataFile: process.env.DATA_FILE || path.join(__dirname, '..', 'data.json'),
  frontendDist: process.env.FRONTEND_DIST || path.join(__dirname, '..', '..', 'frontend', 'dist'),
}

module.exports = env
