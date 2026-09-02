# CraftBridge — Project Requirements

> **Project Type:** Backend-focused Creator Marketplace & Project Collaboration Platform
> **Backend:** Node.js + TypeScript + Express.js
> **Database:** PostgreSQL + Prisma ORM
> **Frontend:** Next.js + shadcn/ui *(planned for a later phase)*
> **Payment:** Stripe
> **Authentication:** JWT + Google OAuth
> **Deployment:** Render / Vercel
> **API Documentation:** Postman

---

# 1. Project Overview

## CraftBridge

**CraftBridge** is a creator marketplace and project collaboration platform that connects clients with skilled creators such as:

* Graphic designers
* Video editors
* Photographers
* UI/UX designers
* Motion designers
* 3D artists
* Content creators
* Developers
* Illustrators
* Other creative professionals

The platform allows a client to publish a project, creators to submit proposals, clients to select a creator, and both parties to manage the work through contracts, milestones, deliverables, revisions, payments, and reviews.

The goal is to build more than a simple CRUD marketplace.

CraftBridge will demonstrate a complete business workflow:

```text
Client
  │
  ▼
Create Project
  │
  ▼
Creators Discover Project
  │
  ▼
Submit Proposal
  │
  ▼
Client Reviews Proposals
  │
  ▼
Accept Proposal
  │
  ▼
Contract Created
  │
  ▼
Milestones Created
  │
  ▼
Creator Completes Work
  │
  ▼
Submit Deliverable
  │
  ├──────────────► Revision Requested
  │                       │
  │                       ▼
  │                  Update Work
  │                       │
  │                       ▼
  └──────────────► Client Approves
                          │
                          ▼
                       Payment
                          │
                          ▼
                       Complete
                          │
                          ▼
                        Review
```

---

# 2. Project Goals

The primary goals are:

1. Build a secure RESTful backend.
2. Implement three distinct user roles.
3. Implement complete creator-client project workflows.
4. Integrate real Stripe payments.
5. Implement JWT authentication.
6. Implement Google authentication.
7. Implement strict RBAC.
8. Implement server-side validation.
9. Implement meaningful business logic.
10. Implement database transactions.
11. Implement soft deletion.
12. Implement audit logging.
13. Implement pagination, filtering, sorting, and search.
14. Implement proper database indexing.
15. Deploy the API to production.
16. Document all APIs using Postman.

---

# 3. User Roles

CraftBridge has exactly three primary roles.

## 3.1 CLIENT

Clients are users who need creative work completed.

### Client capabilities

* Register
* Login
* Login with Google
* Manage own profile
* Create projects
* Update own projects
* Publish projects
* Cancel own projects
* View own projects
* View proposals submitted to their projects
* Accept a proposal
* Reject proposals
* Create/manage milestones
* Request revisions
* Approve deliverables
* Make milestone payments
* View payment history
* Review creators
* View notifications

---

# 3.2 CREATOR

Creators provide professional services.

### Creator capabilities

* Register as a creator
* Login
* Login with Google
* Manage creator profile
* Manage skills
* Manage services
* Manage portfolio
* Browse available projects
* Search projects
* Filter projects
* Submit proposals
* Withdraw proposals
* View proposal status
* View assigned contracts
* Work on milestones
* Submit deliverables
* Respond to revisions
* View payments
* Review clients

---

# 3.3 ADMIN

Administrators manage and monitor the platform.

### Admin capabilities

* Login
* View users
* Search users
* Filter users
* Suspend users
* Reactivate users
* View projects
* View contracts
* View payments
* View platform statistics
* View audit logs
* Monitor system activity

### Admin restrictions

Admin registration must not be publicly available.

The initial admin account must be created through the database seed process.

---

# 4. Authentication

CraftBridge must support:

```text
Email + Password
Google OAuth
JWT Access Token
JWT Refresh Token
Bearer Authentication
```

## Access Token

Used for protected API requests.

```http
Authorization: Bearer <access_token>
```

## Refresh Token

Refresh tokens are stored securely in the database as hashes.

Refresh tokens must support:

* expiration
* revocation
* rotation where applicable
* logout/revocation

---

