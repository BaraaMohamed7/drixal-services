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
| 7. Customer Request Intent | Capture customer interest without full auth/booking | Public request form, request API, provider request list | Visitors can submit a service request and provider can view it |

## Frontend Rule

Each milestone has two completion gates:

- Backend/API behavior is implemented and verified.
- A corresponding modern, simple, responsive UI exists for the user-facing workflow introduced by that milestone.

If a milestone is backend-heavy, the UI can be a minimal operational screen, but it must still demonstrate the new capability visually.

## Progress

| Milestone | Status |
| --- | --- |
| 0. Foundation Alignment | Implemented |
| 1. Service Catalog API | Implemented with provider UI |
| 2. Publication Lifecycle | Implemented with provider UI actions |
| 3. Marketplace API | Implemented with marketplace UI |
| 4. Provider UI | Implemented |
| 5. Marketplace UI | Implemented and compacted |
| 6. Demo Hardening | Implemented |
| 7. Customer Request Intent | Implemented |
| 8. Customer Directory | Implemented |
| 9. Request Lifecycle | Implemented |
| 10. Service Orders | Implemented |
| 11. Service Order Details and Lines | Implemented |
| 12. Scheduling and Assignments | Implemented |
| 13. Authentication and Company Memberships | Implemented foundation |
| 14. RBAC and Permissions | Implemented |
| 15. Company Onboarding and Approval | Implemented |
| 16. Operational Dashboard | Planned |
| 17. Notifications | Planned |
| 18. Payments and Invoices | Planned |
| 19. Reviews and Quality Signals | Planned |
| 20. Company Subscriptions | Planned |
| 21. External ERP Integrations | Planned |

## Current Scope

Milestones 8-10 extend the visible operations workflow after the customer request intent slice.

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

### Milestone 3 Tasks

- Shape public marketplace API responses for stable service cards and detail pages.
- Support `search`, `category`, `city`, `minPrice`, and `maxPrice` filters.
- Enforce published active services from approved companies.
- Add marketplace list UI with URL-backed filters.
- Add public service detail UI.

### Milestone 4 Tasks

- Add provider services list UI.
- Add provider create service UI.
- Add provider edit service UI.
- Add provider publish/unpublish controls.
- Preserve provider search/status filters in the URL.

### Milestone 5 Tasks

- Complete marketplace list UI.
- Complete public service detail UI.
- Persist marketplace filters in URL query parameters.
- Fix horizontal overflow on small screens.
- Reduce oversized typography, spacing, and card styling.

### Milestone 6 Tasks

- Add loading, error, and empty states for provider and marketplace pages.
- Keep README progress aligned with implemented scope.
- Verify build, seed, server startup, and core API demo flow.
- Document the demo flow for the current vertical slice.

### Milestone 7 Tasks

- Add `service_requests` model.
- Add public API to submit a request for a published service.
- Add provider API to list demo company requests.
- Add public request form to service detail page.
- Add provider request inbox UI.

### Milestone 8 Tasks

- Add `customers` model.
- Create/update customers from public request submission.
- Add provider customer list API with search.
- Add provider customer directory UI using a compact business table.

### Milestone 9 Tasks

- Expand service request lifecycle statuses.
- Add approve/reject request actions.
- Add provider request inbox lifecycle buttons.
- Preserve existing request list filtering.

### Milestone 10 Tasks

- Add `service_orders` model.
- Add service order listing and creation API.
- Convert approved requests into service orders.
- Add provider service orders UI using table-based operations layout.

### Milestone 11 Tasks

- Add service order line data model embedded under service orders.
- Add service order detail API.
- Add service order line creation API.
- Add service order detail page with overview, service lines table, and summary panel.
- Link service order list rows to service order details.

### Milestone 12 Tasks

- Add assignment fields and scheduling filters.
- Add provider schedule/assignments UI.
- Support assigning a technician/person name to service order lines.
- Add compact operational date views without full calendar complexity.

### Milestone 13 Tasks

- Add authentication foundation.
- Add company membership model.
- Replace demo-company-only behavior with authenticated company context where appropriate.
- Preserve demo mode for local evaluation.
- Add demo session API and shell account context.

### Milestone 14 Tasks

- Add roles and a centralized permissions model.
- Protect provider APIs with active-membership and permission checks.
- Hide unavailable navigation and actions by permission.
- Preserve manager demo access and add viewer/technician demo identities for verification.

### Milestone 15 Tasks

- Add public company registration with pending status and owner membership creation.
- Add provider company profile and approval-status UI.
- Add super-admin company review, approval, rejection, suspension, and reactivation workflow.
- Enforce approval rules across marketplace publishing and public discovery.

### Milestone 16 Tasks

- Add operational dashboard with attention-first KPIs.
- Show open requests, active orders, overdue/scheduled work, and recent operational activity.
- Keep dashboard compact and table-driven where possible.

### Milestone 17 Tasks

- Add notifications model.
- Emit notifications for request submission, approval, conversion, and order status changes.
- Add provider notification list UI.

### Milestone 18 Tasks

- Add invoice/payment data model.
- Generate invoices from completed service orders.
- Add invoice list/detail UI.

### Milestone 19 Tasks

- Add review model for completed services/orders.
- Add public/provider review visibility rules.
- Add restrained quality signals to marketplace and provider views.

### Milestone 20 Tasks

- Add company subscription model.
- Add subscription status checks for provider capabilities.
- Add administration UI for subscription state.

### Milestone 21 Tasks

- Add external ERP integration configuration model.
- Add integration health/status UI.
- Add export/sync placeholders for service orders, customers, invoices, and activity.

## Deferred From Current Scope

- Full booking lifecycle.
- Resource and asset management beyond basic assignments.
- Advanced service execution checklists.
