# AyojanPro — Project Requirements

## 1. Project Overview

**AyojanPro** is a local event management and event-service booking platform. It connects **clients who organize events** with **professionals who provide event-related services**, performed on-site in person (photography, videography, drone coverage, decoration, makeup, sound, etc.). It is specifically an event-service platform, not a generic freelancing marketplace.

### Core Workflow

```text
Client Registration/Login
        ↓
Create Event
        ↓
Add Service Requirements
        ↓
Professionals Discover Events
        ↓
Professional Submits Proposal
        ↓
Client Accepts Proposal
        ↓
Contract Created
        ↓
30% Upfront Payment
        ↓
Service Executed On-Site
        ↓
Professional Submits Deliverable(s) & Marks Delivered
        ↓
70% Final Payment
        ↓
Contract Completed
        ↓
Mutual Reviews
        ↓
Possible Dispute Resolution
```

## 2. User Roles

Exactly three roles exist:

- `CLIENT`
- `PROFESSIONAL`
- `ADMIN`

### Client

Clients can register/login with credentials or Google OAuth, manage their profile, create and publish events, define multiple service requirements, set a separate budget and schedule for each service, receive and review proposals, accept proposals, hire the same professional for multiple requirements of one event, hire different professionals for different requirements, make bKash payments, confirm/complete services, review professionals, and raise disputes with evidence.

### Professional

A professional does **not** go through a separate application entity. Applying to become a professional **is** creating the `Professional` profile itself: a `User` account with role `PROFESSIONAL` is created together with a `Professional` record that starts in `PENDING` status and carries the application information directly (personal/professional details, services, skills, experience, portfolio, resume, additional supporting files). There is no separate `ProfessionalApplication` table — the profile the applicant fills out **is** the professional's eventual profile.

Admin reviews the same `Professional` record and flips its status to `APPROVED` or `REJECTED` (with an optional `rejectionReason`). Only an `APPROVED` professional is treated as active on the platform — a `PENDING` or `REJECTED` professional cannot browse events or submit proposals, even though the row already exists.

Active (`APPROVED`) professionals can manage their profile, multiple services, skills, experience, portfolio; enable/disable `acceptingBookings`; browse events; submit proposals for suitable service requirements; provide contracted services in person; submit deliverables; receive payments; review clients; and raise disputes.

A professional may provide multiple services and may be hired for multiple service requirements of the same event. `acceptingBookings = false` prevents new bookings but does not invalidate existing confirmed contracts.

### Admin

Admin manages clients, professionals (including reviewing pending applications on the `Professional` record itself), events, service requirements, proposals, contracts, payments, disputes, evidence and platform-level operations. Admin can approve/reject professionals and resolve disputes.

## 3. Authentication and Authorization

Only clients use the normal public registration flow. Client authentication supports:

1. Credential authentication.
2. Google OAuth.

Professionals follow:

```text
User account (role=PROFESSIONAL) + Professional profile (status=PENDING)
        ↓
Admin reviews the Professional record
        ↓
status = APPROVED → professional becomes active
status = REJECTED → professional stays inactive, rejectionReason recorded
```

Admin accounts are controlled by the platform and may be seeded/created administratively.

Every protected operation must verify authentication, identity, role and resource ownership/permission. A `PENDING` or `REJECTED` professional must be blocked from any professional-only action even though the account exists.

## 4. Profiles

Identity fields (`name`, `email`, `profile image`) live on `User` for **both** clients and professionals — neither role duplicates them. Role-specific models only hold role-specific data.

### Client Profile

`Client` holds phone, profile image, bio, address, city, country.

### Professional Profile

`Professional` holds phone, address, city, country, professional title, bio, years of experience, `acceptingBookings`, application/review metadata (`status`, `reviewedById`, `reviewedAt`, `rejectionReason`, `resume`, `additionalFiles`), and aggregate rating info (`averageRating`, `totalReviews`).

## 5. Professional Services, Skills and Experience

A professional can provide **multiple services**, such as photography, videography, drone coverage, decoration, makeup or sound management.

