# CraftBridge — Project Requirements

## 1. Project Overview

**CraftBridge** is a local event management and event-service booking platform. It connects **clients who organize events** with **professionals who provide event-related services**. It is specifically an event-service platform, not a generic freelancing marketplace.

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
Service/Event Execution
        ↓
Completion
        ↓
70% Final Payment
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

Clients can register/login with credentials or Google OAuth, manage their profile, create and publish events, define multiple service requirements, set a separate budget and schedule for each service, receive and review proposals, accept proposals, hire the same professional for multiple requirements of one event, hire different professionals for different requirements, make bKash payments, complete services, review professionals, and raise disputes with evidence.

### Professional

Professionals **cannot directly register as active professionals**. They must submit an application containing personal and professional information, services, skills, experience, previous work and portfolio information. Admin reviews the application; only approved applicants become active professionals.

Active professionals can manage their profile, multiple services, skills, experience, portfolio, availability and time-off; enable/disable `acceptingBookings`; browse events; submit proposals for suitable service requirements; provide contracted services; receive payments; review clients; and raise disputes.

A professional may provide multiple services and may be hired for multiple service requirements of the same event. `acceptingBookings = false` prevents new bookings but does not invalidate existing confirmed contracts.

### Admin

Admin manages clients, professionals, professional applications, events, service requirements, proposals, contracts, payments, disputes, evidence and platform-level operations. Admin can approve/reject professional applications and resolve disputes.

## 3. Authentication and Authorization

Only clients use the normal public registration flow. Client authentication supports:

1. Credential authentication.
2. Google OAuth.

Professionals follow:

```text
Professional Application → Admin Review → Approval → Professional Account/Profile
```

Admin accounts are controlled by the platform and may be seeded/created administratively.

Every protected operation must verify authentication, identity, role and resource ownership/permission.

## 4. Professional Application

A dedicated application process is required. Applications may contain personal information, contact information, professional title/description, services, skills, experience, previous work, portfolio information and supporting information.

Application statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`

Only an approved application can create/activate a professional.

## 5. Profiles

### Client Profile

May contain name, contact information, profile image, location, bio and other required information.

### Professional Profile

May contain name, profile image, professional title, bio, location, contact information where appropriate, experience, skills, services, availability, booking preference and rating information.

## 6. Professional Services, Skills and Experience

A professional can provide **multiple services**, such as photography, videography, drone coverage, decoration, makeup or sound management.

A professional service may contain service name/category, description, pricing information, service details and metadata.

Professionals can maintain skills and experience. Experience may contain position/title, description, organization/client, start date, end date and relevant details.

## 7. Professional Portfolio

Professionals can maintain multiple portfolio items showcasing previous/major events. Items may contain title, description, event/work type, media, external URL, date and other relevant information. Cloudinary may be used for media storage.

## 8. Professional Availability

Professionals can manage recurring availability rules and specific unavailable/time-off periods. Availability must be checked before accepting proposals and creating contracts.

## 9. Event Management

Clients can create and publish events containing:

- Title
- Description
- Event type/category
- Location
- Overall `startAt`
- Overall `endAt`
- Status
- Other event details

The overall event time describes the event, while each service requirement has its own actual service time.

## 10. Event Service Requirements

An event can contain multiple independent service requirements:

```text
Wedding
├── Photography
├── Videography
├── Drone
├── Makeup
└── Decoration
```

Each requirement must have its own service type/name, description, **budget**, `startAt`, `endAt`, status and relevant requirements.

The client must specify a **separate budget for every required service**.

Example:

```text
Photography → 30,000 BDT
Videography → 25,000 BDT
Drone       → 10,000 BDT
Makeup      → 15,000 BDT
Decoration  → 40,000 BDT
```

## 11. Date and Time Rules

Date/time handling is critical throughout the platform. Actual timestamps must use PostgreSQL/Prisma `DateTime` values consistently.

For every event, service, proposal and contract time range:

```text
startAt < endAt
```

must be true.

Event and service schedules may differ where business rules permit. For example:

```text
Event:       4:00 PM → 10:00 PM
Drone:       5:00 PM → 7:00 PM
Photography: 4:00 PM → 10:00 PM
Makeup:      2:00 PM → 5:00 PM
```

The backend must validate service timing according to the platform's scheduling rules.

## 12. Professional Time Conflict Rules

A professional cannot accept overlapping service periods.

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

means the periods overlap.

Therefore `10:00–12:00` and `12:00–15:00` are allowed, while `10:00–14:00` and `12:00–16:00` conflict.

Conflict checks must consider contracts from the same or different events, multiple services assigned to the same professional, availability rules and time-off periods.

A professional can work on multiple services/events on the same date if their actual service periods do not overlap.

## 13. Multiple Services by One Professional

A professional is **not limited to one service per event**.

Valid example:

```text
Wedding
├── Photography → Professional A
├── Videography → Professional A
├── Drone → Professional A
├── Makeup → Professional B
└── Decoration → Professional B
```

Professional A can have multiple contracts for the same event as long as the service periods do not overlap.

Each service requirement is treated as an independent booking requirement.

## 14. Proposal System

A proposal belongs to one professional and one event service requirement. A professional may propose for multiple requirements of the same event when qualified.

A proposal may contain proposed amount, proposed `startAt`, proposed `endAt`, message/details and status.

Proposal statuses:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`
- `EXPIRED`

