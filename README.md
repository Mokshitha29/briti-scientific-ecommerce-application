# Briti Scientific - Chemical & Laboratory Products E-Commerce Platform

A production-ready, fully functional **MEAN-stack** (MongoDB, Express, Angular 17, Node.js) B2B chemical e-commerce application inspired by the professional design, structure, and product presentation of **Briti Scientific** ([https://britiscientific.com/](https://britiscientific.com/)).

> **Disclaimer**: This application is a working technical prototype developed for demonstration, evaluation, and interview testing. All data, transactions, and product inventories are simulated demo records and do not copy proprietary content or process real payments.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Angular 17 Client (Vercel)               │
│   Bootstrap 5 • Reactive Forms • Guards • Interceptor  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST APIs (Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Node.js + Express Backend (Render)          │
│       CommonJS • JWT Auth • MVC • Stock Controllers     │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose Driver (TLS/SSL)
                            ▼
┌────────────────────────────────────────────────────────┐
│              MongoDB Atlas Cloud Database              │
│                 briti_chemical_store                   │
└────────────────────────────────────────────────────────┘
```

---

## Production Deployment Guide

### Deployment Architecture
- **Frontend**: Angular 17 SPA deployed on **Vercel**
- **Backend**: Node.js + Express REST API deployed on **Render** (Web Service)
- **Database**: **MongoDB Atlas** (M0 Free Tier or Dedicated Cluster)

---

### Step 1: MongoDB Atlas Setup

1. **Create Account & Cluster**:
   - Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Create a free shared cluster (M0) in your preferred cloud region.
2. **Database Access User**:
   - Go to **Security** $\rightarrow$ **Database Access** $\rightarrow$ **Add New Database User**.
   - Select **Password** authentication.
   - Set username (e.g., `briti_admin`) and a secure password.
   - Assign role **Read and write to any database**.
3. **Network Access (IP Whitelist)**:
   - Go to **Security** $\rightarrow$ **Network Access** $\rightarrow$ **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so that Render can connect dynamically.
4. **Get Connection String**:
   - Go to **Database** $\rightarrow$ **Connect** $\rightarrow$ **Drivers** (Node.js).
   - Copy the SRV URI:
     ```text
     mongodb+srv://<username>:<password>@<cluster-name>.xxxxxx.mongodb.net/briti_chemical_store?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your Atlas user credentials. Ensure the database name is `briti_chemical_store`.

---

### Step 2: Render Backend Deployment

1. **Push Code to GitHub**:
   - Push this repository to your GitHub account (see Git section below).
2. **Create Web Service on Render**:
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Settings**:
   - **Name**: `briti-scientific-backend` (or your choice)
   - **Region**: Closest to your database region (e.g., Oregon, Frankfurt, Singapore)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Configure Environment Variables**:
   Add the following in the **Environment** tab:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `MONGODB_URI` | `mongodb+srv://.../briti_chemical_store?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *(Random 32+ character string)* | Key used to sign authentication tokens |
   | `JWT_EXPIRES_IN` | `1d` | Token expiry duration |
   | `CLIENT_URL` | `https://<your-vercel-app>.vercel.app` | Allowed CORS frontend origin |
5. **Deploy & Copy Backend URL**:
   - Click **Create Web Service**.
   - Once deployed, Render provides a URL like: `https://briti-scientific-backend.onrender.com`.
   - Test health endpoint: `https://briti-scientific-backend.onrender.com/api/health`.

---

### Step 3: Seed MongoDB Atlas Database

You can run the seeding scripts directly from your local terminal targeting the MongoDB Atlas cluster:

```bash
# In briti-chemical-ecommerce/server
# Set your MongoDB Atlas URI temporarily in your terminal session:
$env:MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/briti_chemical_store?retryWrites=true&w=majority"

# Seed Admin User:
node seedAdmin.js

# Seed Full Catalog, Demo Users, Orders, and Contact Messages:
node seedData.js
```

---

### Step 4: Vercel Frontend Deployment

1. **Update Production API URL**:
   - In `client/src/environments/environment.prod.ts`, set `apiUrl` to your live Render backend URL:
     ```typescript
     export const environment = {
       production: true,
       apiUrl: 'https://briti-scientific-backend.onrender.com/api'
     };
     ```
2. **Deploy on Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New...** $\rightarrow$ **Project**.
   - Import your GitHub repository.
3. **Configure Vercel Project**:
   - **Framework Preset**: `Angular`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client/browser` *(Crucial: Angular 17 application builder outputs to `dist/client/browser`)*
   - **Install Command**: `npm install`
4. **Deploy**:
   - Click **Deploy**.
   - Vercel automatically applies the SPA routing rewrite rule defined in `client/vercel.json` (`/(.*) -> /index.html`), preventing 404s on route refresh.

---

### Step 5: Update CORS on Render

Once your Vercel URL is live (e.g., `https://briti-scientific.vercel.app`):
- Go back to Render $\rightarrow$ Environment Variables.
- Update `CLIENT_URL` to your live Vercel URL: `https://briti-scientific.vercel.app`.
- Save changes (Render will automatically redeploy with the updated CORS policy).

---

## Demo Credentials & Accounts

### 1. Administrator Account
* **Name**: System Administrator
* **Email**: `admin@britiscientific.com`
* **Password**: `Ad@123`
* **Role**: `ADMIN`
* **Permissions**: Access to Dashboard, Products Management, Categories, Orders, Users, Enquiries, and Contact Messages.

### 2. Sample Institutional Users
All passwords adhere to the company password policy (uppercase, lowercase, number, special character, $\ge 6$ chars, no spaces):

| # | Name | Email | Password | Role | Institution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Rahul Sharma | `rahul.sharma@researchlab.org` | `Pass@1` | `USER` | National Research Labs |
| 2 | Priya Patel | `priya.patel@biotechsolutions.com` | `Bio#12` | `USER` | Apex Biotech Solutions |
| 3 | Dr. Anand Kumar | `dr.anand@pharmaindia.in` | `Doc@99` | `USER` | Pharma India Laboratories |
| 4 | Sunita Rao | `sunita.rao@analyticalchem.ac.in` | `Chem#1` | `USER` | Analytical Sciences Institute |
| 5 | Vikram Mehta | `vikram.mehta@qualitytesting.com` | `Qual#7` | `USER` | Standard Testing & Inspection |

---

## Simulated Demo Payment Gateway

* **Card Payment**: Enter card number `4111 1111 1111 1111` (any other card number simulates a declined transaction).
* **UPI Payment**: Enter UPI ID `test@upi` (any other UPI ID simulates payment failure).
* **Net Banking**: Choose any bank from the dropdown (`Demo Bank`, `Test Bank`, `Sample Bank`).
* **Processing**: Simulates real-world payment authorization with instant feedback, atomic stock decrement, cart clearance, and order confirmation. No sensitive financial information is ever stored.

---

## Git Push Instructions

Run the following commands to push the deployment-ready code to GitHub:

```bash
# Navigate to the project root:
cd "c:\Users\Administrator\Desktop\briti scientific\briti-chemical-ecommerce"

# Verify ignored files (.env and node_modules are excluded):
git status

# Stage all project files:
git add .

# Create initial commit:
git commit -m "feat: complete deployment-ready Briti Scientific MEAN chemical e-commerce application"

# Rename branch to main:
git branch -M main

# Link your GitHub repository (replace with your repo URL):
git remote add origin https://github.com/<your-username>/briti-chemical-ecommerce.git

# Push to GitHub:
git push -u origin main
```

---

## Local Development Quickstart

### 1. Start Backend Server
```bash
cd server
npm install
npm start
# Listens on http://localhost:5000
```

### 2. Start Frontend Dev Server
```bash
cd client
npm install
npx ng serve --port 4200
# Accessible at http://localhost:4200
```

### 3. Automated Test Suite
```bash
cd server
node test-apis.js
```
