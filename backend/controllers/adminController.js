const { db } = require('../connect/database')

function getAnalytics() {
  const completed = db.rides.filter((ride) => ride.status === 'Completed')
  const revenue = db.rides.reduce((sum, ride) => sum + ride.fare, 0)
  const peakAreas = db.rides.reduce((areas, ride) => {
    areas[ride.pickup] = (areas[ride.pickup] || 0) + 1
    return areas
  }, {})

  return {
    ridesToday: db.rides.length,
    monthlyRevenue: revenue,
    averageRating: completed.reduce((sum, ride) => sum + ride.rating, 0) / completed.length || 0,
    onlineDrivers: db.drivers.filter((driver) => driver.status === 'Online').length,
    pendingVerifications: db.drivers.filter((driver) => !driver.verified).length,
    peakBookingTime: '08:00 AM - 10:00 AM',
    areaWiseRideStatistics: peakAreas,
    demandPrediction: [
      { area: 'Infopark', demand: 92, recommendation: 'Move 3 drivers nearby' },
      { area: 'Vyttila', demand: 81, recommendation: 'Keep surge at 1.2x' },
      { area: 'Edappally', demand: 76, recommendation: 'Notify idle drivers' },
    ],
  }
}

function listComplaints() {
  return db.complaints
}

module.exports = {
  getAnalytics,
  listComplaints,
}