A professional service may contain service name/category, description, pricing information (min/max), an active flag, and metadata.

Professionals can maintain skills (from a shared `Skill` catalog, joined via `ProfessionalSkill`) and experience entries (position/title, description, organization, start date, end date).

## 6. Professional Portfolio

Professionals can maintain multiple portfolio items showcasing previous/major events: title, description, event/work type, media URL, external URL, work date. Cloudinary may be used for media storage.

## 7. Event Management

Clients can create and publish events containing:

- Title
- Description
- Event type/category
- Location (address, city, country)
- Overall `startAt`
- Overall `endAt`
- Status
- Other event details

The overall event time describes the event, while each service requirement has its own actual service time.

## 8. Event Service Requirements

An event can contain multiple independent service requirements:

```text
Wedding
├── Photography
├── Videography
├── Drone
├── Makeup
└── Decoration
```

Each requirement has its own service name, description, **budget**, `startAt`, `endAt`, status and relevant requirements. The client must specify a **separate budget for every required service**.

A professional applies (submits a proposal) only to the requirements matching skills/services they actually offer — one professional may be qualified for several requirements of the same event, or only one, while other requirements are picked up by different professionals. Each requirement is filled **independently**: one requirement being hired-out does not affect the status of any other requirement on the same event. A requirement's own status (`OPEN` → `FILLED`) reflects only that requirement, not the event as a whole.

Example:

```text
Photography → 30,000 BDT
Videography → 25,000 BDT
Drone       → 10,000 BDT
Makeup      → 15,000 BDT
Decoration  → 40,000 BDT
```

## 9. Date and Time Rules

Date/time handling is critical throughout the platform. Actual timestamps must use PostgreSQL/Prisma `DateTime` values consistently.

For every event, service, proposal and contract time range:

```text
startAt < endAt
```

must be true.

Event and service schedules may differ where business rules permit. The backend must validate service timing according to the platform's scheduling rules.

## 10. Professional Time Conflict Rules

A professional cannot accept overlapping service periods.

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

means the periods overlap. Therefore `10:00–12:00` and `12:00–15:00` are allowed, while `10:00–14:00` and `12:00–16:00` conflict.

The conflict check is run directly against `Contract` rows in `CONFIRMED` or `IN_PROGRESS` status for that professional — there is no separate availability/schedule table; the contract table is the single source of truth for a professional's booked time.

## 11. Multiple Services by One Professional

A professional is **not limited to one service per event**.

```text
Wedding
├── Photography → Professional A
├── Videography → Professional A
├── Drone → Professional A
├── Makeup → Professional B
└── Decoration → Professional B
```

Professional A can have multiple contracts for the same event as long as the service periods do not overlap. Each service requirement is treated as an independent booking requirement.

## 12. Proposal System

A proposal belongs to one professional, one event service requirement, and one professional service. A professional may propose for multiple requirements of the same event when qualified for each.

A proposal contains proposed amount, proposed `startAt`, proposed `endAt`, message/details and status.

Proposal statuses: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`.

## 13. Proposal and Requirement Exclusivity

Each individual event service requirement can have only **one active hired professional**. Once a requirement has an active/accepted/confirmed contract, another professional cannot be hired for that same requirement. Other unfilled requirements on the same event remain open regardless.

Cancelled/rejected/expired proposals or contracts must not unnecessarily block future hiring.

Proposal acceptance and contract creation must use transactional/race-safe logic so two professionals cannot simultaneously become the hired professional for one requirement.

## 14. Contract System

A contract is created when the client accepts a professional's proposal. A contract represents one client, one professional, one event, one specific event service requirement and one professional service, and carries agreed amount, agreed service `startAt`/`endAt`, status, terms, and lifecycle timestamps.

Contract statuses and their flow:

```text
PENDING → CONFIRMED → IN_PROGRESS → DELIVERED → COMPLETED
                                            ↘ CANCELLED
                                            ↘ DISPUTED → RESOLVED
