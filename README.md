# Mini ERP/CRM System (Production-Ready Full-Stack)

A complete, production-ready full-stack **Mini ERP/CRM System** built with **Node.js, Express, TypeScript, Prisma, PostgreSQL, React 18, Vite, and Tailwind CSS**.

Includes **JWT Authentication**, **Role-Based Access Control (RBAC)** across 4 roles (`Admin`, `Sales`, `Warehouse`, `Accounts`), **Customer Relationship CRM**, **Product Inventory Monitoring**, and **Sales Challan Lifecycle Management** featuring **Prisma Interactive Transactions** for zero-race-condition stock deduction.

## Submission links

- **Source code:** [GitHub repository](https://github.com/samikhya56/MINI_ERP_CRM)
- **Live backend health check:** [Render API health](https://mini-erp-backend-g6dc.onrender.com/api/v1/health)
- **API documentation:** [docs/API.md](docs/API.md)
- **Live frontend:** Add the Render Static Site URL here after its deployment completes.

## Deployment notes

The backend is deployed as a Render Node Web Service and uses Render PostgreSQL through the `DATABASE_URL` environment variable. The frontend is deployed separately as a Render Static Site. It is built with `VITE_API_BASE_URL` set to the backend's `/api/v1` URL.

Required backend environment variables are `NODE_ENV`, `DATABASE_URL`, and `JWT_SECRET`. The frontend only requires `VITE_API_BASE_URL`; database credentials and JWT secrets must never be exposed in the frontend.

## Architecture and known limitations

- React/Vite frontend communicates with the Express REST API over HTTPS.
- Express controllers use Prisma to access PostgreSQL; Prisma validates the sales-challan stock transaction.
- Authentication uses signed JWTs and the UI enforces the Admin, Sales, Warehouse, and Accounts roles.
- Purchase orders, invoices, S3 uploads, GitHub Actions, and a generated invoice PDF are outside the required core scope and are not implemented.
- Render free services can take time to wake after inactivity.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([User Browser / Client])
    
    subgraph Frontend [React SPA - Port 3000]
        ReactApp[React 18 + Vite + Tailwind]
        AuthCtx[AuthContext & RBAC Rules]
        Router[React Router v6]
    end

    subgraph Backend [Express API Server - Port 4000]
        Express[Express Framework]
        AuthMW[JWT & Role Authorization Middlewares]
        Controllers[Auth, CRM, Product & Challan Controllers]
        TxEngine[Prisma Interactive Transaction Engine]
        ZodValidator[Zod Schema Validation]
    end

    subgraph Database [PostgreSQL Database - Port 5432]
        PostgreSQL[(PostgreSQL Database)]
        UserTable[(users)]
        CustTable[(customers & customer_notes)]
        ProdTable[(products & stock_movements)]
        ChallanTable[(sales_challans & challan_items)]
    end

    User --> ReactApp
    ReactApp --> Router
    Router --> AuthCtx
    AuthCtx -->|HTTP / REST API + Bearer JWT| Express
    Express --> AuthMW
    AuthMW --> ZodValidator
    ZodValidator --> Controllers
    Controllers --> TxEngine
    TxEngine -->|Prisma Client ORM| PostgreSQL
```

---

## 🔐 Demo Credentials (Test Login Table)

All accounts share the default password: **`Password@123`**

| Role | Email Address | Default Password | Permissions Overview |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@minierp.com` | `Password@123` | Full Read/Write access across CRM, Inventory, & Challans |
| **💼 Sales** | `sales@minierp.com` | `Password@123` | Full access to Customers CRM & Sales Challan Creation/Confirmation. Read-Only for Inventory. |
| **📦 Warehouse** | `warehouse@minierp.com` | `Password@123` | Full access to Inventory & Stock Management. Read-Only for Customers & Challans. |
| **📊 Accounts** | `accounts@minierp.com` | `Password@123` | Read-Only access across all modules (creation/edit buttons hidden). |

---

## 🚀 Quick Setup Instructions

### Option 1: Running via Docker Compose (Recommended)

Requires Docker and Docker Compose installed.

```bash
# 1. Clone & navigate to project directory
cd rani_project

# 2. Launch Docker environment (PostgreSQL + Backend API + Frontend Client)
docker-compose up --build
```
- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000/api/v1/health`

---

### Option 2: Native Local Setup (Node.js & npm)

#### Prerequisites
- Node.js (v18+)
- PostgreSQL database running locally or via Docker (`docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`)

#### Step 1: Backend Setup
```bash
# 1. Install backend dependencies
npm install

# 2. Setup Environment Variables (.env)
cp .env.example .env

# 3. Generate Prisma Client & Run DB Migrations
npx prisma generate
npx prisma db push

# 4. Seed Database with Demo Accounts, Products, & Customers
npx prisma db seed

# 5. Start Backend Server
npm run dev
```

#### Step 2: Frontend Setup
```bash
# Open a new terminal window
cd client

# 1. Install client dependencies
npm install

# 2. Start Vite Dev Server
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## ☁️ Production Deployment Guide

### Deploying Backend API to Render / Railway

1. **Database**: Provision a Managed PostgreSQL instance on Railway, Render, or Supabase.
2. **Backend Web Service**:
   - Root Directory: `./`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma db push && npm start`
   - **Environment Variables**:
     - `PORT`: `4000`
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: `postgresql://user:password@host:5432/dbname?sslmode=require`
     - `JWT_SECRET`: `<your-random-32-char-secret>`

### Deploying Frontend SPA to Vercel / Netlify

1. Connect your GitHub repository to Vercel.
2. **Root Directory**: `client`
3. **Framework Preset**: `Vite`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Rewrites / Redirects**: Ensure single-page app rewrite rule is configured (`/*` -> `/index.html`).

---

## ⚙️ Environment Variables Template (`.env.example`)

```ini
# Server Port Configuration
PORT=4000
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_db?schema=public"

# Authentication Secret
JWT_SECRET="super-secret-jwt-key-change-this-in-production-minierp"
```

---

## 📡 API Endpoint Documentation & cURL Snippets

### 1. User Login (`POST /api/auth/login`)
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sales@minierp.com",
    "password": "Password@123"
  }'
```

### 2. List Customers with Search & Pagination (`GET /api/customers`)
```bash
curl -X GET "http://localhost:4000/api/v1/customers?page=1&limit=10&search=Apex" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 3. Add New Product (`POST /api/products`)
```bash
curl -X POST http://localhost:4000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Heavy Duty Industrial Drill 800W",
    "sku": "SKU-TOOL-099",
    "category": "Power Tools",
    "unitPrice": 149.99,
    "currentStock": 50,
    "minStockAlert": 10,
    "location": "Rack A-12"
  }'
```

### 4. Create Sales Challan (`POST /api/challans`)
```bash
curl -X POST http://localhost:4000/api/v1/challans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "customerId": "<CUSTOMER_UUID>",
    "status": "Confirmed",
    "items": [
      { "productId": "<PRODUCT_UUID>", "quantity": 2 }
    ]
  }'
```

### 5. Transition Challan Status (`PATCH /api/challans/:id/status`)
```bash
curl -X PATCH http://localhost:4000/api/v1/challans/<CHALLAN_UUID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "status": "Cancelled"
  }'
```

---

## 💡 Known Limitations & Design Trade-offs

1. **Interactive Transaction Isolation**:
   - Stock verification and deduction occur inside Prisma's interactive transaction (`prisma.$transaction`). In high-concurrency environments with thousands of simultaneous orders for the same SKU, row-level locking (`SELECT ... FOR UPDATE` via raw SQL) can be added to guarantee strict serializability.
2. **Offline Fallback Engine**:
   - The React client SPA includes an offline fallback dataset in `src/services/api.ts` so that all UI features can be evaluated directly in the browser even if a local PostgreSQL database is not connected.