# 5. Authorization

All protected endpoints must use role-based authorization.

Example:

```text
authenticate()
        │
        ▼
authorize(CLIENT)
```

A creator attempting to access a client-only endpoint must receive:

```json
{
  "success": false,
  "message": "You are not authorized to perform this action",
  "errors": []
}
```

HTTP status:

```text
403 Forbidden
```

---

# 6. Core Database Entities

CraftBridge will use PostgreSQL with Prisma.

## Main entities

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

---

# 7. Entity Relationships

## User

A User can have:

* one CreatorProfile
* many Projects as a client
* many Proposals
* many Contracts as a client
* many Contracts as a creator
* many Payments
* many Reviews
* many Notifications
* many AuditLogs
* many RefreshTokens

---

## CreatorProfile

A CreatorProfile belongs to one User.

A CreatorProfile can have:

* many Skills
* many Services
* many Portfolio items
* many Proposals

---

## Project

A Project belongs to one Client.

A Project can have:

* many Proposals
* one Contract

---

## Proposal

A Proposal belongs to:

* one Project
* one Creator

A Project cannot have multiple proposals from the same creator.

```text
UNIQUE(projectId, creatorId)
```

---

## Contract

A Contract connects:

* Client
* Creator
* Project
* Accepted Proposal

A Contract can contain multiple Milestones.

---

## Milestone

A Milestone belongs to one Contract.

A Milestone can have:

* Deliverables
* Revisions
* Payments

---

## Payment

A Payment belongs to:

* Client
* Milestone

Payment processing is handled through Stripe.

---

# 8. Project Lifecycle

## Project Status

```text
DRAFT
  ↓
OPEN
  ↓
IN_PROGRESS
  ↓
COMPLETED
```

Cancellation can occur from appropriate states:

```text
DRAFT → CANCELLED
OPEN → CANCELLED
IN_PROGRESS → CANCELLED
```

Invalid state transitions must be rejected.

---

# 9. Proposal Lifecycle

```text
PENDING
   │
   ├── ACCEPTED
   │
   ├── REJECTED
   │
   └── WITHDRAWN
```

Only the project owner can accept/reject proposals.

A creator can withdraw their own pending proposal.

---

# 10. Contract Lifecycle

```text
ACTIVE
   │
   ├── COMPLETED
   ├── CANCELLED
   └── DISPUTED
```

A contract is automatically created when a client accepts a proposal.

The creation of the contract and related state changes must happen inside a Prisma transaction.

---

# 11. Milestone Lifecycle

```text
PENDING
   ↓
FUNDED
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   │
   ├── APPROVED → COMPLETED
   │
   └── REVISION_REQUESTED
              ↓
         IN_PROGRESS
```

A milestone cannot become `FUNDED` through a normal PATCH request.

Funding must happen through the verified payment flow.

---

# 12. Deliverable Workflow

Creators submit deliverables for milestones.

```text
Creator
   ↓
Submit Deliverable
   ↓
Client reviews
   │
   ├── Approve
   │
   └── Request Revision
```

The creator can update/resubmit work after a revision request.

---

# 13. Revision Workflow

Clients can request revisions.

```text
OPEN
 ↓
RESOLVED
```

A revision must belong to a milestone.

The creator responsible for that milestone can resolve the revision by submitting updated work.

---

# 14. Payment Workflow

Stripe is the payment provider.

The payment flow:

```text
Client
   │
   ▼
Select Milestone
   │
   ▼
Create Payment Session
   │
   ▼
Stripe Checkout
   │
   ▼
Customer Payment
   │
   ├───────────────┐
   │               │
 Success         Cancel
   │               │
   ▼               ▼
Webhook         Cancelled
   │
   ▼
Verify Payment
   │
   ▼
Payment = PAID
   │
   ▼
Milestone = FUNDED
```

The backend must never trust the frontend to declare a payment successful.

Stripe webhook verification is mandatory.

---

# 15. Payment Requirements

Payment records must contain:

* amount
* currency
* provider
* transaction/session identifier
* payment status
* payment timestamp
* related milestone
* related client

Supported provider enum:

```text
STRIPE
BKASH
SSLCOMMERZ
```