```

- `PENDING` — contract created, awaiting confirmation (initial payment).
- `CONFIRMED` — 30% upfront payment settled; the booking is locked in and now counts toward the professional's schedule-conflict check.
- `IN_PROGRESS` — the service window has started.
- `DELIVERED` — the professional has finished the on-site service and marked it delivered, optionally attaching a `Deliverable` record with media/drive links. Not every service produces a deliverable (e.g. decoration, live sound management) — the professional can move straight to `DELIVERED` without one.
- `COMPLETED` — final 70% payment is settled; reviews unlock.
- `CANCELLED` / `DISPUTED` / `RESOLVED` — exception paths.

Invalid state transitions must be rejected. The contract time must be validated again when created/confirmed.

## 15. Payment System

The payment provider is **bKash**. Payment status must be verified by the backend; the frontend must never be trusted to declare payment success.

Payments are associated with contracts and (for record-keeping) the paying client.

### Payment Schedule

```text
30% → Initial/Upfront Payment (unlocks CONFIRMED)
70% → Final Payment (unlocks COMPLETED)
```

The initial 30% is paid upfront to confirm the contract. The remaining 70% is paid after the service is marked `DELIVERED`.

Payment records support contract, client, payment stage, amount, currency, method, bKash transaction/reference information, status, transaction time, failure reason and metadata. Only one payment per (contract, stage) is permitted.

Payment stages: `INITIAL`, `FINAL`.
Payment statuses: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`, `REFUNDED`.

## 16. Service Delivery & Deliverables

Because AyojanPro is an in-person, on-location service platform, "delivery" does not always mean a file handoff — most services are physically performed at the event. A `Deliverable` exists to optionally record links (Cloudinary uploads, Google Drive folders, etc.) for services that do produce media or files.

- At most **one** `Deliverable` record per contract (title, description, an array of external links, submission timestamp).
- Creating/attaching a `Deliverable` is what the professional does when they have something to hand over; it is optional.
- Marking a contract `DELIVERED` never requires a `Deliverable` to exist — a professional can mark a purely in-person service (e.g. decoration setup, makeup) as delivered with nothing attached.
- Final payment eligibility is gated on contract status `DELIVERED`, not on the presence of a `Deliverable`.

## 17. Reviews and Ratings

After a contract reaches `COMPLETED`, both sides can review each other:

```text
Client → Professional
Professional → Client
```

A review contains rating, comment, contract, reviewer, reviewee and creation date. Each side can leave only one review per contract per direction (enforced uniquely on contract + client + professional + direction).

## 18. Dispute Management

Either client or professional can raise a dispute for issues such as client non-payment, professional no-show, service not delivered, quality failure, contractual violation, or other legitimate contract-related issues.

A dispute contains contract, raised-by user, raised-by role, reason, description, status, resolution information and timestamps.

## 19. Dispute Evidence

Disputes require sufficient supporting evidence: images, documents, screenshots, other media, and descriptions. Cloudinary may be used for media storage. Evidence is associated with the relevant dispute and protected from unauthorized access.

## 20. Admin Dispute Resolution

Admin can inspect event, service requirement, proposal, contract, payment records, user information, evidence and completion information before resolving a dispute.

Dispute statuses: `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`, `CLOSED`.

## 21. Notifications and Email

Notifications carry a `type` (`APPLICATION`, `PROPOSAL`, `CONTRACT`, `PAYMENT`, `SERVICE`, `REVIEW`, `DISPUTE`, `SYSTEM`) and cover application decisions, new/updated proposals, contracts, payment requirements/results, delivery, completion, reviews and disputes.

Nodemailer may be used for transactional email mirroring the same events.

## 22. Media Storage

Cloudinary may be used for profile images, professional portfolios, deliverable links, and dispute evidence. The database stores URLs/references and metadata rather than large binary files.

## 23. Matching

Since AyojanPro is a local platform, location matters. Matching may consider: service, skills, location, service schedule (no overlap with existing contracts), rating, experience, portfolio, pricing, and `acceptingBookings`. Professionals who cannot actually serve the required time period (based on existing confirmed contracts) should not be recommended as suitable matches.

## 24. Core Business Rules

