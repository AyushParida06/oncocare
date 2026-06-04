# OncoCare HMS

Cancer-focused Hospital Management System built with **React + Convex**.

---

## ⚡ Quick Start (4 steps)

### Step 1 — Install dependencies
```bash
cd oncocare
npm install
```

### Step 2 — Create a free Convex account
Go to https://convex.dev and sign up (free, no credit card).

### Step 3 — Connect Convex to your project
```bash
npx convex dev
```
- It will open your browser and ask you to log in.
- Select **"Create a new project"** and name it `oncocare`.
- It auto-generates `convex/_generated/` and prints your deployment URL.
- **Keep this terminal running** — it syncs your backend in real time.

### Step 4 — Start React (in a new terminal)
```bash
npm start
```

Open **http://localhost:3000** — your app is now live with a real backend!

---

## 🌱 Load Demo Data

Once the app is running, go to the Convex dashboard:
https://dashboard.convex.dev

1. Open your project → **Functions** tab
2. Find `seed → seedDemoData`
3. Click **Run** — this inserts 3 patients, appointments, chemo sessions, lab results, billing etc.

You'll see real data appear instantly in the Home and Dashboard pages.

---

## 🗂 Project Structure

```
oncocare/
├── convex/                   ← BACKEND (Convex)
│   ├── schema.ts             ← Database schema (12 tables)
│   ├── patients.ts           ← Patient CRUD + search + stats
│   ├── appointments.ts       ← Appointment scheduling
│   ├── chemoSessions.ts      ← Chemotherapy session management
│   ├── clinical.ts           ← Labs, radiology, admissions, emergency, pharmacy, billing
│   ├── oncology.ts           ← Tumour registry, clinical trials, palliative care
│   └── seed.ts               ← Demo data seeder
│
├── src/                      ← FRONTEND (React)
│   ├── App.js                ← Routes
│   ├── index.js              ← ConvexProvider wraps the app
│   ├── components/
│   │   ├── Layout.js         ← Sidebar + topbar
│   │   └── PlaceholderPage.js
│   └── pages/
│       ├── Home.js           ← Live stats from Convex
│       ├── Dashboard.js      ← Live charts from Convex
│       ├── Appointments.js   ← Real appointment list + create form
│       └── ...               ← Other module pages
│
└── package.json
```

---

## 🔌 How Convex Works

**No REST API needed.** Convex functions are called directly from React:

```js
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Real-time query — auto-updates when DB changes
const patients = useQuery(api.patients.list, { status: 'active' });

// Mutation — writes to DB
const createPatient = useMutation(api.patients.create);
await createPatient({ mrn: 'OC-001', firstName: 'Meera', ... });
```

**Real-time:** All `useQuery` hooks update instantly across all browser tabs when data changes.

---

## 📦 Database Tables

| Table | Description |
|---|---|
| `patients` | Patient demographics + cancer info |
| `appointments` | All appointment bookings |
| `chemoSessions` | Chemotherapy cycles and drugs |
| `labResults` | Lab orders and structured results |
| `radiologyOrders` | Imaging orders and reports |
| `admissions` | Inpatient admissions and discharges |
| `emergencyVisits` | ED triage and assessments |
| `prescriptions` | Medication orders and dispensing |
| `bills` | Invoices, payments, insurance |
| `tumourRegistry` | TNM staging and registry data |
| `clinicalTrials` | Trial info and enrolments |
| `palliativeCare` | Palliative plans and pain scores |

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 |
| Backend | Convex (real-time serverless) |
| Database | Convex built-in (no SQL setup) |
| Icons | Tabler Icons |
| Auth | Add Convex Auth (optional) |

---

## 🚀 Deploy to Production

```bash
npx convex deploy        # Deploy backend
npm run build            # Build React app
# Host the build/ folder on Vercel, Netlify, or any static host
```
