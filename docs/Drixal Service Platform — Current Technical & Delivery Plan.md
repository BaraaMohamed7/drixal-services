# Drixal Service Platform — Current Technical & Delivery Plan

**Status:** Working Plan  
**Architecture:** Standalone-first, integration-ready  
**Frontend / Full-stack Framework:** Nuxt 4 + TypeScript  
**Database:** MongoDB  
**Current Priority:** Deliver a working vertical slice before expanding the platform

---

# 1. Product Definition

The project is not only a Service Engine.

It is a **standalone multi-tenant Service Platform** with the Service Engine at its core.

The platform must:

- Work independently without Drixal ERP.
- Have its own users, companies, authentication, marketplace, payments, notifications, and dashboards.
- Allow service-provider companies to manage and execute services.
- Allow customers to discover and request/book services.
- Allow Super Admins to manage the platform.
- Support optional integration with Drixal ERP or other external systems later.

The supplied requirements explicitly include company onboarding/approval, a public marketplace, customer and company dashboards, subscriptions, payments, reviews, search, notifications, and booking lifecycle.

---

# 2. Main Architecture Principle

> **Standalone First — Integration Ready**

The platform must never require Drixal to function.

```text
Standalone Mode

Customer
   ↓
Service Platform
   ↓
Service Execution
   ↓
Invoice
   ↓
Payment
```

Optional integrated mode:

```text
Service Platform
       ↓
Integration Layer
       ↓
Drixal ERP / External ERP
```

External integration should extend the platform, not become a dependency of the core domain.

---

# 3. Core Product Areas

```text
Service Platform
│
├── Identity & Access
│
├── Companies & Multi-Tenancy
│
├── Company Subscriptions
│
├── Marketplace
│
├── Service Catalog
│
├── Requests & Bookings
│
├── Service Orders
│
├── Scheduling & Resources
│
├── Service Execution
│
├── Customer Assets
│
├── Quotations
│
├── Invoices
│
├── Payments
│
├── Reviews & Ratings
│
├── Notifications
│
├── Search & Filtering
│
├── Dashboards & Analytics
│
└── Integrations
```

These are domain/module boundaries, not necessarily MongoDB collections.

---

# 4. Main Actors

## Public Visitor

Can:

- Browse published companies.
- Browse published services.
- Search and filter marketplace.
- View company profiles.
- View service details.

Authentication is not required for browsing.

---

## Customer

Can:

- Register/login.
- Request services.
- Book services.
- Track bookings/orders.
- View service history.
- Receive quotations.
- Make payments.
- View invoices and outstanding balances.
- Receive notifications.
- Leave reviews after eligible completed services.

The requirements specify that authentication becomes necessary when the customer wants to book, request, purchase, or otherwise interact with a provider.

---

## Company User

A company user may act as:

```text
OWNER
ADMIN
SERVICE_MANAGER
AGENT
TECHNICIAN
FINANCE
```

The exact permissions depend on the user's company membership.

---

## Super Admin

Can:

- Approve/reject companies.
- Suspend/reactivate companies.
- Manage global categories.
- Manage subscription plans.
- Monitor companies and subscriptions.
- View platform statistics.
- Receive platform-level notifications.

---

# 5. Identity Model

There is one global `User` identity.

Do **not** create separate:

```text
CustomerUser
CompanyUser
TechnicianUser
```

A person can participate in different contexts.

Example:

```text
Ahmed

Customer of Company A

Technician at Company B

Owner of Company C
```

Therefore:

```text
User
  │
  ├── CompanyMembership → Company B / TECHNICIAN
  │
  └── CompanyMembership → Company C / OWNER
```

Customer interactions are not company memberships.

---

# 6. Company Membership Model

Use a separate MongoDB collection:

```text
company_memberships
```

instead of embedding all companies directly inside `users`.

Conceptual document:

