# CraftBridge Backend

> A creator marketplace and project collaboration REST API connecting clients with skilled creators.

[![Node.js](https://img.shields.io/badge/Node.js-LTS-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-REST-black)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com/)

---

## 📌 Overview

CraftBridge is a backend-focused creator marketplace designed to connect clients with professional creators.

Clients can publish projects and receive proposals from creators. After selecting a creator, the platform creates a contract and allows both parties to manage milestones, deliverables, revisions, payments, and reviews.

The platform is designed around a complete business workflow rather than simple CRUD operations.

```text
Client
   │
   ▼
Project
   │
   ▼
Proposal
   │
   ▼
Contract
   │
   ▼
Milestones
   │
   ▼
Deliverables
   │
   ▼
Revisions
   │
   ▼
Stripe Payment
   │
   ▼
Completion
   │
   ▼
Review
```

---

## 🎯 Core Features

### Authentication

* Email/password registration
* Email/password login
* Google OAuth
* JWT access tokens
* Refresh tokens
* Logout
* Bearer authentication

### Role-Based Access

CraftBridge has three primary roles:

| Role      | Description                           |
| --------- | ------------------------------------- |
| `CLIENT`  | Publishes projects and hires creators |
| `CREATOR` | Offers services and works on projects |
| `ADMIN`   | Manages and monitors the platform     |

---

## 👤 Creator Features

Creators can:

* Create and manage profiles
* Add skills
* Create services
* Manage portfolio
* Browse projects
* Search projects
* Filter projects
* Submit proposals
* Withdraw proposals
* Manage contracts
* Work on milestones
* Submit deliverables
* Handle revisions
* View payment history
* Review clients

---

## 💼 Client Features

Clients can:

* Manage profiles
* Create projects
* Update projects
* Publish projects
* Cancel projects
* View proposals
* Accept proposals
* Reject proposals
* Manage contracts
* Create milestones
* Review deliverables
* Request revisions
* Approve milestones
* Make payments
* Review creators

---

## 🛡️ Admin Features

Admins can:

* View users
* Search users
* Filter users
* Suspend users
* Reactivate users
* Monitor projects
* Monitor contracts
* Monitor payments
* View dashboard statistics
* View audit logs

---

## 💳 Payment System

CraftBridge uses Stripe for real payment processing.

Payment flow:

```text
Create Payment Session
        ↓
Stripe Checkout
        ↓
Customer Payment
        ↓
Stripe Webhook
        ↓
Payment Verification
        ↓
Payment Status = PAID
        ↓
Milestone Status = FUNDED
```

The backend does not trust frontend payment status.

Stripe webhook signatures are verified before updating the database.

---

## 🗄️ Database

CraftBridge uses:

* PostgreSQL
* Prisma ORM

### Main Models

```text
User
RefreshToken
CreatorProfile
Skill
Service
Portfolio
Project
Proposal
Contract
Milestone
Deliverable
Revision
Payment
Review
Notification
AuditLog
```

### Important Database Features

* Foreign key relationships
* One-to-one relationships
* One-to-many relationships
* Many-to-many relationships
* Composite unique constraints
* Database indexes
* Soft deletes
* PostgreSQL JSON fields
* Transactions
* Enum-based status management

---

## 🏗️ Architecture

The backend follows a modular architecture.

```text
src/
│
├── app/
│   ├── routes.ts
│   └── middleware/
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── creator/
│   ├── project/
│   ├── proposal/
│   ├── contract/
│   ├── milestone/
│   ├── deliverable/
│   ├── revision/
│   ├── payment/
│   ├── review/
│   ├── notification/
│   └── admin/
│
├── config/
├── errors/
├── lib/
├── middlewares/
├── types/
├── utils/
│
└── server.ts
```

Typical request flow:

```text
Request
   ↓
Route
   ↓
Authentication Middleware
   ↓
Authorization Middleware
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Response
```

---

## 🔐 Security

CraftBridge implements:

* Password hashing with bcrypt
* JWT authentication
* Bearer token authorization
* Role-based authorization
* Helmet security headers
* CORS
* Rate limiting
* Zod validation
* Centralized error handling
* Stripe webhook verification
* Secure environment variables
* Password exclusion from API responses

---

## ⚡ Performance

The API uses:

* Prisma `select`
* Efficient relation queries
* Pagination
* Filtering
* Sorting
* Search
* PostgreSQL indexes
* Transactions
* Optional Redis caching

---

## 🗑️ Soft Delete

Business-critical records use soft deletion.

Instead of permanently deleting records:

```text
deletedAt = current timestamp
```

Normal API queries exclude deleted records.

This preserves historical data required for:

* Audit logs
* Contracts
* Payments
* Reporting

---

## 📝 Audit Logs

Important system actions are recorded.

Examples:

```text
PROJECT_CREATED
PROJECT_UPDATED
PROPOSAL_ACCEPTED
CONTRACT_CREATED
MILESTONE_APPROVED
PAYMENT_CONFIRMED
USER_SUSPENDED
```

Audit records contain information such as:

```text
actor
action
entity
entityId
oldData
newData
ipAddress
timestamp
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js LTS
* PostgreSQL
* Git

Optional:

* Redis
* Cloudinary account
* Stripe account
* Google Cloud OAuth credentials

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/craftbridge-backend.git

cd craftbridge-backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env
```

Example:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/craftbridge"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

CLIENT_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> Never commit `.env` to Git.

---

# 🗄️ Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Format schema:

```bash
npx prisma format
```

Validate schema:

```bash
npx prisma validate
```

---

## 🌱 Seed Database

Run:

```bash
npm run seed
```

The seed should create the initial administrator account and required development data.

Example:

```text
Role: ADMIN
Email: admin@craftbridge.dev
Password: <demo-password>
```

> Use dedicated demo credentials for evaluation. Never commit real passwords.

---

# ▶️ Run the Server

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Production:

```bash
npm start
```

Default local API:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api/v1
```

---

# 📚 API Documentation

Postman documentation:

```text
COMING SOON
```

Live API:

```text
COMING SOON
```

Postman collection:

```text
COMING SOON
```

These links will be updated before submission.

---

# 🔗 API Overview

## Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Users

```http
GET   /api/v1/users/me
PATCH /api/v1/users/me
```

## Creators

```http
GET   /api/v1/creators/:id
PATCH /api/v1/creators/me
```

## Services

```http
POST   /api/v1/creators/services
GET    /api/v1/creators/me/services
PATCH  /api/v1/creators/services/:id
DELETE /api/v1/creators/services/:id
```

## Portfolio

```http
POST   /api/v1/creators/portfolio
GET    /api/v1/creators/me/portfolio
PATCH  /api/v1/creators/portfolio/:id
DELETE /api/v1/creators/portfolio/:id
```

## Projects

```http
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
PATCH  /api/v1/projects/:id/publish
PATCH  /api/v1/projects/:id/cancel
GET    /api/v1/projects/search?q=keyword
```

## Proposals

```http
POST   /api/v1/projects/:projectId/proposals
GET    /api/v1/projects/:projectId/proposals
GET    /api/v1/proposals/me
GET    /api/v1/proposals/:id
PATCH  /api/v1/proposals/:id/withdraw
PATCH  /api/v1/proposals/:id/accept
PATCH  /api/v1/proposals/:id/reject
```

## Contracts

```http
GET   /api/v1/contracts
GET   /api/v1/contracts/:id
PATCH /api/v1/contracts/:id/cancel
PATCH /api/v1/contracts/:id/complete
```

## Milestones

```http
POST  /api/v1/contracts/:contractId/milestones
GET   /api/v1/contracts/:contractId/milestones
GET   /api/v1/milestones/:id
PATCH /api/v1/milestones/:id
PATCH /api/v1/milestones/:id/start
PATCH /api/v1/milestones/:id/approve
```

## Deliverables

```http
POST  /api/v1/milestones/:milestoneId/deliverables
GET   /api/v1/milestones/:milestoneId/deliverables
PATCH /api/v1/deliverables/:id
```

## Revisions

```http
POST  /api/v1/milestones/:milestoneId/revisions
GET   /api/v1/milestones/:milestoneId/revisions
PATCH /api/v1/revisions/:id/resolve
```

## Payments

```http
POST /api/v1/payments/create-session
POST /api/v1/payments/webhook
GET  /api/v1/payments/:id
GET  /api/v1/payments/my-payments
```

## Reviews

```http
POST   /api/v1/contracts/:contractId/reviews
GET    /api/v1/contracts/:contractId/reviews
PATCH  /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

## Notifications

```http
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
```

## Admin

```http
GET   /api/v1/admin/users
GET   /api/v1/admin/users/:id
PATCH /api/v1/admin/users/:id/status

GET /api/v1/admin/projects
GET /api/v1/admin/contracts
GET /api/v1/admin/payments

GET /api/v1/admin/dashboard
GET /api/v1/admin/audit-logs
```

---

# 📦 Standard API Response

Successful response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

---

# 🔄 Example Business Flow

## Hiring a Creator

### 1. Client creates project

```http
POST /api/v1/projects
```

### 2. Client publishes project

```http
PATCH /api/v1/projects/:id/publish
```

### 3. Creator discovers project

```http
GET /api/v1/projects
```

### 4. Creator submits proposal

```http
POST /api/v1/projects/:projectId/proposals
```

### 5. Client accepts proposal

```http
PATCH /api/v1/proposals/:proposalId/accept
```

Backend transaction:

```text
Proposal → ACCEPTED
Project → IN_PROGRESS
Contract → CREATED
Notification → CREATED
AuditLog → CREATED
```

### 6. Contract receives milestones

```http
POST /api/v1/contracts/:contractId/milestones
```

### 7. Client pays milestone

```http
POST /api/v1/payments/create-session
```

### 8. Stripe confirms payment

```text
Stripe
   ↓
Webhook
   ↓
Payment = PAID
   ↓
Milestone = FUNDED
```

### 9. Creator submits deliverable

```http
POST /api/v1/milestones/:milestoneId/deliverables
```

### 10. Client approves

```http
PATCH /api/v1/milestones/:id/approve
```

### 11. Contract completes

```http
PATCH /api/v1/contracts/:id/complete
```

### 12. Client and creator review each other

```http
POST /api/v1/contracts/:contractId/reviews
```

---

# 🧪 Testing

API testing will be performed using Postman.

Testing includes:

* Authentication
* Authorization
* CRUD operations
* Validation errors
* 401 responses
* 403 responses
* 404 responses
* Conflict errors
* Pagination
* Filtering
* Search
* Business state transitions
* Transactions
* Payment flow
* Stripe webhook
* Duplicate requests
* Soft deletion

---

# 🛠️ Tech Stack

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| Node.js            | Runtime                   |
| TypeScript         | Type safety               |
| Express.js         | REST API                  |
| PostgreSQL         | Database                  |
| Prisma             | ORM                       |
| Zod                | Validation                |
| JWT                | Authentication            |
| Google OAuth       | Social login              |
| bcrypt             | Password hashing          |
| Stripe             | Payment processing        |
| Cloudinary         | File storage              |
| Multer             | File uploads              |
| Nodemailer         | Email                     |
| Redis              | Optional caching          |
| Helmet             | Security headers          |
| express-rate-limit | Rate limiting             |
| Postman            | API documentation/testing |

---

# 🌐 Frontend

A frontend is planned as a separate application.

Planned stack:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

The frontend will consume the CraftBridge REST API.

Potential frontend sections:

```text
Landing Page
Creators
Projects
Project Details
Creator Profile
Client Dashboard
Creator Dashboard
Proposal Management
Contract Workspace
Milestones
Payments
Notifications
Admin Dashboard
```

---

# 🚀 Deployment

Production architecture:

```text
                    ┌───────────────┐
                    │   Next.js     │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ CraftBridge   │
                    │ REST API      │
                    └───────┬───────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        PostgreSQL       Stripe        Cloudinary
```

Deployment targets:

```text
Backend → Render
Database → PostgreSQL
File Storage → Cloudinary
Payments → Stripe
Frontend → Vercel
```

---

# 📋 Environment Variables

Required production environment variables include:

```text
NODE_ENV
PORT
DATABASE_URL

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

CLIENT_URL

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

# 📁 Project Status

```text
🚧 In Development
```

Current development plan:

```text
[ ] Project setup
[ ] Prisma schema
[ ] Database migration
[ ] Seed data
[ ] Authentication
[ ] Google OAuth
[ ] RBAC
[ ] Creator module
[ ] Project module
[ ] Proposal module
[ ] Contract module
[ ] Milestone module
[ ] Deliverable module
[ ] Revision module
[ ] Payment integration
[ ] Review module
[ ] Notification module
[ ] Audit logging
[ ] Security
[ ] Postman documentation
[ ] Production deployment
[ ] Final testing
```

---

# 📅 Development Timeline

## Day 1

**Planning, Architecture & Database**

* Project setup
* Prisma
* PostgreSQL
* Database schema
* Migrations
* Seed
* Initial deployment

## Day 2

**Authentication & Core Modules**

* Authentication
* JWT
* Google OAuth
* RBAC
* User
* Creator
* Services
* Portfolio

## Day 3

**Business Logic**

* Projects
* Proposals
* Contracts
* Milestones
* Deliverables
* Revisions
* Validation
* Transactions
* Search
* Filtering
* Pagination

## Day 4

**Payments & Testing**

* Stripe
* Webhooks
* Reviews
* Notifications
* Audit logs
* Security
* Postman
* Testing

## Day 5

**Deployment & Submission**

* Production deployment
* Database migration
* Environment configuration
* QA
* Bug fixing
* README
* API documentation
* Demo credentials
* Walkthrough video

---

# 👨‍💻 Developer

**Developer:** Your Name

**Project:** CraftBridge

**Repository:**
`https://github.com/YOUR_USERNAME/craftbridge-backend`

**Live API:**
`COMING SOON`

**API Documentation:**
`COMING SOON`

**Demo Video:**
`COMING SOON`

---

# 📜 License

This project is developed for educational and portfolio purposes.
