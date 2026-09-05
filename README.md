# AyojanPro

A local event-service booking platform connecting **clients** who organize events with **verified professionals** who perform event services on-site (photography, videography, decoration, makeup, sound, etc.).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma 7 (multi-file schema) |
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

| Role | How the account is created |
|---|---|
| `CLIENT` | Self-register (credentials or Google OAuth) |
| `PROFESSIONAL` | Applies directly by creating a `User` + `Professional` profile (`status = PENDING`) → Admin flips status to `APPROVED`/`REJECTED` |
| `ADMIN` | Platform-seeded; not publicly registrable |

> There is no separate application table — the `Professional` model **is** the application. It carries `status`, `resume`, `rejectionReason`, `reviewedById`, `reviewedAt` alongside the normal profile fields. A `PENDING`/`REJECTED` professional is blocked from any professional-only action even though the row already exists.

---

## Core Workflow

```
Client creates Event
  └─ Adds Service Requirements (each with own budget + time range)
       └─ Qualified Professionals submit Proposals for the requirements they match
            └─ Client accepts a Proposal → Contract created (PENDING)
                 └─ Client pays 30% → Contract CONFIRMED
                      └─ Service performed on-site → Contract IN_PROGRESS
                           └─ Professional marks service DELIVERED (± Deliverable links)
                                └─ Client pays 70% → Contract COMPLETED
                                     └─ Mutual reviews unlock
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
                       ├─ Proposal
                       └─ Contract

Contract ─┬─ Payment (INITIAL, FINAL)
           ├─ Deliverable (0 or 1, optional links only)
           ├─ Review (client→professional, professional→client)
           └─ Dispute ─── DisputeEvidence

Notification
```

No `ProfessionalApplication`, `AvailabilityRule`, `TimeOff`, `Revision`, or `AuditLog` models — professional intake is a status field on `Professional`, scheduling conflicts are checked directly against `Contract` rows, and delivery is a status + one optional record rather than a versioned revision flow.

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

### Professionals (profile + application in one)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/professionals/apply` | Create `User` (role `PROFESSIONAL`) + `Professional` profile, `status = PENDING` |
| GET | `/professionals` | Browse `APPROVED` professionals |
| GET | `/professionals/:id` | Get professional profile |
| PATCH | `/professionals/me` | Update own profile |
| PATCH | `/professionals/me/accepting-bookings` | Toggle accepting bookings |
| GET | `/admin/professionals?status=PENDING` | List pending applications (Admin) |
| PATCH | `/admin/professionals/:id/approve` | Approve (Admin) |
| PATCH | `/admin/professionals/:id/reject` | Reject, with reason (Admin) |

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

### Client Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/clients/me` | Get own profile |
| PATCH | `/clients/me` | Update profile |

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
| PATCH | `/proposals/:id/accept` | Accept proposal → creates Contract (Client) |
| PATCH | `/proposals/:id/reject` | Reject proposal (Client) |
| PATCH | `/proposals/:id/withdraw` | Withdraw proposal (Professional) |

### Contracts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/contracts` | List own contracts |
| GET | `/contracts/:id` | Get contract detail |
| PATCH | `/contracts/:id/cancel` | Cancel contract |
| POST | `/contracts/:id/deliverable` | Attach deliverable links and mark `DELIVERED` (Professional) |
| GET | `/contracts/:id/deliverable` | Get the contract's deliverable, if any |
| PATCH | `/contracts/:id/complete` | Mark `COMPLETED` (typically triggered by final payment) |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/payments/initial` | Initiate 30% upfront payment |
| POST | `/contracts/:id/payments/final` | Initiate 70% final payment (requires `DELIVERED`) |
| POST | `/payments/bkash/callback` | bKash payment callback (verified server-side) |
| GET | `/contracts/:id/payments` | List payments for contract |

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

**Professional gating**
- Applying = creating the `Professional` record itself, `status = PENDING`.
- Only `status = APPROVED` unlocks professional-only actions (browsing events, proposing, contracting).

**Scheduling**
- Every `EventServiceRequirement` has its own `startAt`/`endAt` and budget, independent of the parent event's time range.
- `startAt < endAt` is enforced on every proposal, contract, and service.
- A professional cannot hold two `CONFIRMED`/`IN_PROGRESS` contracts whose time ranges overlap: `existing.startAt < new.endAt AND existing.endAt > new.startAt`. This check runs directly against the `Contract` table — there is no separate availability model.

**Hiring**
- One requirement → only one active hired professional at a time; other requirements on the same event fill independently.
- One professional → can hold multiple contracts for the same event provided their service periods don't overlap.
- `acceptingBookings = false` blocks new contracts but does not invalidate existing confirmed ones.
- Proposal acceptance and contract creation are wrapped in a database transaction to prevent race conditions.

**Delivery**
- Contract lifecycle: `PENDING → CONFIRMED → IN_PROGRESS → DELIVERED → COMPLETED` (plus `CANCELLED` / `DISPUTED` / `RESOLVED`).
- A `Deliverable` (title, description, array of external links) is optional and capped at one per contract.
- Marking `DELIVERED` never requires a `Deliverable` to exist — many services (decoration, makeup, live sound) have nothing to hand over.

**Payments**
- 30% paid upfront to reach `CONFIRMED`; 70% paid once the contract is `DELIVERED`, moving it to `COMPLETED`.
- Payment success is **always** verified server-side via bKash callback — the frontend result is never trusted.
- Final payment is blocked if a dispute is open on the contract.

**Reviews**
- Reviews unlock only once the contract is `COMPLETED`.
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