```js
{
  userId,
  companyId,

  role,
  status,

  joinedAt,
  invitedBy
}
```

Reasons:

- Membership has its own lifecycle.
- Companies need to query their employees.
- Roles can change.
- Membership can be suspended.
- Invitations may be added.
- A user may belong to multiple companies.
- Company-scoped permissions will depend on membership.

---

# 7. Multi-Tenancy

A service provider company acts as a tenant.

Most operational documents must contain:

```text
companyId
```

Examples:

```text
services
serviceRequests
bookings
serviceOrders
resources
assets
invoices
payments
reviews
```

All backend queries must enforce company/tenant isolation.

Frontend filtering must never be treated as security.

---

# 8. Company Lifecycle

Initial lifecycle:

```text
PENDING_APPROVAL
        ↓
APPROVED
```

Possible alternatives:

```text
PENDING_APPROVAL → REJECTED

APPROVED → SUSPENDED

SUSPENDED → APPROVED
```

This is separate from company-membership status.

Example:

```text
Company = APPROVED

Owner Membership = ACTIVE

Technician Membership = SUSPENDED
```

Company registration and approval are explicit platform requirements.

---

# 9. Global Categories

Service categories belong to the platform rather than individual companies.

Examples:

```text
Automotive

Home Services

IT Services

Healthcare

Beauty & Personal Care

Professional Services
```

Super Admin manages the global category structure.

Companies associate their services with these categories.

---

# 10. Service Model Principle

Avoid industry-specific service types:

```text
CAR_REPAIR

SALON

CLINIC
```

Instead, services are composed from capabilities such as:

```text
Scheduling

Duration

Location

Resources

Customer Assets

Time Tracking

Materials

Tasks

Checklists

Pricing

Approval

Recurrence
```

Example:

```text
AC Maintenance

Scheduling: Required

Location: Customer

Asset: Required

Resource: Technician

Materials: Allowed

Pricing: Time & Materials
```

---

# 11. Service Publication

Service operational state and marketplace publication state must be treated separately.

Suggested initial fields:

```text
operationalStatus:
ACTIVE
INACTIVE
```

and:

```text
publicationStatus:
DRAFT
PENDING_REVIEW
PUBLISHED
UNPUBLISHED
SUSPENDED
ARCHIVED
```

The supplied requirements explicitly require service publication management and publication statuses.

The first implementation can support only:

```text
DRAFT
PUBLISHED
UNPUBLISHED
```

and expand later.

---

# 12. Request, Booking, and Service Order

These concepts are different.

## Service Request

Used when the customer describes a need/problem.

Example:

```text
"My laptop suddenly turns off."
```

The exact service may not be known.

---

## Booking

Used when the service is already known and scheduling is involved.

Example:

```text
Service:
AC Maintenance

Date:
18 August

Time:
10:00
```

---

## Service Order

Represents the actual work being executed.

```text
Request / Booking
        ↓
Service Order
        ↓
Execution
```

A Service Order may also be created internally without a marketplace request.

The supplied requirements expect a booking lifecycle through confirmation, rescheduling, cancellation, execution, payment, and review.

---

# 13. Service Order Model

The eventual Service Order acts as the execution container.

```text
ServiceOrder
│
├── ServiceOrderLines
├── Customer
├── Assets
├── Appointments
├── Resources
├── Tasks
├── Checklists
├── Time Entries
├── Materials
├── Attachments
├── Charges
├── Quotations
└── Invoice References
```

A Service Order can contain multiple service lines.

Ad-hoc service lines must be allowed for cases where work is discovered during diagnosis.

---

# 14. MongoDB Modeling Principles

MongoDB does **not** mean embedding everything.

Use a hybrid approach.

Prefer embedding when:

- Data is small.
- Data belongs entirely to the parent.
- It is normally read together.
- It has no significant independent lifecycle.

Example:

```js
serviceSnapshot: {
  name,
  description,
  price,
  pricingModel
}
```