1. **Role restriction:** only clients directly register through the normal registration flow.
2. **Professional gating:** a `Professional` record exists from the moment of application, but only an `APPROVED` status allows active platform use.
3. **Service-specific budget:** every event service requirement has its own budget.
4. **Service-specific schedule:** every event service requirement has its own service time range.
5. **One active professional per requirement:** one requirement cannot have multiple simultaneously active hired professionals.
6. **Multiple services per professional:** one professional can be hired for multiple requirements of the same event.
7. **No time overlap:** a professional cannot have overlapping `CONFIRMED`/`IN_PROGRESS` contracts, checked directly against the contract table.
8. **Booking preference:** a professional not accepting new bookings cannot accept a new contract.
9. **Payment verification:** payment success is verified by the backend.
10. **Two-stage payment:** 30% unlocks `CONFIRMED`, 70% unlocks `COMPLETED`.
11. **Delivery is not deliverable-dependent:** a contract can move to `DELIVERED` with or without a `Deliverable` record.
12. **Review eligibility:** reviews are available only after a contract is `COMPLETED`.
13. **Dispute evidence:** disputes require sufficient supporting information/evidence.
14. **Transactional booking:** proposal acceptance and contract creation must protect against race conditions.
15. **Date/time validation:** every relevant workflow transition validates timestamps and scheduling conflicts.

## 25. Time-Sensitive Workflow Validation

The backend must handle cases including:

- Proposal accepted after service time has passed.
- Contract created with a conflicting confirmed contract.
- Professional disables `acceptingBookings` before acceptance.
- Requirement is already filled when another proposal is accepted.
- Contract cancellation frees the professional's schedule.
- Proposal expires before acceptance.
- Final payment attempted before the contract is `DELIVERED`.
- Final payment attempted after a dispute is opened.
- Simultaneous booking attempts for overlapping periods.

These checks must be performed server-side.

## 26. Database Architecture

Technology:

- PostgreSQL
- Prisma ORM 7 (multi-file schema)

Major domains:

```text
Authentication
    ├── User
    └── Client

Professional Management
    ├── Professional        (also carries application/review state)
    ├── ProfessionalService
    ├── Skill
    ├── ProfessionalSkill
    ├── Experience
    └── PortfolioItem

Event Management
    ├── Event
    └── EventServiceRequirement

Hiring
    ├── Proposal
    └── Contract

Payment
    └── Payment

Service Delivery
    └── Deliverable      (one-to-one, optional, per contract)

Feedback
    └── Review

Dispute
    ├── Dispute
    └── DisputeEvidence

Communication
    └── Notification
```

**No `AuditLog`, `ProfessionalApplication`, `AvailabilityRule`, `TimeOff`, or `Revision` models are used** — applications are folded into `Professional`, and delivery is a status + one optional `Deliverable` row rather than a revision workflow.

## 27. Core Relationships

```text
User
├── Client
│   └── Events
│       └── EventServiceRequirements
│           ├── Proposals
│           └── Contract
│
└── Professional
    ├── Services
    ├── Skills
    ├── Experience
    ├── Portfolio
    ├── Proposals
    └── Contracts

Contract
├── Payments (INITIAL, FINAL)
├── Deliverable (0 or 1)
├── Reviews (client→professional, professional→client)
└── Disputes
```

## 28. API Architecture

Base API path:

```text
/api/v1
```

Architecture:

```text
Routes → Middleware → Controller → Service → Prisma → PostgreSQL
```

Routes define endpoints and route-level middleware. Middleware handles authentication, authorization, validation, errors, rate limiting where necessary and file handling where required. Controllers remain thin and handle request extraction, service calls and responses. Services contain business logic, transactions, scheduling checks, permissions, payment verification and workflow transitions. Prisma handles database access.

## 29. Validation

Validation is required for authentication, profiles, professional applications (on the `Professional` model), services, skills, experience, portfolio, events, service requirements, proposals, contracts, payments, deliverables, reviews, disputes and evidence.

Validation must include date/time consistency and business rules.

## 30. Error Handling

The API should return consistent errors for validation, authentication, authorization, missing resources, duplicates, scheduling conflicts, invalid workflow transitions, payment failures, already-filled requirements, dispute restrictions and external service failures.