Initial implementation:

```text
STRIPE
```

---

# 16. Review System

After a contract is completed, users can review each other.

Review contains:

```text
rating
comment
reviewer
reviewee
contract
```

Rating:

```text
1 - 5
```

A user cannot submit multiple reviews for the same contract.

```text
UNIQUE(contractId, reviewerId)
```

Creator average rating should be recalculated when reviews are created or updated.

---

# 17. Notification System

Notifications will be stored in PostgreSQL.

Examples:

```text
NEW_PROPOSAL
PROPOSAL_ACCEPTED
PROPOSAL_REJECTED
CONTRACT_CREATED
CONTRACT_CANCELLED
MILESTONE_CREATED
MILESTONE_SUBMITTED
REVISION_REQUESTED
MILESTONE_APPROVED
PAYMENT_SUCCESS
PAYMENT_FAILED
NEW_REVIEW
ACCOUNT_STATUS_CHANGED
```

Notifications should be created automatically during important business operations.

---

# 18. Audit Logging

Critical operations must create an AuditLog.

Examples:

```text
USER_SUSPENDED
PROJECT_CREATED
PROJECT_UPDATED
PROJECT_CANCELLED
PROPOSAL_ACCEPTED
CONTRACT_CREATED
MILESTONE_APPROVED
PAYMENT_CONFIRMED
REVIEW_CREATED
```

Audit log should contain:

```text
actorId
action
entity
entityId
oldData
newData
ipAddress
createdAt
```

---

# 19. Soft Delete

Important resources must use:

```text
deletedAt
```

instead of permanent deletion.

Soft-deletable entities include:

* User
* CreatorProfile
* Service
* Portfolio
* Project
* Proposal
* Contract
* Milestone

Normal queries must exclude soft-deleted records.

---

# 20. API Versioning

All API routes must use:

```text
/api/v1
```

Example:

```http
POST /api/v1/auth/register
GET /api/v1/projects
```

---

# 21. Standard API Response

## Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

All APIs must follow this structure.

---

# 22. API Requirements

CraftBridge must implement at least 20 meaningful APIs.

Target:

**30+ APIs**

This provides enough functionality to demonstrate the platform without creating artificial endpoints.

---

# 23. Authentication APIs

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

---

# 24. Profile APIs

```http
GET   /api/v1/users/me
PATCH /api/v1/users/me
```

Creator profile:

```http
GET   /api/v1/creators/:id
PATCH /api/v1/creators/me
```

---

# 25. Creator APIs

```http
POST   /api/v1/creators/services
GET    /api/v1/creators/me/services
PATCH  /api/v1/creators/services/:id
DELETE /api/v1/creators/services/:id
```

Portfolio:

```http
POST   /api/v1/creators/portfolio
GET    /api/v1/creators/me/portfolio
PATCH  /api/v1/creators/portfolio/:id
DELETE /api/v1/creators/portfolio/:id
```

---

# 26. Project APIs

```http
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
PATCH  /api/v1/projects/:id/publish
PATCH  /api/v1/projects/:id/cancel
```

List endpoint must support:

```text
?page=1
&limit=10
&status=OPEN
&category=DESIGN
&sortBy=createdAt
&sortOrder=desc
```

---

# 27. Project Search

Creators must be able to search projects.

Example:

```http
GET /api/v1/projects/search?q=video
```

Search should consider relevant fields such as:

```text
title
description
category
```

---

# 28. Proposal APIs

```http
POST   /api/v1/projects/:projectId/proposals
GET    /api/v1/projects/:projectId/proposals
GET    /api/v1/proposals/me
GET    /api/v1/proposals/:id
PATCH  /api/v1/proposals/:id/withdraw
PATCH  /api/v1/proposals/:id/accept
PATCH  /api/v1/proposals/:id/reject
```

Only creators can submit proposals.

Only the project owner can accept/reject proposals.

---

# 29. Contract APIs

```http
GET /api/v1/contracts
GET /api/v1/contracts/:id
PATCH /api/v1/contracts/:id/cancel
PATCH /api/v1/contracts/:id/complete
```

---

# 30. Milestone APIs

