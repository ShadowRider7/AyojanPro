# AyojanPro

A local event-service booking platform that connects **clients** who organize events with **verified professionals** who provide event-related services (photography, videography, decoration, makeup, sound, etc.).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT + Google OAuth 2.0 |
| Payments | bKash |
| Media | Cloudinary |
| Email | Nodemailer |
| Cache / Rate Limit | Redis (optional) |

---

## Architecture

```
Routes → Middleware → Controller → Service → Prisma → PostgreSQL
```

- **Routes** — define endpoints and attach middleware
- **Middleware** — auth, RBAC, validation, rate limiting, file handling
- **Controllers** — thin; extract request data, call service, return response
- **Services** — all business logic, transactions, scheduling checks, payment verification
- **Prisma** — database access layer

---

## Roles

| Role | Registration |
|---|---|
| `CLIENT` | Self-register (credentials or Google OAuth) |
| `PROFESSIONAL` | Application → Admin approval → Account activated |
| `ADMIN` | Platform-seeded; not publicly registrable |

---

## Core Workflow

```
Client creates Event
  └─ Adds Service Requirements (each with own budget + time range)
       └─ Professionals browse and submit Proposals
            └─ Client accepts Proposal → Contract created
                 └─ Client pays 30% upfront
                      └─ Service delivered
                           └─ Contract marked complete
                                └─ Client pays 70% final
                                     └─ Mutual reviews
```

---

## Database Models

```
User ─┬─ Client ─── Event ─── EventServiceRequirement ─┬─ Proposal
      │                                                  └─ Contract
      └─ Professional ─┬─ ProfessionalService
                       ├─ Skill / ProfessionalSkill
                       ├─ Experience
                       ├─ PortfolioItem
                       ├─ AvailabilityRule
                       ├─ TimeOff
                       ├─ Proposal
                       └─ Contract

Contract ─┬─ Payment
           ├─ Deliverable ─── Revision
           ├─ Review
           └─ Dispute ─── DisputeEvidence

ProfessionalApplication (standalone; leads to Professional on approval)
Notification
```

---

## API Reference

Base path: `/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Client registration |
| POST | `/auth/login` | Credential login |
| GET | `/auth/google` | Google OAuth initiation |
| GET | `/auth/google/callback` | Google OAuth callback |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### Professional Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/applications` | Submit professional application |
| GET | `/applications` | List all applications (Admin) |
| GET | `/applications/:id` | Get application detail (Admin) |
| PATCH | `/applications/:id/approve` | Approve application (Admin) |
| PATCH | `/applications/:id/reject` | Reject application (Admin) |

### Client Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/clients/me` | Get own profile |
| PATCH | `/clients/me` | Update profile |

### Professional Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/professionals` | Browse professionals |
| GET | `/professionals/:id` | Get professional profile |
| PATCH | `/professionals/me` | Update own profile |
| PATCH | `/professionals/me/accepting-bookings` | Toggle accepting bookings |

### Professional Services, Skills & Experience
| Method | Endpoint | Description |
|---|---|---|
| POST | `/professionals/me/services` | Add service |
| PATCH | `/professionals/me/services/:id` | Update service |
| DELETE | `/professionals/me/services/:id` | Remove service |
| POST | `/professionals/me/skills` | Add skill |
| DELETE | `/professionals/me/skills/:id` | Remove skill |
| POST | `/professionals/me/experience` | Add experience |
| PATCH | `/professionals/me/experience/:id` | Update experience |
| DELETE | `/professionals/me/experience/:id` | Remove experience |

### Portfolio
| Method | Endpoint | Description |
|---|---|---|
| POST | `/professionals/me/portfolio` | Add portfolio item |
| PATCH | `/professionals/me/portfolio/:id` | Update item |
| DELETE | `/professionals/me/portfolio/:id` | Remove item |

### Availability
| Method | Endpoint | Description |
|---|---|---|
| POST | `/professionals/me/availability` | Add availability rule |
| PATCH | `/professionals/me/availability/:id` | Update rule |
| DELETE | `/professionals/me/availability/:id` | Remove rule |
| POST | `/professionals/me/time-off` | Add time-off period |
| DELETE | `/professionals/me/time-off/:id` | Remove time-off |