## 15. Proposal and Requirement Exclusivity

Each individual event service requirement can have only **one active hired professional**.

Valid:

```text
Wedding
├── Photography → Professional A
├── Videography → Professional B
└── Drone → Professional A
```

Invalid:

```text
Photography
├── Professional A → accepted
└── Professional B → accepted
```

Once a requirement has an active/accepted/confirmed contract, another professional cannot be hired for that same requirement. Other unfilled requirements remain open.

Cancelled/rejected/expired proposals or contracts must not unnecessarily block future hiring.

Proposal acceptance and contract creation must use transactional/race-safe logic so two professionals cannot simultaneously become the hired professional for one requirement.

## 16. Contract System

A contract is created when the client accepts a professional proposal.

A contract represents one client, one professional, one event, one specific event service requirement and one professional service.

It should contain agreed amount, agreed service `startAt`/`endAt`, status, terms/details, creation date and completion/cancellation information where necessary.

The contract time must be validated again when created/accepted.

Contract statuses may include:

- `PENDING`
- `CONFIRMED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `DISPUTED`
- `RESOLVED`

Invalid state transitions must be rejected.

## 17. Payment System

The payment provider is **bKash**. Payment status must be verified by the backend; the frontend must never be trusted to declare payment success.

Payments are associated with contracts.

### Payment Schedule

```text
30% → Initial/Upfront Payment
70% → Final Payment
```

The initial 30% is paid upfront. The remaining 70% is paid after the service/event is finished and required completion conditions are satisfied.

Payment records should support contract, payment stage, amount, currency, payment method, bKash information, transaction/reference information, payment status, transaction time, failure reason and metadata.

Payment stages:

- `INITIAL`
- `FINAL`

Possible payment statuses:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`
- `CANCELLED`
- `REFUNDED`

Successful bKash payments must be verified server-side.

## 18. Service Completion

After contracted work is delivered, the service/contract can be marked completed according to the workflow. The final 70% becomes payable/processable according to the business rules. Reviews become available after the required completion/payment conditions.

Completion must be verified by the backend.

## 19. Reviews and Ratings

After successful completion, both sides can review each other:

```text
Client → Professional
Professional → Client
```

A review may contain rating, comment, contract, reviewer, reviewee and creation date. A reviewer cannot create unlimited duplicate reviews for the same contract and direction.

## 20. Dispute Management

Either client or professional can raise a dispute for issues such as:

- Client non-payment.
- Professional no-show.
- Service not delivered.
- Material service/quality failure.
- Contractual violation.
- Other legitimate contract-related issues.

A dispute should contain contract, raised-by user, reason, description, status, resolution information and timestamps.

## 21. Dispute Evidence

Disputes require sufficient supporting evidence. Evidence may include images, documents, screenshots, other media and descriptions. Cloudinary may be used for appropriate media storage.

Evidence must be associated with the relevant dispute and protected from unauthorized access.

## 22. Admin Dispute Resolution

Admin can inspect event, service requirement, proposal, contract, payment records, user information, evidence and completion information before resolving a dispute.

