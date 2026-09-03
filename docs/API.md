# Mini ERP/CRM API Reference

Base URL: `https://mini-erp-backend-g6dc.onrender.com/api/v1`

## Authentication

Protected routes require this header:

```http
Authorization: Bearer <access_token>
```

### POST /auth/login

Authenticates a user and returns a JWT plus user profile.

```json
{
  "email": "admin@minierp.com",
  "password": "Password@123"
}
```

## Health

### GET /health

Returns API and database status. No authentication required.

## Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/customers` | Create a customer |
| GET | `/customers?page=1&limit=10&search=&status=` | List/search customers |
| GET | `/customers/:id` | Get one customer with notes |
| PUT | `/customers/:id` | Update a customer |
| POST | `/customers/:id/notes` | Add a follow-up note |

Create/update customer body:

```json
{
  "name": "Apex Industrial Solutions",
  "mobile": "+91-9876543210",
  "email": "contact@apex.example",
  "businessName": "Apex Industrial Solutions Ltd",
  "gstNumber": "27AAACA123411Z5",
  "customerType": "Wholesale",
  "address": "Mumbai, Maharashtra",
  "status": "Active",
  "followUpDate": "2026-09-15T09:00:00.000Z",
  "notes": "Initial contact completed"
}
```

Note body:

```json
{ "note": "Follow up next week for the pricing proposal." }
```

## Products and Inventory

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/products` | Create a product |
| GET | `/products?page=1&limit=10&search=&lowStockOnly=true` | List/search products |
| GET | `/products/:id` | Get one product |
| PUT | `/products/:id` | Update a product |
| GET | `/products/:id/movements` | View stock movement history |

Create/update product body:

```json
{
  "name": "Industrial Drill 800W",
  "sku": "SKU-TOOL-099",
  "category": "Power Tools",
  "unitPrice": 149.99,
  "currentStock": 50,
  "minStockAlert": 10,
  "location": "Rack A-12"
}
```

## Sales Challans

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/challans` | Create a draft or confirmed challan |
| GET | `/challans?page=1&limit=10&search=&status=&customerId=` | List/search challans |
| GET | `/challans/:id` | Get challan detail |
| PATCH | `/challans/:id/status` | Change status |

Create challan body:

```json
{
  "customerId": "<customer-id>",
  "status": "Draft",
  "items": [
    { "productId": "<product-id>", "quantity": 2 }
  ]
}
```

Update status body:

```json
{ "status": "Confirmed" }
```

Confirming a challan deducts stock inside a database transaction. The API rejects confirmation when stock is insufficient.

## Responses and errors

Successful API responses use `success: true` and return data in `data`. List endpoints also return pagination data. Validation failures return HTTP `400`, missing or invalid JWTs return `401`, forbidden roles return `403`, missing records return `404`, and stock/business-rule conflicts return an appropriate error response.

## Demo users

All demo accounts use password `Password@123`.

| Role | Email |
| --- | --- |
| Admin | `admin@minierp.com` |
| Sales | `sales@minierp.com` |
| Warehouse | `warehouse@minierp.com` |
| Accounts | `accounts@minierp.com` |