Prefer separate collections when:

- Data grows independently.
- It is frequently queried independently.
- It has its own lifecycle.
- It requires pagination.
- Concurrent writes are expected.

Likely future collections include:

```text
users

companies

company_memberships

service_categories

services

service_requests

bookings

service_orders

service_order_lines

appointments

resources

customer_assets

service_tasks

checklists

time_entries

material_usage

quotations

invoices

payments

reviews

notifications

subscription_plans

company_subscriptions

external_references
```

Not all collections should be implemented immediately.

---

# 15. Payments

Payment must be modeled separately from Invoice.

```text
Invoice
   │
   └── Payments[]
```

Example:

```text
Invoice Total:
5,000

Payment #1:
2,000

Payment #2:
1,500

Paid:
3,500

Remaining:
1,500

Status:
PARTIALLY_PAID
```

The requirements explicitly require separate payment modeling, partial payments, outstanding balances, and payment history.

---

# 16. Two Payment Contexts

The platform must eventually support:

## Customer → Company

Payment for a provided service.

## Company → Platform

Payment for the company's platform subscription.

Company subscription payments and payment history are explicitly required.

Therefore the Payment domain must not be tightly coupled only to Service Orders.

---

# 17. Payment Gateway Integration

Use a provider abstraction.

```text
Payment Service
       │
       ↓
PaymentGateway
     /     \
Gateway A  Gateway B
```

Core payment logic must not contain provider-specific logic.

The requirements explicitly ask for a payment-integration abstraction that allows new gateways without changing the payment domain.

---

# 18. Notifications

Notifications are a platform-level domain.

Recipients include:

```text
Customer

Company Users

Super Admin
```

Use event-driven architecture:

```text
Domain Event
     ↓
Notification Service
     ↓
Notification
     ↓
Delivery Channel
```

Example:

```text
booking.created
      ↓
Company Notification
```

```text
company.registration.submitted
      ↓
Super Admin Notification
```

```text
payment.completed
      ↓
Customer + Company Notifications
```

The requirements explicitly include notifications for all three actor groups and a centralized notification center.

---

# 19. Search

There are two different search domains.

## Internal Search

Company operational search:

```text
Orders
Bookings
Requests
Customers
Assets
Payments
```

## Public Marketplace Search

Marketplace filtering must eventually support:

```text
Category
Service
Company
Location
Price
Availability
Rating
```

These are explicit marketplace requirements.

Start with MongoDB queries and indexes.

Do not add Elasticsearch or another search engine until scale proves it necessary.

---

# 20. Integration Model

Avoid adding:

```text
drixalId
```

to every entity.

Use a generic integration mapping concept:

```text
ExternalReference

integration
entityType
localEntityId
externalEntityId
```

Example:

```text
integration:
DRIXAL

entityType:
CUSTOMER

localEntityId:
local-123

externalEntityId:
drixal-901
```

This keeps integration generic.

Possible future integrations:

```text
Drixal ERP

Other ERP

CRM

Accounting System
```

---

# 21. Target Architecture

```text
Nuxt Application
│
├── Public Marketplace UI
├── Customer UI
├── Company Dashboard
└── Super Admin Dashboard
        │
        ↓
Nuxt Server/API
        │
        ↓
Application Services
        │
        ↓
Domain Modules
        │
        ↓
Repositories
        │
        ↓
MongoDB
```

Additional adapters:

```text
Payment Gateway

Notification Provider

External ERP

Storage Provider
```

---

# 22. Technology Stack

## Frontend

```text
Nuxt 4
Vue 3
TypeScript
```

Use the existing Drixal UI/design approach when eventually integrated.

---

## Backend

For the standalone prototype:

```text
Nuxt Server / Nitro
TypeScript
```

Business logic should not live directly inside page components.

Recommended flow:

```text
API Handler
     ↓
Application Service
     ↓
Domain Logic
     ↓
Repository
     ↓
MongoDB
```

