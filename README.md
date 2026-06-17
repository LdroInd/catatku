# KU Apps - Aplikasi Keuangan Desa & Kelompok

Aplikasi pencatatan keuangan sederhana untuk KU Desa dan KU Kelompok dengan fitur pencatatan pemasukan dan pengeluaran bulanan.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Netlify Functions (Serverless)
- **Database:** PostgreSQL (Neon Serverless)

## Fitur

1. **User Management** - CRUD user dengan role KU Desa / KU Kelompok
2. **Master Desa & Kelompok** - Pengelolaan data desa (header) dan kelompok (detail)
3. **Pencatatan Keuangan** - Input pemasukan/pengeluaran harian per bulan dengan fitur print

## Struktur Folder

```
ku-apps/
├── frontend/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API helper functions
│   │   ├── App.jsx        # Main app with routing
│   │   └── index.css      # Global styles
│   └── ...
├── netlify/
│   └── functions/         # Netlify Serverless Functions
│       ├── auth.js        # Login endpoint
│       ├── users.js       # User CRUD
│       ├── desa.js        # Desa CRUD
│       ├── kelompok.js    # Kelompok CRUD
│       └── pencatatan.js  # Pencatatan Header & Detail
├── database.sql           # Database schema & seed data
├── netlify.toml           # Netlify configuration
└── README.md
```

## Setup

### 1. Database

Buat database PostgreSQL (rekomendasi: [Neon](https://neon.tech)) lalu jalankan `database.sql`.

### 2. Environment Variables

Copy `.env.example` ke `.env` dan isi:

```
DATABASE_URL=postgresql://user:password@host:5432/ku_apps
JWT_SECRET=your-secret-key-here
```

Di Netlify, set environment variables di Settings > Environment Variables.

### 3. Install Dependencies

```bash
cd frontend
npm install

cd ../netlify/functions
npm install
```

### 4. Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Jalankan local dev server
netlify dev
```

### 5. Deploy ke Netlify

```bash
# Connect to Netlify
netlify init

# Deploy
netlify deploy --prod
```

## Login Default

- **Username:** admin
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth | Login |
| GET/POST/PUT/DELETE | /api/users | CRUD Users |
| GET/POST/PUT/DELETE | /api/desa | CRUD Desa |
| GET/POST/PUT/DELETE | /api/kelompok | CRUD Kelompok |
| GET/POST/PUT/DELETE | /api/pencatatan | CRUD Pencatatan |