Possible dispute statuses:

- `OPEN`
- `UNDER_REVIEW`
- `RESOLVED`
- `REJECTED`
- `CLOSED`

## 23. Notifications and Email

Notifications should cover important events such as application decisions, new/updated proposals, contracts, payment requirements/results, upcoming services, completion, reviews and disputes.

Nodemailer may be used for transactional email including account, application, proposal, contract, payment, completion and dispute notifications.

## 24. Media Storage

Cloudinary may be used for profile images, professional portfolios, event media, deliverables and dispute evidence. The database should store URLs/references and metadata rather than large binary files.

## 25. Deliverables and Revisions

Where applicable, professionals may submit deliverables containing contract reference, title, description, media URL, submission date, status and metadata.

For services where revisions are applicable, revision requests may contain deliverable reference, requester, description, status, requested date and completion date.

## 26. Location and Matching

CraftBridge is a local event platform, so location matters. Matching may consider:

- Service
- Skills
- Location
- Availability
- Service schedule
- Rating
- Experience
- Portfolio
- Pricing
- `acceptingBookings`

Professionals who cannot actually serve the required time period should not be recommended as suitable matches.

## 27. Core Business Rules

1. **Role restriction:** only clients directly register through the normal registration flow.
2. **Professional approval:** a professional cannot become active without admin approval.
3. **Service-specific budget:** every event service requirement has its own budget.
4. **Service-specific schedule:** every event service requirement has its own service time range.
5. **One active professional per requirement:** one requirement cannot have multiple simultaneously active hired professionals.
6. **Multiple services per professional:** one professional can be hired for multiple requirements of the same event.
7. **No time overlap:** a professional cannot have overlapping confirmed/active service contracts.
8. **Availability:** a professional cannot accept work during blocked/unavailable periods.
9. **Booking preference:** a professional not accepting new bookings cannot accept a new contract.
10. **Payment verification:** payment success is verified by the backend.
11. **Two-stage payment:** contract payment follows 30% + 70%.
12. **Review eligibility:** reviews are available only after required completion conditions.
13. **Dispute evidence:** disputes require sufficient supporting information/evidence.
14. **Transactional booking:** proposal acceptance and contract creation must protect against race conditions.
15. **Date/time validation:** every relevant workflow transition validates timestamps and scheduling conflicts.

## 28. Time-Sensitive Workflow Validation

The backend must handle cases including:

- Proposal accepted after service time has passed.
- Contract created with a conflicting confirmed contract.
- Professional becomes unavailable after proposal submission.
- Professional disables `acceptingBookings` before acceptance.
- Requirement is already filled when another proposal is accepted.
- Contract cancellation frees the professional's schedule.
- Proposal expires before acceptance.
- Final payment attempted before completion.
- Final payment attempted after a dispute is opened.
- Simultaneous booking attempts for overlapping periods.

These checks must be performed server-side.

## 29. Database Architecture

Technology:

- PostgreSQL
- Prisma ORM
- Prisma 7

Major domains:

```text
Authentication
    ├── User
    └── Client

Professional Management
    ├── ProfessionalApplication
    ├── Professional
    ├── ProfessionalService
    ├── Skill
    ├── ProfessionalSkill
    ├── Experience
    └── PortfolioItem

Availability
    ├── AvailabilityRule
    └── TimeOff

Event Management
    ├── Event
    └── EventServiceRequirement

Hiring
    ├── Proposal
    └── Contract

Payment
    └── Payment

Service Delivery
    ├── Deliverable
    └── Revision

Feedback
    └── Review

Dispute
    ├── Dispute
    └── DisputeEvidence

Communication
    └── Notification
```

**No `AuditLog` model is required.**

## 30. Core Relationships

Conceptually:

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
    ├── Availability
    ├── TimeOff
    ├── Proposals
    └── Contracts
```

A contract connects the client, professional, event, service requirement and professional service, and may have payments, deliverables, revisions, reviews and disputes.

## 31. API Architecture

Base API path:

```text
/api/v1
```

Architecture:

```text
Routes
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Routes define endpoints and route-level middleware. Middleware handles authentication, authorization, validation, errors, rate limiting where necessary and file handling where required. Controllers remain thin and handle request extraction, service calls and responses. Services contain business logic, transactions, scheduling checks, permissions, payment verification and workflow transitions. Prisma handles database access.

