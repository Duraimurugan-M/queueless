# 🏥 QueueLess — Smart Hospital Token Management System

Website Link: https://queueless-hospital.vercel.app/

> A full-stack MERN application for digitizing hospital patient flow with real-time queue tracking, role-based dashboards, smart token booking, email automation, and PDF prescriptions.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Roles](#roles)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [System Flow](#system-flow)

---

## Project Overview

QueueLess replaces paper-based hospital tokens with a smart digital system. Patients book slots online, track their queue position in real time, and receive prescriptions via email as PDFs. Doctors manage their daily schedule and patient queue from a dedicated dashboard. The hospital MD (Admin) creates departments, doctor accounts, and monitors analytics.

---

## Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express.js | REST API server |
| MongoDB Atlas + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Nodemailer + Brevo SMTP | Email delivery |
| PDFKit | Prescription & token PDF generation |

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS v3 | Styling |
| React Router v6 | Client-side routing |
| Axios | API communication |
| js-cookie | JWT storage |
| react-hot-toast | Notifications |
| Chart.js + react-chartjs-2 | Analytics charts |
| qrcode.react | QR code generation |
| react-icons | Icon library |

---

## Roles

| Role | Access | Created By |
|------|--------|------------|
| **PATIENT** | Register/Login, Book tokens, Track queue, Download prescriptions | Self-register |
| **DOCTOR** | Manage schedule, View queue, Complete tokens, Write prescriptions | MD (Admin) |
| **MD** | Create departments/doctors, View analytics | Seeded manually |

---

## Features

- ✅ JWT authentication with role-based route protection
- ✅ Patient self-registration with email verification
- ✅ Smart token booking (Department → Doctor → Date → Slot)
- ✅ Real-time queue tracking with position and status
- ✅ QR-coded tokens shown after booking
- ✅ Doctor schedule creation with auto slot generation
- ✅ Prescription creation with medicines, timing, food instructions
- ✅ PDF generation for tokens and prescriptions (PDFKit)
- ✅ Email automation (welcome, OTP, booking, cancellation, prescription)
- ✅ MD analytics dashboard (Pie + Bar charts)
- ✅ Forgot password with 6-digit OTP (5 min expiry)
- ✅ Mobile responsive design
- ✅ Token cancellation with email notification

---

## Project Structure

```
queueless/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── constants/       # Role constants
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/       # Auth + Role guards
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── utils/           # Email, PDF, slots generator
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance + endpoints
    │   ├── context/         # Auth context
    │   ├── layouts/         # Dashboard layout with sidebar
    │   ├── pages/
    │   │   ├── auth/        # Login, Register, ForgotPassword
    │   │   ├── home/        # Landing page
    │   │   ├── patient/     # Patient dashboard, book, history, profile
    │   │   ├── doctor/      # Doctor dashboard, schedule, queue
    │   │   └── md/          # MD dashboard, departments, doctors
    │   └── utils/           # JWT decode helper
    ├── .env.example
    └── package.json
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- Brevo account (free SMTP for emails)

---

### 1. Clone / Extract Project

```bash
# Extract the zip or clone
cd queueless
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values (see Environment Variables section)
nano .env
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit if your backend runs on a different port
nano .env
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/queueless?retryWrites=true&w=majority

# JWT Secret — use a long random string in production
JWT_SECRET=your_super_secret_jwt_key_here

# Brevo SMTP (get from brevo.com → SMTP & API → SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login_email@example.com
SMTP_PASS=your_brevo_smtp_key

EMAIL_FROM=noreply@queueless.com
EMAIL_FROM_NAME=QueueLess Hospital

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Running the Application

### Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Start backend in production
cd backend
NODE_ENV=production npm start
```

---

## Seeding the MD Account

The MD (Admin) account must be created directly in MongoDB (no public registration for MD/Doctor):

```js
// Run in MongoDB shell or Compass
db.users.insertOne({
  name: "Hospital Admin",
  mobile: "9000000000",
  email: "admin@hospital.com",
  password: "<bcrypt_hash_of_your_password>",
  role: "MD",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use a seed script (create `backend/src/seed.js`):

```js
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./src/models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  const hash = await bcrypt.hash('admin123', 10)
  await User.create({ name: 'Admin', mobile: '9000000000', email: 'admin@hospital.com', password: hash, role: 'MD' })
  console.log('MD created: mobile=9000000000, password=admin123')
  process.exit(0)
}
seed()
```

Run: `node src/seed.js`

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register patient |
| POST | `/login` | Login (all roles, email or mobile) |
| POST | `/forgot-password` | Send OTP to email |
| POST | `/reset-password` | Reset with OTP |

### Patient (`/api/patient`) — PATIENT role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/slots?doctorId=&date=` | Get available slots (returns scheduleId) |
| POST | `/book-token` | Book a token |
| PATCH | `/cancel-token/:tokenId` | Cancel a token |
| GET | `/visit-history` | All past visits |

### Token (`/api/token`) — Authenticated
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:tokenId` | Get token by ID |
| GET | `/my/all` | All my tokens (PATIENT) |
| GET | `/pdf/:tokenId` | Download token PDF |

### Doctor (`/api/doctor`) — DOCTOR role
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/schedule` | Create daily schedule |
| GET | `/schedule?date=` | Get schedule for date |
| GET | `/queue` | Today's patient queue |
| PATCH | `/complete-token/:tokenId` | Mark token completed |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create prescription (DOCTOR) |
| GET | `/:id/pdf` | Download prescription PDF (DOCTOR/PATIENT) |

### MD (`/api/md`) — MD role
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/department` | Create department |
| GET | `/departments` | List all departments |
| POST | `/doctor` | Create doctor account |
| GET | `/doctors` | List all doctors |

### Analytics (`/api/analytics`) — Authenticated
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctor/today` | Doctor's daily stats |
| GET | `/md/today` | Hospital-wide stats |

---

## System Flow

```
Patient registers
      ↓
MD creates department + doctor account
      ↓
Doctor creates daily schedule (slots auto-generated)
      ↓
Patient books token (dept → doctor → date → slot)
      ↓
Patient gets token number + QR code + email confirmation
      ↓
Patient tracks live queue (token status)
      ↓
Doctor views queue → marks token COMPLETED
      ↓
Doctor creates prescription (medicines, diagnosis)
      ↓
Patient receives prescription via email
      ↓
Patient downloads prescription PDF
      ↓
MD monitors analytics dashboard
```

---

## Backend Fix Applied

The `GET /patient/slots` endpoint was updated to include `scheduleId` in each slot object. This is required by the frontend booking flow to correctly call `POST /patient/book-token`.

**Changed in:** `backend/src/controllers/patientController.js`

```js
// Before
res.json(availableSlots)

// After — each slot now includes scheduleId
const availableSlots = schedule.slots
  .filter(slot => slot.status === "AVAILABLE")
  .map(slot => ({
    _id: slot._id,
    start: slot.start,
    end: slot.end,
    status: slot.status,
    tokenNumber: slot.tokenNumber,
    scheduleId: schedule._id   // ✅ added
  }))
```

---

## Deployment Notes

### Backend (Railway / Render / Fly.io)
1. Set all `.env` variables as environment variables in the platform
2. Set `NODE_ENV=production`
3. Entry point: `src/server.js`

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_BASE_URL` to your deployed backend URL
4. Add `_redirects` file for Netlify SPA routing: `/* /index.html 200`

---

*Built with ❤️ using the MERN stack*
