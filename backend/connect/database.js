const fs = require('fs')
const env = require('../config/env')
const seedDb = require('./seed')

const db = loadDb()

function loadDb() {
  try {
    if (!fs.existsSync(env.dataFile)) return clone(seedDb)
    const parsed = JSON.parse(fs.readFileSync(env.dataFile, 'utf8'))

    return {
      ...clone(seedDb),
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers : [],
      rides: Array.isArray(parsed.rides) ? parsed.rides : [],
      complaints: Array.isArray(parsed.complaints) ? parsed.complaints : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch (error) {
    console.warn(`Could not load ${env.dataFile}: ${error.message}`)
    return clone(seedDb)
  }
}

function saveDb() {
  try {
    fs.writeFileSync(env.dataFile, JSON.stringify(db, null, 2))
  } catch (error) {
    console.warn(`Could not save ${env.dataFile}: ${error.message}`)
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

module.exports = {
  db,
  saveDb,
}
