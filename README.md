# cherry — Craft Café, Yanam, Puducherry

A modern, responsive, frontend-only craft café website and reservation management dashboard. Built with HTML5, Vanilla CSS, Vanilla JavaScript, and Vite, featuring smooth GSAP animations and client-side browser storage (`localStorage`).

---

## ✨ Features

### 🌐 Public Website
- **Animated Hero Section** — Parallax background, GSAP scroll animations, subtle steam SVG effect
- **Our Story** — Brand narrative with editorial Japandi styling and scroll-reveal typography
- **Interactive Menu** — Filterable by category (Drinks, Food, Desserts) with 14+ artisan items
- **Signature Dishes** — Editorial showcase with balanced display heights
- **Photo Gallery** — Masonry-style Pinterest gallery
- **Table Reservation Form** — Validated customer booking interface saving directly to browser storage
- **Contact & Location** — Yanam, Puducherry
- **Smooth Scroll & Micro-interactions** — Powered by Lenis and custom magnetic cursor

### 📋 Admin Portal
- **Frontend Demo Access Gate** — Simple credential access configured via `data/admin.json`
- **Reservations Dashboard** — Real-time display reading directly from `localStorage`
- **KPI Metrics** — Total reservations, pending requests, confirmed bookings, total guests
- **Reservation Management** — Update statuses (`pending` → `confirmed` or `cancelled`) and delete bookings
- **Search & Filtering** — Filter by booking status or search by guest name, email, or phone
- **Local Backup System (Export / Import)** — Download reservations as JSON and restore from backup files

---

## 🏗️ Architecture

```
cherry Website (Frontend UI)
       ↓
  Vite Dev Server / Static Hosting (Vercel compatible)
       ↓
Browser localStorage (cherry_reservations)
       ↓
  Admin Dashboard
```

> **Important Note on Data Persistence:**  
> Reservation data is stored locally in the browser's `localStorage` under the key `cherry_reservations`. It is not synchronized to an external or shared online database. Use the **Export Reservations** feature in the Admin Portal to create JSON backups.

---

## 💾 Reservation Backup Feature

The Admin Portal includes a local data backup and restore system:

1. **Export Reservations**
   - Click **Export Reservations** in the admin toolbar.
   - Downloads a formatted `cherry-reservations.json` file containing all reservation records.
2. **Import Reservations**
   - Click **Import Reservations** and select a previously exported `.json` file.
   - Validates the JSON array structure and restores the reservation dataset into `localStorage`.

---

## 🛠️ Project Structure

```
├── index.html              # Public website (Home, Story, Menu, Gallery, Reserve, Contact)
├── admin.html              # Admin portal (Demo access gate, KPI metrics, Reservations table)
├── main.js                 # Public site animations, navigation, & reservation form logic
├── admin.js                # Admin dashboard management, filtering, & JSON backup logic
├── style.css               # Shared styling & design system
├── assets/                 # Optimized WebP images and media assets
├── data/
│   └── admin.json          # Demo admin profile configuration
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite build & development configuration (optional)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm

### Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open in your browser:
   - Website: `http://localhost:5173/`
   - Admin Portal: `http://localhost:5173/admin.html`

### Production Build

Build the static assets for deployment (Vercel, GitHub Pages, or any static host):

```bash
npm run build
```

The production output will be generated in the `dist/` directory.

---

## 🔐 Admin Portal Demo Credentials

Configured in `data/admin.json`:
- **Email:** `admin@example.com`
- **Password:** Any password (Demo access gate)

---

## 📄 License
ISC License. Crafted with love & espresso.