---

## Database

```text
MongoDB
```

Use MongoDB's official driver or the ORM/ODM selected by the team.

Do not block the first vertical slice on building advanced repository abstractions.

---

# 23. Full Delivery Roadmap

## Phase 0 — Architecture Foundation

Define:

- Product boundaries.
- Standalone/integrated modes.
- Actors.
- Domain boundaries.
- Multi-tenancy strategy.
- MongoDB modeling rules.

**Status:** Mostly decided.

---

# Phase 1 — Identity & Companies

Implement:

```text
Users

Authentication

Companies

Company Registration

Company Memberships

Roles

Company Approval

Tenant isolation
```

Flows:

```text
Company registration
        ↓
Owner User
        ↓
Company
        ↓
OWNER membership
        ↓
Pending approval
```

---

# Phase 2 — Service Catalog & Publishing

Implement:

```text
Global Categories

Service Definitions

Service Creation

Service Editing

Service Activation

Service Publication Lifecycle
```

This phase is the basis of the current urgent vertical slice.

---

# Phase 3 — Public Marketplace

Implement:

```text
Published Services

Public Company Profiles

Public Service Details

Marketplace Search

Marketplace Filtering
```

Only services belonging to eligible approved companies should appear publicly.

---

# Phase 4 — Customers, Requests & Bookings

Implement:

```text
Customer registration/login

Service Request

Booking

Available slots

Booking lifecycle

Customer required information
```

---

# Phase 5 — Service Orders & Execution

Implement:

```text
Service Orders

Multiple Service Lines

Ad-hoc Service Lines

Tasks

Checklists

Notes

Attachments

Time Tracking

Material Usage
```

---

# Phase 6 — Scheduling, Resources & Assets

Implement:

```text
Appointments

Multiple visits

Resources

Employee assignment

Facilities/equipment

Customer Assets

Conflict detection
```

Advanced scheduling optimization remains future scope.

---

# Phase 7 — Commercial Layer

Implement:

```text
Pricing

Quotations

Approval

Invoices

Payments

Partial Payments

Outstanding Balance

Payment History

Payment Gateway abstraction
```

---

# Phase 8 — Notifications

Implement:

```text
Notification Center

Read/unread

Priority

Customer notifications

Company notifications

Super Admin notifications
```

Start with:

```text
In-App Notifications
```

Add email/SMS/WhatsApp later through adapters.

---

# Phase 9 — Dashboards & Analytics

## Customer Dashboard

```text
Bookings

Requests

Service History

Invoices

Payments

Notifications
```

## Company Dashboard

```text
Services

Bookings

Requests

Customers

Revenue

Payments

Resources

Reviews

Subscription
```

## Super Admin Dashboard

```text
Companies

Users

Services

Bookings

Requests

Payments

Revenue

Subscriptions

Platform Activity
```

These dashboards are explicit requirements.

---

# Phase 10 — Reviews

Implement:

```text
Ratings

Reviews

Review eligibility

Company ratings

Service ratings
```

Only eligible completed interactions should be reviewable.

---

# Phase 11 — Company Subscriptions

Implement:

```text
Subscription Plans

Plan Features

Limits

Pricing

Company Subscription

Start/End

Renewal

Subscription Payment History
```

The requirements explicitly require subscription plans and management for provider companies.

---

# Phase 12 — Integration Layer

Implement:

```text
External API

External References

Webhooks

ERP Adapter

Sync jobs
```

Example:

```text
Service Platform
      ↓
Drixal Integration Adapter
      ↓
Drixal ERP
```

---

# Phase 13 — Advanced Service Capabilities

After MVP validation:

```text
Contracts

Recurring Services

SLA

Warranty

Entitlements

Advanced Resource Capacity

Skills

Custom Workflows

Route Optimization

Advanced Search

Advanced Analytics
```

---

