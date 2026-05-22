const seedDb = {
  users: [],
  drivers: [
    { id: 'D-108', name: 'Arun Das', mobile: '+919876543210', auto: 'KL 07 CB 4231', area: 'Kakkanad', status: 'Online', verified: true, rating: 4.8, earnings: 2480 },
    { id: 'D-214', name: 'Nisha Varghese', mobile: '+919876543211', auto: 'KL 43 M 8891', area: 'Edappally', status: 'Online', verified: true, rating: 4.7, earnings: 3120 },
    { id: 'D-332', name: 'Rafiq P', mobile: '+919876543212', auto: 'KL 01 AQ 7732', area: 'Vyttila', status: 'Offline', verified: false, rating: 4.5, earnings: 1780 },
  ],
  rides: [
    { id: 'VR-2048', passenger: 'Meera Nair', pickup: 'Infopark Gate', destination: 'Vyttila Hub', driverId: 'D-108', fare: 186, distance: 8.9, status: 'On trip', rating: 5, createdAt: new Date().toISOString() },
    { id: 'VR-2047', passenger: 'Joel Mathew', pickup: 'CUSAT Metro', destination: 'Lulu Mall', driverId: 'D-214', fare: 128, distance: 5.4, status: 'Completed', rating: 4, createdAt: new Date().toISOString() },
  ],
  complaints: [
    { id: 'C-91', title: 'Late pickup', owner: 'Passenger', priority: 'Medium', status: 'Open' },
    { id: 'C-86', title: 'Payment mismatch', owner: 'Driver', priority: 'High', status: 'Review' },
  ],
  events: [],
}

module.exports = seedDb