### Events
| Method | Endpoint | Description |
|---|---|---|
| POST | `/events` | Create event (Client) |
| GET | `/events` | Browse published events (Professional/Admin) |
| GET | `/events/:id` | Get event detail |
| PATCH | `/events/:id` | Update event (Client/Admin) |
| DELETE | `/events/:id` | Delete event (Client/Admin) |
| PATCH | `/events/:id/publish` | Publish event |

### Event Service Requirements
| Method | Endpoint | Description |
|---|---|---|
| POST | `/events/:eventId/requirements` | Add service requirement |
| GET | `/events/:eventId/requirements` | List requirements |
| PATCH | `/events/:eventId/requirements/:id` | Update requirement |
| DELETE | `/events/:eventId/requirements/:id` | Remove requirement |

### Proposals
| Method | Endpoint | Description |
|---|---|---|
| POST | `/requirements/:requirementId/proposals` | Submit proposal (Professional) |
| GET | `/requirements/:requirementId/proposals` | List proposals (Client/Admin) |
| GET | `/proposals/:id` | Get proposal detail |
| PATCH | `/proposals/:id/accept` | Accept proposal (Client) |
| PATCH | `/proposals/:id/reject` | Reject proposal (Client) |
| PATCH | `/proposals/:id/withdraw` | Withdraw proposal (Professional) |

### Contracts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/contracts` | List own contracts |
| GET | `/contracts/:id` | Get contract detail |
| PATCH | `/contracts/:id/cancel` | Cancel contract |
| PATCH | `/contracts/:id/complete` | Mark complete |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/payments/initial` | Initiate 30% upfront payment |
| POST | `/contracts/:id/payments/final` | Initiate 70% final payment |
| POST | `/payments/bkash/callback` | bKash payment callback (verified server-side) |
| GET | `/contracts/:id/payments` | List payments for contract |

### Deliverables & Revisions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/deliverables` | Submit deliverable (Professional) |
| GET | `/contracts/:id/deliverables` | List deliverables |
| POST | `/deliverables/:id/revisions` | Request revision (Client) |
| PATCH | `/revisions/:id` | Update revision status |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/reviews` | Leave review (Client or Professional) |
| GET | `/professionals/:id/reviews` | Get professional reviews |
| GET | `/clients/:id/reviews` | Get client reviews |

### Disputes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/disputes` | Raise dispute |
| GET | `/disputes` | List disputes (Admin) |
| GET | `/disputes/:id` | Get dispute detail |
| POST | `/disputes/:id/evidence` | Upload evidence |
| PATCH | `/disputes/:id/status` | Update dispute status (Admin) |
| PATCH | `/disputes/:id/resolve` | Resolve dispute (Admin) |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| GET | `/admin/events` | List all events |
| GET | `/admin/contracts` | List all contracts |
| GET | `/admin/payments` | List all payments |
| PATCH | `/admin/users/:id/status` | Activate/suspend user |

---

## Key Business Rules

**Scheduling**
- Every `EventServiceRequirement` has its own `startAt`/`endAt` and budget, independent of the parent event's time range.
- `startAt < endAt` is enforced on every proposal, contract, and service.
- A professional cannot hold two contracts whose time ranges overlap: `existing.startAt < new.endAt AND existing.endAt > new.startAt`.
- Availability rules and time-off periods are checked before a contract is confirmed.

**Hiring**
- One requirement → only one active hired professional at a time.
- One professional → can hold multiple contracts for the same event provided their service periods don't overlap.
- `acceptingBookings = false` blocks new contracts but does not invalidate existing confirmed ones.
- Proposal acceptance and contract creation are wrapped in a database transaction to prevent race conditions.

**Payments**
- 30% paid upfront after contract confirmation; 70% paid after service completion.
- Payment success is **always** verified server-side via bKash callback — the frontend result is never trusted.
- Final payment is blocked if a dispute is open on the contract.

**Reviews**
- Reviews unlock only after the contract is `COMPLETED` and the final payment is settled.
- One review per direction (Client→Professional, Professional→Client) per contract.

**Disputes**
- Either party may raise a dispute; at least one piece of evidence is required.
- Admin inspects all contract, payment, and evidence records before resolving.

---

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
REDIS_URL=          # optional
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed admin account
npm run seed

# Start development server
npm run dev
```