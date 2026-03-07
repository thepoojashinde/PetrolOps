# PetrolOps – Petrol Pump Management System (MERN)

## Local setup

### 1) Configure environment

- Copy `backend/.env.example` → `backend/.env`
- Ensure MongoDB is running locally (default in `.env` uses `mongodb://127.0.0.1:27017/petrolops`)

### 2) Install

```bash
npm run install:all
```

### 3) Seed admin user

```bash
npm --prefix backend run seed:admin
```

### 4) Run (frontend + backend)

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api/health`

## Default admin (local)

Email: `admin@petrolops.local`  
Password: `Admin@123`