## 32. Validation

Validation is required for authentication, profiles, applications, services, skills, experience, portfolio, availability, events, service requirements, proposals, contracts, payments, reviews, disputes and evidence.

Validation must include date/time consistency and business rules.

## 33. Error Handling

The API should return consistent errors for validation, authentication, authorization, missing resources, duplicates, scheduling conflicts, invalid workflow transitions, payment failures, availability conflicts, already-filled requirements, dispute restrictions and external service failures.

## 34. Security Requirements

The backend must:

- Hash passwords securely.
- Validate authentication tokens.
- Enforce role-based access control.
- Validate resource ownership.
- Validate uploaded files.
- Protect sensitive payment information.
- Never trust frontend payment status.
- Protect payment/webhook verification endpoints.
- Apply rate limiting to sensitive endpoints where appropriate.
- Avoid exposing sensitive user information.

## 35. Optional Infrastructure

### Redis

Optional uses include caching, rate limiting, temporary state and performance optimization.

### Cloudinary

Media storage.

### Nodemailer

Transactional email.

### bKash

Payment processing.

## 36. End-to-End Client Flow

```text
Register/Login
      ↓
Create Profile
      ↓
Create Event
      ↓
Add Required Services
      ↓
Set Budget + Service Time
      ↓
Publish Event
      ↓
Receive Proposals
      ↓
Review Professionals
      ↓
Accept Proposal
      ↓
Contract Created
      ↓
Pay 30%
      ↓
Service Delivered
      ↓
Mark/Verify Completion
      ↓
Pay 70%
      ↓
Review Professional
```

## 37. End-to-End Professional Flow

```text
Submit Professional Application
      ↓
Admin Approval
      ↓
Professional Account Activated
      ↓
Complete Profile
      ↓
Add Services
      ↓
Add Skills/Experience
      ↓
Add Portfolio
      ↓
Configure Availability
      ↓
Enable Accepting Bookings
      ↓
Browse Events
      ↓
Submit Proposals
      ↓
Proposal Accepted
      ↓
Contract Confirmed
      ↓
Provide Service
      ↓
Complete Service
      ↓
Receive Payment
      ↓
Review Client
```

## 38. End-to-End Admin Flow

```text
Review Professional Applications
          ↓
Approve/Reject
          ↓
Monitor Events
          ↓
Monitor Proposals
          ↓
Monitor Contracts
          ↓
Monitor Payments
          ↓
Review Disputes
          ↓
Review Evidence
          ↓
Resolve Disputes
```

## 39. Core Business Example

```text
Event: Wedding
Overall Time: 4:00 PM → 10:00 PM

Photography
Budget: 30,000 BDT
Time: 4:00 PM → 10:00 PM

Videography
Budget: 25,000 BDT
Time: 4:00 PM → 10:00 PM

Drone
Budget: 10,000 BDT
Time: 5:00 PM → 7:00 PM

Makeup
Budget: 15,000 BDT
Time: 2:00 PM → 5:00 PM

Decoration
Budget: 40,000 BDT
Time: 1:00 PM → 4:00 PM
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

This is valid if each professional is qualified, accepting bookings, available during the required periods, and has no overlapping contracts. Each service requirement can have only one active hired professional.

## 40. Final Project Objective

CraftBridge should provide a reliable local event-service platform where:

- Clients organize events.
- Events contain multiple independently budgeted and scheduled services.
- Professionals are verified through admin approval.
- Professionals can provide multiple services.
- Professionals can propose for multiple services within one event.
- The same professional can be hired for multiple services of one event.
- Different professionals can handle different services of the same event.
- Scheduling conflicts are prevented.
- Contracts formalize agreements.
- Payments follow 30% upfront and 70% final payment.
- bKash payments are verified server-side.
- Completed contracts enable mutual reviews.
- Disputes can be raised with evidence.
- Admin can investigate and resolve disputes.
- The architecture remains modular, maintainable, secure and scalable.

The implementation must prioritize **business-rule correctness, data integrity, role-based authorization, date/time consistency, transactional safety and reliable payment verification**.
