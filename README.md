# VARAS 2.0 - Verified Auto Ride Assistance System

VARAS 2.0 is a native, web-based Auto-Rickshaw Hailing and Safety Management platform designed as an academic project for the Master of Computer Applications (MCA) curriculum. The system offers dedicated workspaces for Passengers, Drivers, and Administrators, with a strong focus on passenger safety, secure data flow, and transparent platform monetization.

---

## 🚀 Key Features

### 1. Multi-Role Workspaces
- **Passenger**: Sign up, book rides, view estimated fares, track active rides, share OTPs, raise SOS alarms, leave feedback/ratings, and view history.
- **Driver**: Apply for verification, toggle online status, accept/reject rides, enter passenger OTPs to start trips, track daily gross/net earnings, and update vehicle/route profiles.
- **Administrator**: Approve/verify drivers, monitor active rides, resolve complaints, review analytics, track platform profits, and handle critical SOS emergencies.

### 2. Secure Ride Start (OTP Verification)
- To prevent driver-side fraud and ensure passengers board the correct vehicle, the backend generates a random **4-digit OTP** upon booking.
- **Security Data Masking**: The OTP is stripped from the driver's API responses until verified, meaning the driver must physically ask the passenger for the code.
- The driver enters the OTP into the dashboard, which verifies it against the backend to transition the ride status from `Accepted` to `On trip`.

### 3. Real-Time SOS Alarm & Simulated Police Dispatch
- Passengers can trigger an **SOS Alert** during a ride.
- The Admin dashboard immediately responds by:
  - Sounding a **wailing police siren** synthesized dynamically using the browser's native **Web Audio API** (requires no external files).
  - Flashing a critical red banner displaying passenger, vehicle, and route details.
  - Generating a **Simulated Police Control Room Dispatch timeline** in the Admin support desk showing automated patrol dispatches.

### 4. Monetization Engine (15% Platform Commission)
- Demonstrates a practical business model by charging a **15% platform commission fee** on all completed trips.
- **Admin Console**: Displays the platform's net profit ("Platform Profit") separately from gross fares.
- **Driver Console**: Displays a granular financial ledger showing **Gross Fares**, **Platform Fees deducted**, and **Net Take-Home Earnings (85%)** for every trip.

### 5. Passenger Review & Warning Desk
- Upon ride completion, passengers can rate their ride (1 to 5 stars) and type text feedback.
- If a passenger leaves a **low rating (1 or 2 stars)**, a warning banner immediately flashes on the Admin panel showing the feedback and driver details for immediate quality control.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite (overridden with Rolldown-Vite for lightning-fast bundling), Vanilla CSS3 (no styling frameworks for clean layout control).
- **Backend**: Native Node.js HTTP Module (no Express/Koa framework, demonstrating raw routing and server socket programming depth), JWT-based auth, REST API.
- **Database**: Local File-System JSON Database (`data.json`) with synchronous read/write persistence.
- **Security**: PBKDF2 cryptography with unique salt generation for password hashing.

---

## 📂 Project Structure

```text
MCA-PROJECT/
├── backend/
│   ├── config/env.js          # Environment configuration loaders
│   ├── connect/database.js    # JSON database helper (loadDb/saveDb)
│   ├── controllers/           # Business logic (auth, rides, drivers, SOS)
│   ├── middleware/auth.js     # JWT validation middleware
│   ├── routes/                # Native routing layer (API routing handlers)
│   ├── utils/                 # Utilities (hashing, static server, fare calc)
│   ├── index.js               # Entry point (HTTP Server)
│   └── data.json              # Persistent mock database
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AppPages.jsx   # Role dashboards, review panels & SOS banners
│   │   │   ├── PublicHome.jsx # Landing page (Passenger & Driver portals)
│   │   │   └── RoleAuthPage.js# Login & registration forms
│   │   ├── App.jsx            # Main app shell, sync states, siren synth
│   │   ├── main.jsx           # React mount point
│   │   └── App.css            # Styles
│   ├── vite.config.js         # Bundler config
│   └── package.json           # Frontend configs & scripts
├── package.json               # Root monorepo workspace configurations
└── README.md                  # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js version **18.x** or higher.

### 1. Install Dependencies
Run the installation script in the root directory to install packages for both frontend and backend directories:
```bash
npm run install:all
```

### 2. Configure Environment variables
Create a `.env` file in the `backend/` directory (you can copy values from `backend/.env.example`):
```ini
NODE_ENV=development
PORT=4000
JWT_SECRET=local-dev-secret
ADMIN_EMAIL=admin@example.com
ADMIN_MOBILE=+910000000000
ADMIN_NAME=VARAS Admin
ADMIN_PASSWORD=admin123
DATA_FILE=./data.json
FRONTEND_DIST=../frontend/dist
```

### 3. Build the Frontend
Compile the production-ready React build served statically by the backend:
```bash
npm run build
```

### 4. Start the Application
Start the backend server:
```bash
npm start
```
The application will be running on **[http://localhost:4000](http://localhost:4000)**.

---

## 🔒 Accessing the Admin Console
For security and a professional, uncluttered layout, there is no public Admin Login button on the landing page.
To log in as the Admin:
1. Navigate to **`http://localhost:4000/#admin`**.
2. The page will immediately load the Admin login screen and clear the hash.
3. Log in using your configured admin credentials (e.g. `admin@example.com` / `admin123`).