# 24. Immediate Delivery Slice

Because the current priority is to deliver a visible working piece quickly, the first implementation will **not follow the entire roadmap sequentially**.

Instead, implement one vertical slice across Phase 2 and Phase 3.

## Scope

```text
Company
    ↓
Create Service
    ↓
Draft Service
    ↓
Publish
    ↓
Public Marketplace
    ↓
Search / Filter
    ↓
Service Details
```

This validates:

- Service catalog.
- Company ownership.
- Publication lifecycle.
- Public marketplace.
- Search.
- Filtering.
- Public details.

---

# 25. Immediate MongoDB Collections

Implement only:

```text
companies

service_categories

services
```

Authentication and users may be mocked temporarily.

---

# 26. Immediate `companies` Model

```js
{
  _id,

  name,
  slug,
  description,

  status: "PENDING" | "APPROVED" | "SUSPENDED",

  location: {
    city,
    area
  },

  rating,

  createdAt,
  updatedAt
}
```

For demo data, use approved companies.

---

# 27. Immediate `service_categories` Model

```js
{
  _id,

  name,
  slug,

  isActive,

  createdAt,
  updatedAt
}
```

Seed examples:

```text
Automotive

Home Services

IT Services

Professional Services

Healthcare

Beauty & Personal Care
```

---

# 28. Immediate `services` Model

```js
{
  _id,

  companyId,
  categoryId,

  name,
  slug,
  description,

  pricing: {
    type: "FIXED" | "HOURLY" | "CUSTOM",
    amount,
    currency: "EGP"
  },

  duration,

  locationType:
    "PROVIDER" |
    "CUSTOMER" |
    "REMOTE" |
    "FLEXIBLE",

  scheduling: {
    required: Boolean
  },

  operationalStatus:
    "ACTIVE" | "INACTIVE",

  publicationStatus:
    "DRAFT" |
    "PUBLISHED" |
    "UNPUBLISHED",

  createdAt,
  updatedAt
}
```

---

# 29. Immediate API

## Provider Services

```http
GET /api/services
```

List services belonging to the demo company.

---

```http
POST /api/services
```

Create service.

New services start as:

```text
DRAFT
```

---

```http
GET /api/services/:id
```

Get service.

---

```http
PATCH /api/services/:id
```

Edit service.

---

```http
POST /api/services/:id/publish
```

Publish service.

Basic rule:

```text
Company must be APPROVED.
```

---

```http
POST /api/services/:id/unpublish
```

Remove service from public marketplace.

---

# 30. Marketplace API

```http
GET /api/marketplace/services
```

Supported query parameters:

```text
search

category

city

minPrice

maxPrice
```

Public query must always enforce:

```text
service.publicationStatus = PUBLISHED
```

and:

```text
company.status = APPROVED
```

---

```http
GET /api/marketplace/services/:id
```

Return:

- Service information.
- Company information.
- Pricing.
- Duration.
- Location type.
- Scheduling requirement.

---

# 31. Immediate UI Routes

```text
/provider/services

/provider/services/new

/provider/services/:id/edit

/marketplace

/marketplace/services/:id
```

---

# 32. Provider Services Page

Must support:

```text
List services

Search

Publication status

Create

Edit

Publish

Unpublish
```

Example:

```text
AC Maintenance

500 EGP

Customer Location

PUBLISHED

[Edit] [Unpublish]
```

---

# 33. Create Service Form

Fields:

```text
Name

Description

Category

Pricing Type

Price

Duration

Location Type

Requires Scheduling
```

Default:

```text
publicationStatus = DRAFT
```

---

# 34. Marketplace Page

Must contain:

```text
Search

Category Filter

Location Filter

Minimum Price

Maximum Price
```

Service cards contain:

```text
Service Name

Company

Location

Price

Duration

View Service
```

---

# 35. Marketplace URL State

Filters should be reflected in URL parameters.

Example:

