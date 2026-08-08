# VistaOnco HMS

**VistaOnco** is a cancer‑focused Hospital Management System built with **Angular 17** on the frontend and **Convex** as a real‑time backend.

---

## ⚡ Quick Start (4 steps)

### Step 1 — Install dependencies
```bash
cd oncocare
npm install
```

### Step 2 — Create a free Convex account
Visit https://convex.dev, sign up (free, no credit card required).

### Step 3 — Connect Convex to your project
```bash
npx convex dev
```
- A browser window will open; log in with your Convex account.
- Choose **"Create a new project"** and name it `oncocare`.
- Convex will generate the `convex/_generated/` folder and display your deployment URL.
- **Leave this terminal running** – it keeps the backend in sync.

### Step 4 — Run the Angular app (in a new terminal)
```bash
npm start
```
Open **http://localhost:4200** – the application is now live with a real backend!

---

## 🌱 Load Demo Data
While the app is running, load sample data from the Convex dashboard:
1. Go to https://dashboard.convex.dev and open your project.
2. Navigate to the **Functions** tab and locate `seed → seedDemoData`.
3. Click **Run** – this inserts patients, appointments, chemotherapy sessions, lab results, billing records, and more.

---

## 🗂 Project Structure
```
oncocare/
├── convex/                   ← BACKEND (Convex)
│   ├── schema.ts             ← Database schema (12 tables)
│   ├── patients.ts           ← Patient CRUD + search + stats
│   ├── appointments.ts       ← Appointment scheduling
│   ├── chemoSessions.ts      ← Chemotherapy session management
│   ├── clinical.ts           ← Labs, radiology, admissions, pharmacy, billing etc.
│   ├── oncology.ts           ← Tumour registry, clinical trials, palliative care
│   └── seed.ts               ← Demo data seeder
│
├── src/                      ← FRONTEND (Angular)
│   ├── app/
│   │   ├── pages/            ← Feature pages (outpatient, inpatient, pharmacy‑mgmt, ...)
│   │   ├── components/       ← Re‑usable UI components (layout, buttons, modals)
│   │   ├── services/         ← Convex service, theme service, language service, auth, etc.
│   │   └── guards/           ← Route guards (auth)
│   ├── assets/               ← Images, icons
│   └── styles/               ← Global CSS, design tokens
│
├── package.json
└── README.md
```
---

## 🎨 Design & Theme
- **Default theme:** Light mode (the app now starts in light mode if no preference is stored). Users can toggle to dark mode via the theme switch in the top‑right corner.
- **Responsive UI:** Uses modern CSS gradients, glass‑morphism cards, and micro‑animations for a premium look.
- **Multilingual support:** English, Hindi, and Tamil via `LanguageService`.

---

## 📦 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Angular 17 + Angular Router |
| Backend | Convex (real‑time serverless) |
| Database | Convex built‑in (no external SQL) |
| Icons | Tabler Icons |
| Auth | Convex Auth (optional) |
| Styling | Vanilla CSS with design tokens |

---

## 🔧 Development Tips
- **Live reloading:** `npm start` watches for changes in both Angular and Convex files.
- **Theme debugging:** The `ThemeService` stores the theme in `localStorage` under `vistaonco_theme`.
- **Language debugging:** The `LanguageService` stores the chosen language under `vistaonco_lang`.
- **Error monitoring:** `catch_errors.js` runs a headless Puppeteer script that logs console messages and request failures while the dev server is running.

---

## 🚀 Deploy to Production
```bash
npx convex deploy          # Deploy Convex backend
npm run build              # Build Angular app (output in dist/)
# Deploy the dist/ folder to Vercel, Netlify, Azure Static Web Apps, or any static host.
```

---

## 📄 License
This project is open‑source under the MIT License.