## 31. Security Requirements

The backend must:

- Hash passwords securely.
- Validate authentication tokens.
- Enforce role-based access control, including gating `PENDING`/`REJECTED` professionals from professional-only actions.
- Validate resource ownership.
- Validate uploaded files.
- Protect sensitive payment information.
- Never trust frontend payment status.
- Protect payment/webhook verification endpoints.
- Apply rate limiting to sensitive endpoints where appropriate.
- Avoid exposing sensitive user information.

## 32. Optional Infrastructure

### Redis

Optional uses include caching, rate limiting, temporary state and performance optimization.

### Cloudinary

Media storage.

### Nodemailer

Transactional email.

### bKash

Payment processing.

## 33. End-to-End Client Flow

```text
Register/Login
      ↓
Create Profile
      ↓
Create Event
      ↓
Add Required Services (budget + service time each)
      ↓
Publish Event
      ↓
Receive Proposals
      ↓
Accept Proposal → Contract Created
      ↓
Pay 30%
      ↓
Service Delivered On-Site
      ↓
Professional Marks Contract Delivered (± Deliverable)
      ↓
Pay 70% → Contract Completed
      ↓
Review Professional
```

## 34. End-to-End Professional Flow

```text
Submit Professional Profile (User + Professional, status=PENDING)
      ↓
Admin Approval (status=APPROVED)
      ↓
Complete Profile / Add Services, Skills, Experience, Portfolio
      ↓
Enable Accepting Bookings
      ↓
Browse Events
      ↓
Submit Proposals for Matching Requirements
      ↓
Proposal Accepted → Contract Confirmed
      ↓
Provide Service On-Site
      ↓
Submit Deliverable (if applicable) & Mark Delivered
      ↓
Receive Final Payment → Contract Completed
      ↓
Review Client
```

## 35. End-to-End Admin Flow

```text
Review Pending Professionals
          ↓
Approve/Reject
          ↓
Monitor Events, Proposals, Contracts, Payments
          ↓
Review Disputes & Evidence
          ↓
Resolve Disputes
```

## 36. Core Business Example

```text
Event: Wedding
Overall Time: 4:00 PM → 10:00 PM

Photography   → Budget: 30,000 BDT   Time: 4:00 PM → 10:00 PM
Videography   → Budget: 25,000 BDT   Time: 4:00 PM → 10:00 PM
Drone         → Budget: 10,000 BDT   Time: 5:00 PM → 7:00 PM
Makeup        → Budget: 15,000 BDT   Time: 2:00 PM → 5:00 PM
Decoration    → Budget: 40,000 BDT   Time: 1:00 PM → 4:00 PM
```

Possible hiring:

```text
Professional A
├── Photography
├── Videography
└── Drone

Professional B
├── Makeup
└── Decoration
```

Valid because each professional is qualified for the specific requirement they applied to, is `APPROVED` and `acceptingBookings`, and has no overlapping confirmed contracts. Photography/Videography/Drone and Makeup/Decoration are filled independently — one requirement being hired-out never affects another requirement's status.

## 37. Final Project Objective

AyojanPro should provide a reliable local event-service platform where:

- Clients organize events with independently budgeted and scheduled services.
- Professionals apply directly through their own profile record and become active only after admin approval.
- Professionals can provide multiple services and be hired for multiple requirements of one event.
- Different professionals can independently fill different requirements of the same event.
- Scheduling conflicts are prevented using the contract table as the single source of truth.
- Contracts formalize agreements and move through a clear `PENDING → CONFIRMED → IN_PROGRESS → DELIVERED → COMPLETED` lifecycle.
- Payments follow 30% upfront and 70% final, both verified server-side via bKash.
- Delivery is decoupled from payment for services with no tangible handoff.
- Completed contracts enable mutual reviews.
- Disputes can be raised with evidence and resolved by admin.
- The architecture remains modular, maintainable, secure and scalable.

The implementation must prioritize **business-rule correctness, data integrity, role-based authorization, date/time consistency, transactional safety and reliable payment verification**.