```text
/marketplace
?search=maintenance
&category=home-services
&city=Alexandria
```

This allows:

- Refresh persistence.
- Shareable searches.
- Browser navigation.
- Direct filtered links.

---

# 36. Immediate MongoDB Indexes

At minimum:

```js
services.createIndex({
  companyId: 1,
  publicationStatus: 1
})
```

```js
services.createIndex({
  categoryId: 1,
  publicationStatus: 1
})
```

```js
companies.createIndex(
  { slug: 1 },
  { unique: true }
)
```

```js
services.createIndex({
  slug: 1
})
```

Additional search indexes can be introduced after query behavior is validated.

---

# 37. Immediate Seed Data

Create at least two companies.

Example:

```text
Cool Air Services
Alexandria
APPROVED
```

```text
TechFix
Alexandria
APPROVED
```

Services:

```text
AC Maintenance
500 EGP

AC Installation
1200 EGP

Emergency AC Repair
Custom Quote

Laptop Maintenance
400 EGP

Remote IT Support
300 EGP/hour
```

This makes filtering and marketplace behavior visible during the demo.

---

# 38. Immediate Demo Flow

Demonstrate:

```text
1. Open Provider Services.

2. Create:
   Laptop Cleaning

3. Show:
   Status = DRAFT.

4. Open Marketplace.

5. Verify:
   The service is not visible.

6. Publish Service.

7. Reload Marketplace.

8. Service appears.

9. Search:
   "Laptop".

10. Filter by category/location/price.

11. Open Service Details.

12. Show company and service information.
```

This proves both provider and marketplace sides of the vertical slice.

---

# 39. Immediate Definition of Done

The first slice is complete when:

- MongoDB connection works.
- Seed data works.
- Company services can be retrieved.
- Service can be created.
- Service can be edited.
- Service can be published.
- Draft services do not appear publicly.
- Published services appear publicly.
- Marketplace supports basic search/filtering.
- Service details page works.
- Basic error handling exists.
- README explains implemented and future scope.

---

# 40. Explicitly Deferred From First Slice

Do **not** implement yet:

```text
Authentication

Company registration

Company approval UI

Company memberships

Customer accounts

Booking

Service Requests

Service Orders

Scheduling Engine

Resources

Assets

Payments

Invoices

Notifications

Reviews

Company subscriptions

Dashboards

External ERP integration
```

These are still part of the architecture and roadmap; they are only deferred from the first delivery.

---

# 41. README Progress Section

Maintain:

```md
## Implemented

- Service catalog
- Service creation
- Service editing
- Service publication lifecycle
- Public marketplace
- Search
- Filtering
- Public service details

## Planned

- Authentication
- Company onboarding
- Company memberships / RBAC
- Customers
- Booking
- Service requests
- Service orders
- Scheduling
- Service execution
- Payments
- Notifications
- Dashboards
- Reviews
- Company subscriptions
- External integrations
```

---

# 42. Current Engineering Priorities

For every implementation decision:

1. Make the current vertical slice work end-to-end.
2. Keep company ownership explicit.
3. Keep standalone behavior intact.
4. Avoid coupling to Drixal.
5. Avoid industry-specific service logic.
6. Avoid prematurely implementing advanced abstractions.
7. Keep future integration boundaries visible.
8. Add complexity only when a real requirement needs it.

---

# 43. Core Architecture Rule

> **The system is a standalone multi-tenant service platform, not a Drixal-dependent module.**

And inside that platform:

> **A service is a composition of reusable capabilities, not an industry type.**

The implementation should therefore evolve toward:

```text
Platform
   ↓
Company
   ↓
Service Catalog
   ↓
Marketplace / Request / Booking
   ↓
Service Order
   ↓
Execution
   ↓
Quotation / Invoice
   ↓
Payment
```

while supporting external ERP integrations through adapters rather than embedding ERP-specific logic into the core domain.