# Drixal Service Platform Milestone Delivery Plan

## Delivery Strategy

Deliver a visible vertical slice first, then expand toward the full standalone multi-tenant platform. Every backend phase must finish with a matching frontend UI before the next product phase is considered complete.

The current vertical slice is:

```text
Company
  -> Create Service
  -> Draft Service
  -> Publish
  -> Public Marketplace
  -> Search / Filter
  -> Service Details
```

## Milestones

| Milestone | Goal | Main Deliverables | Completion Criteria |
| --- | --- | --- | --- |
| 0. Foundation Alignment | Align the codebase with the immediate slice architecture | MongoDB config, `companies`, `service_categories`, `services`, seed data, README progress | App builds, seed data loads, models match the technical plan |
| 1. Service Catalog API | Provider can manage company services | Provider CRUD API for demo company services | Services can be listed, created, viewed, and edited |
| 2. Publication Lifecycle | Control public visibility | Publish/unpublish API, approved-company publishing rule | Draft services stay private, published services become public |
| 3. Marketplace API | Public service discovery | Public listing/detail API with search and filters | Marketplace returns only published services from approved companies |
| 4. Provider UI | Visible provider workflow | `/provider/services`, create/edit screens | Provider can manage services from UI |
| 5. Marketplace UI | Visible public workflow | `/marketplace`, service details, URL filters | Visitors can search, filter, and open service details |
| 6. Demo Hardening | Make the slice demo-ready | Loading/error/empty states, validation, README update | Immediate Definition of Done is satisfied |

## Frontend Rule

Each milestone has two completion gates:

- Backend/API behavior is implemented and verified.
- A corresponding modern, simple, responsive UI exists for the user-facing workflow introduced by that milestone.

If a milestone is backend-heavy, the UI can be a minimal operational screen, but it must still demonstrate the new capability visually.

## Progress

| Milestone | Status |
| --- | --- |
| 0. Foundation Alignment | Implemented |
| 1. Service Catalog API | Backend implemented, UI in progress |
| 2. Publication Lifecycle | Backend implemented, UI in progress |
| 3. Marketplace API | Next |
| 4. Provider UI | Planned |
| 5. Marketplace UI | Planned |
| 6. Demo Hardening | Planned |

## Current Scope

Milestone 3 is the next implementation target.

### Milestone 0 Tasks

- Configure Mongoose for the existing MongoDB environment variables.
- Add `Company` model.
- Add `ServiceCategory` model.
- Align `Service` model to the immediate plan fields.
- Add seed data for demo companies, categories, and services.
- Add a seed command.

### Milestone 1 Tasks

- Implement provider service listing for the demo company.
- Implement service creation.
- Implement service detail retrieval.
- Implement service editing.
- Keep authentication mocked/deferred.
- Keep tenant ownership explicit through `companyId`.
- Add provider services UI for list/create/edit.

### Milestone 2 Tasks

- Add dedicated publish endpoint.
- Add dedicated unpublish endpoint.
- Enforce approved-company rule before publishing.
- Prevent generic service editing from changing publication status.
- Keep draft/unpublished services hidden from public marketplace queries.
- Add provider UI actions for publish and unpublish.

## Deferred From Current Scope

- Authentication.
- Company registration and approval UI.
- Company memberships and RBAC.
- Bookings and service requests.
- Service orders and execution.
- Scheduling, resources, and assets.
- Payments and invoices.
- Notifications.
- Reviews.
- Company subscriptions.
- External ERP integrations.
