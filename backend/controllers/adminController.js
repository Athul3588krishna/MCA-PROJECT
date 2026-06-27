const { db, saveDb } = require('../connect/database')

function getAnalytics() {
  const completed = db.rides.filter((ride) => ride.status === 'Completed')
  const revenue = completed.reduce((sum, ride) => sum + ride.fare, 0)
  const peakAreas = db.rides.reduce((areas, ride) => {
    areas[ride.pickup] = (areas[ride.pickup] || 0) + 1
    return areas
  }, {})

  const busiestArea = Object.entries(peakAreas).sort((a, b) => b[1] - a[1])[0]

  return {
    ridesToday: db.rides.length,
    monthlyRevenue: revenue,
    averageRating: completed.reduce((sum, ride) => sum + ride.rating, 0) / completed.length || 0,
    onlineDrivers: db.drivers.filter((driver) => driver.status === 'Online').length,
    pendingVerifications: db.drivers.filter((driver) => !driver.verified).length,
    peakBookingTime: busiestArea ? 'Based on current bookings' : 'No ride data yet',
    areaWiseRideStatistics: peakAreas,
    demandPrediction: Object.entries(peakAreas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area, count]) => ({
        area,
        demand: Math.min(100, count * 20),
        recommendation: `Review driver availability near ${area}`,
      })),
  }
}

function listComplaints() {
  return db.complaints
}

function createComplaint(body, user) {
  if (!body.title) throw Object.assign(new Error('title is required'), { status: 400 })

  const complaint = {
    id: `C-${Date.now()}`,
    title: body.title,
    owner: body.owner || user.role || 'Passenger',
    priority: body.priority || 'Medium',
    status: body.status || 'Open',
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  }

  db.complaints.unshift(complaint)
  saveDb()
  return complaint
}

module.exports = {
  createComplaint,
  getAnalytics,
  listComplaints,
}