```http
POST   /api/v1/contracts/:contractId/milestones
GET    /api/v1/contracts/:contractId/milestones
GET    /api/v1/milestones/:id
PATCH  /api/v1/milestones/:id
PATCH  /api/v1/milestones/:id/start
PATCH  /api/v1/milestones/:id/approve
```

---

# 31. Deliverable APIs

```http
POST  /api/v1/milestones/:milestoneId/deliverables
GET   /api/v1/milestones/:milestoneId/deliverables
PATCH /api/v1/deliverables/:id
```

---

# 32. Revision APIs

```http
POST  /api/v1/milestones/:milestoneId/revisions
GET   /api/v1/milestones/:milestoneId/revisions
PATCH /api/v1/revisions/:id/resolve
```

---

# 33. Payment APIs

```http
POST /api/v1/payments/create-session
POST /api/v1/payments/webhook
GET  /api/v1/payments/:id
GET  /api/v1/payments/my-payments
```

---

# 34. Review APIs

```http
POST   /api/v1/contracts/:contractId/reviews
GET    /api/v1/contracts/:contractId/reviews
PATCH  /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

---

# 35. Notification APIs

```http
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
```

---

# 36. Admin APIs

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

# 37. Validation

Zod will be used for server-side validation.

Validation is required for applicable:

```text
POST
PATCH
PUT
```

requests.

Examples:

### Registration

```text
name
email
password
role
```

### Project

```text
title
description
category
budgetMin
budgetMax
deadline
```

### Proposal

```text
coverLetter
proposedPrice
estimatedDays
```

### Review

```text
rating
comment
```

Invalid requests must return HTTP 400 with structured validation errors.

---

# 38. Security

The backend must implement:

* bcrypt password hashing
* JWT authentication
* Bearer token authorization
* RBAC
* Helmet
* CORS
* express-rate-limit
* secure environment variables
* input validation
* webhook signature verification
* sanitized responses
* centralized error handling

Passwords must never appear in API responses.

---

# 39. Database Requirements

PostgreSQL + Prisma must be used.

Database must contain:

* foreign keys
* unique constraints
* composite unique constraints
* indexes
* enums
* transactions
* soft deletes

Frequently queried fields should have indexes.

---

# 40. Transactions

Prisma transactions must be used for critical multi-step operations.

Example:

```text
Accept Proposal
      │
      ├── Proposal → ACCEPTED
      ├── Project → IN_PROGRESS
      ├── Contract → CREATE
      ├── Milestone → CREATE
      ├── Notifications → CREATE
      └── AuditLog → CREATE
```

If any operation fails, the transaction should roll back.

---

# 41. Performance

The backend should use:

* Prisma `select`
* Prisma `include` only when necessary
* pagination
* database indexes
* efficient filtering
* efficient search
* Redis caching where practical

Redis is optional and should not delay core functionality.

Priority:

```text
Core Functionality
      ↓
Security
      ↓
Database Optimization
      ↓
Redis
```

---

# 42. File Upload

Creator portfolio and deliverable files may use:

```text
Multer
+
Cloudinary
```

Files should not be stored directly inside PostgreSQL.

The database stores the resulting URL.

---

# 43. Email

Nodemailer may be used for important notifications such as:

* welcome email
* proposal notification
* proposal acceptance
* payment confirmation
* contract completion

Email is secondary to the core business workflow.

---

# 44. Error Handling

The application must have centralized error handling.

Expected errors:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
BusinessLogicError
PrismaError
PaymentError
```

Example:

```json
{
  "success": false,
  "message": "Project not found",
  "errors": []
}
```

---

# 45. Architecture

