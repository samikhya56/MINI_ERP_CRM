# Mini ERP/CRM — Project Documentation

## Live services

- **Frontend:** https://mini-erp-frontend-wx2p.onrender.com
- **Backend API:** https://mini-erp-backend-g6dc.onrender.com/api/v1
- **Health check:** https://mini-erp-backend-g6dc.onrender.com/api/v1/health
- **API reference:** [API.md](API.md)

## Technology and architecture

The application is split into a React/Vite frontend and a Node.js/Express REST API. The frontend communicates with the API over HTTPS. The API uses Prisma ORM to store application data in PostgreSQL. JWT authentication identifies users, and the UI applies Admin, Sales, Warehouse, and Accounts role permissions.

```text
React + Vite frontend
        |
        | HTTPS REST API
        v
Node.js + Express + Zod validation
        |
        v
Prisma ORM → PostgreSQL
```

## Server setup and local run

Prerequisites: Node.js 18+ and a running PostgreSQL instance.

1. Clone the repository and open its root folder.
2. Create `.env` from `.env.example`.
3. Set `DATABASE_URL` to the local PostgreSQL database connection string and set a private `JWT_SECRET`.
4. Install backend dependencies and initialize the database:

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Run the backend:

```bash
npm run dev
```

6. In a second terminal, run the frontend:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Backend variables are private Render environment variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode (`production`) |
| `DATABASE_URL` | Private PostgreSQL connection URL |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

The frontend uses only this build-time variable:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Public backend API URL ending in `/api/v1` |

Database URLs and JWT secrets are never committed to GitHub or exposed to the frontend.

## Deployment

### Backend

The backend is deployed as a Render Node Web Service. It uses Render PostgreSQL through the private `DATABASE_URL` value.

```text
Build Command: npm ci --include=dev && npx prisma generate && npm run build
Start Command: npm run start:render
Health Check Path: /api/v1/health
```

`start:render` applies the Prisma schema and seeds data only if the database is empty.

### Frontend

The frontend is deployed as a Render Static Site.

```text
Root Directory: client
Build Command: npm ci && npm run build
Publish Directory: dist
VITE_API_BASE_URL: https://mini-erp-backend-g6dc.onrender.com/api/v1
```

## API documentation

The complete endpoint list, JWT header format, request bodies, sample credentials, and error conventions are documented in [API.md](API.md).

## Demo credentials

All accounts use password `Password@123`.

| Role | Email |
| --- | --- |
| Admin | `admin@minierp.com` |
| Sales | `sales@minierp.com` |
| Warehouse | `warehouse@minierp.com` |
| Accounts | `accounts@minierp.com` |

## Assumptions

- This portal is for internal company users, so users are pre-seeded rather than self-registering.
- Currency values are displayed in dollars for the demo and can be localized later.
- A confirmed sales challan reduces stock; a cancelled confirmed challan restores it.
- Render free services may take time to wake after inactivity.

## Known limitations and incomplete bonus items

- Purchase orders and invoices are not part of the implemented core modules.
- AWS/S3 product-image uploads, GitHub Actions, and generated invoice PDFs are bonus items and are not implemented.
- The application uses Render free services; cold starts can delay the first request.