The backend should follow modular architecture:

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
├── lib/
├── middlewares/
├── errors/
├── utils/
├── config/
├── types/
└── server.ts
```

Each module should generally contain:

```text
controller
service
route
validation
interface/types
```

---

# 46. API Documentation

Postman documentation is mandatory.

The collection must contain:

```text
Authentication
Users
Creators
Projects
Proposals
Contracts
Milestones
Deliverables
Revisions
Payments
Reviews
Notifications
Admin
```

Each protected endpoint should document:

```text
Authorization
Request body
Query parameters
Expected response
Error response
```

---

# 47. Deployment

The production backend must be deployed.

Recommended:

```text
Backend → Render
Database → PostgreSQL provider
File Storage → Cloudinary
Payment → Stripe
```

Environment variables must be configured securely.

Never commit:

```text
.env
JWT_SECRET
DATABASE_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
GOOGLE_CLIENT_SECRET
CLOUDINARY_SECRET
```

---

# 48. Git Requirements

At least 20 meaningful commits are required.

Recommended commit style:

```text
feat:
fix:
refactor:
docs:
test:
chore:
```

Example:

```text
feat: initialize express typescript project
feat: configure prisma and postgres
feat: implement user authentication
feat: add jwt authentication middleware
feat: implement role based authorization
feat: implement creator profile module
feat: implement project module
feat: implement proposal workflow
feat: implement contract creation transaction
feat: implement milestone workflow
feat: implement deliverable module
feat: implement revision workflow
feat: integrate stripe checkout
feat: implement stripe webhook
feat: implement review system
feat: implement notification system
feat: implement audit logging
feat: add rate limiting and security headers
docs: add postman api documentation
fix: resolve production deployment issues
```

---

# 49. Testing Requirements

Before submission, test:

### Authentication

* registration
* duplicate email
* invalid credentials
* token refresh
* logout
* Google authentication

### Authorization

* client accessing creator endpoint
* creator accessing client endpoint
* normal user accessing admin endpoint

### Project

* create
* update
* publish
* cancel
* search
* pagination
* filtering

### Proposal

* duplicate proposal
* accept proposal
* reject proposal
* withdraw proposal

### Contract

* creation
* cancellation
* completion

### Milestones

* create
* fund
* start
* submit
* revision
* approve

### Payment

* payment session
* successful payment
* cancelled payment
* webhook
* duplicate webhook

### Reviews

* rating validation
* duplicate review
* unauthorized review

---

# 50. Five-Day Development Target

## Day 1

```text
Project setup
Prisma
Database
Schema
Migrations
Seed
Architecture
Initial deployment
```

## Day 2

```text
Authentication
JWT
Google OAuth
RBAC
User
Creator
Service
Portfolio
```

## Day 3

```text
Projects
Proposals
Contracts
Milestones
Deliverables
Revisions
Validation
Transactions
Pagination
Search
Filtering
```

## Day 4

```text
Stripe
Payments
Reviews
Notifications
Audit Logs
Security
Rate Limiting
Postman
Testing
```

## Day 5

```text
Production deployment
Database migration
Environment variables
Full API testing
Bug fixing
Documentation
README
Demo credentials
Video
Final submission
```

---

# 51. Definition of Done

CraftBridge is considered complete when:

* [ ] Three roles work correctly.
* [ ] Authentication works.
* [ ] Google authentication works.
* [ ] Bearer JWT authentication works.
* [ ] RBAC works.
* [ ] 20+ meaningful APIs work.
* [ ] Prisma database is deployed.
* [ ] Validation works.
* [ ] Centralized error handling works.
* [ ] Pagination works.
* [ ] Filtering works.
* [ ] Search works.
* [ ] Soft delete works.
* [ ] Audit logging works.
* [ ] Transactions are implemented.
* [ ] Stripe payment works.
* [ ] Stripe webhook works.
* [ ] Reviews work.
* [ ] Notifications work.
* [ ] Security middleware works.
* [ ] Postman documentation is complete.
* [ ] Production API is live.
* [ ] Admin demo credentials exist.
* [ ] README is complete.
* [ ] 20+ meaningful Git commits exist.
* [ ] API walkthrough video is recorded.

---

# 52. Future Frontend

The frontend will be developed separately using:

```text
Next.js
TypeScript
shadcn/ui
Tailwind CSS
```

Potential frontend areas:

```text
Landing Page
Creator Marketplace
Project Marketplace
Creator Dashboard
Client Dashboard
Project Details
Proposal Management
Contract Workspace
Milestone Management
Payment
Notifications
Profile
Admin Dashboard
```

The backend must therefore expose clean REST APIs that can be consumed independently by the future Next.js frontend.
