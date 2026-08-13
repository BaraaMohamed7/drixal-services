# Drixal User Flow and UX Implementation Plan

## Product Model

Drixal is a multi-tenant service-shop SaaS. One global account can:

- Use an always-available Personal workspace to request and track services.
- Create and own one or more companies.
- Join one or more companies through secure invitations.
- Hold a different role in each company.
- Switch explicitly between Personal, company, and platform-administration contexts.

Personal activity belongs to the user. Operational data belongs to the selected company tenant. Switching context must never merge data or weaken tenant isolation.

## Primary Journeys

### Customer

`Browse -> service details -> sign in or register -> request -> provider review -> appointment -> execution -> completion`

The customer must always be able to see their requests and orders, including after creating or joining a company.

### Company Manager

`Review request -> approve or reject -> convert -> assign employee -> schedule -> monitor -> close`

The manager experience is organized around decisions and exceptions: new requests, unassigned work, unscheduled work, overdue work, and blocked work.

### Employee

`Accept invitation -> select company -> review assigned work -> start -> update lines -> hold or resume -> complete`

Employees can execute only work assigned to their active membership. They cannot change pricing, tenant ownership, or company-level configuration.

### Company Owner

`Create company -> await approval -> configure services -> invite team -> publish -> operate`

Creating another company remains available from Personal even when the user already has memberships.

### Super Administrator

`Review company context -> approve or reject with reason -> suspend or reactivate`

Platform permissions remain independent from company membership permissions.

## Information Architecture

The workspace switcher contains:

```text
Personal
Company A - Owner
Company B - Technician
Platform Administration - Super Admin only
```

Navigation by context:

| Context | Navigation |
| --- | --- |
| Personal | Overview, Requests, Orders, Marketplace |
| Company management | Overview, Requests, Orders, Schedule, Customers, Services, Team, Company |
| Company employee | My Work, Schedule |
| Platform administration | Overview, Companies |

Existing route families remain during implementation:

- Personal: `/customer/**`
- Company management: `/company-admin/**`
- Company employee: `/employee/**`
- Platform administration: `/super-admin/**`
- Public marketplace: `/marketplace/**`

## Lifecycle Contracts

### Requests

```text
NEW -> UNDER_REVIEW -> APPROVED -> CONVERTED
                    -> REJECTED

NEW or UNDER_REVIEW -> CANCELLED by the customer
```

### Orders

```text
DRAFT -> ASSIGNED -> SCHEDULED -> IN_PROGRESS -> COMPLETED
                                  <-> ON_HOLD

Any non-terminal order -> CANCELLED by a manager
```

Assignment and scheduling may be presented as one manager form, but the server records and validates both transitions.

## Phase 1: Identity and Workspaces

### Scope

- Allow multiple active company memberships per account.
- Add a persisted active company to each auth session.
- Treat no active company as Personal context.
- Return all memberships and active context from the session API.
- Add a protected endpoint for switching Personal/company context.
- Add the switcher to desktop and mobile workspace navigation.
- Keep Personal routes available to company members and super administrators.
- Route company pages using the selected membership and its role.
- Allow an existing company member to create another company.
- Select a newly created company and refresh the client session.
- Preserve `next` when moving between login and registration.
- Provide an explicit migration for the old globally unique membership index.

### Acceptance Criteria

1. A new account opens Personal and can browse, request, and track work.
2. A company member can switch between Personal and each active company.
3. The selected company controls all company-scoped permissions and APIs.
4. Selecting an arbitrary company without membership is rejected.
5. A user with different roles in two companies receives the correct navigation and permissions for each.
6. A stale selected membership safely falls back to Personal.
7. Personal remains available to company members and super administrators.
8. Existing single-company accounts continue to work after migration.
9. Switching contexts works in English LTR and Arabic RTL on desktop and mobile.

## Phase 2: Team and Employee Onboarding

- Add a company Team page.
- Add hashed, expiring, single-use invitations.
- Let Owner/Admin choose an email and non-owner role.
- Provide a copyable invitation link until outbound email exists.
- Support login or registration before invitation acceptance.
- Require the authenticated email to match the invitation.
- Support role changes, suspension, removal, and invitation revocation.
- Prevent removal or demotion of the sole owner.

## Phase 3: Marketplace and Requests

- Use provider-scoped public service URLs.
- Make service and company identifiers safe for Arabic content.
- Add pagination and independent category/city facets.
- Preserve the intended service through authentication.
- Prefill known personal contact information.
- Add strict request transition APIs and decision reasons.
- Add provider request detail and customer tracking timelines.
- Redirect successful conversion to the resulting draft order.

## Phase 4: Assignment, Scheduling, and Execution

- Replace free-text order assignment with active company memberships.
- Add explicit assignment and scheduling transitions.
- Add employee-safe start, hold, resume, line completion, and order completion actions.
- Add timestamps, actors, notes, and status history.
- Return server-calculated allowed actions.
- Replace the schedule table with a date-grouped agenda, plus unassigned and unscheduled queues.

## Phase 5: Customer Tracking and UX Foundations

- Return customer-specific DTOs without internal identifiers, costs, or notes.
- Show request decisions, appointment details, progress, and completion notes.
- Link converted requests to orders.
- Standardize page headers, detail drawers, confirmation dialogs, and mutation feedback.
- Distinguish loading, error, empty, and filtered-empty states.
- Replace mobile operational tables with record lists where actions would otherwise be hidden.
- Complete labels, keyboard behavior, focus management, and live announcements.
- Centralize localized status, enum, date, currency, and duration formatting.

## Migration Rules

- Drop the globally unique `{ userId: 1 }` company-membership index.
- Keep unique `{ companyId: 1, userId: 1 }` membership identity.
- Keep `{ userId: 1, status: 1 }` for account membership lookup.
- Existing sessions without `activeCompanyId` start in Personal.
- Never guess tenant, customer, or assignee links when migration data is ambiguous.
- Keep legacy statuses readable while applying strict transitions only to the new workflow version.
- Keep seed schemas and indexes aligned with application schemas.

## Verification Strategy

- API tests cover workspace selection, permissions, tenant isolation, invitations, and lifecycle transitions.
- Browser tests cover customer, manager, employee, company creation, invitation, and workspace-switching journeys.
- Each changed screen is checked in English LTR and Arabic RTL at desktop and mobile widths.
- A production build must pass at the end of every phase.

## Delivery Order

1. Identity and workspaces.
2. Team and invitations.
3. Marketplace and request state machine.
4. Order assignment, scheduling, and execution.
5. Customer-safe tracking and shared UX states.

Payments, reviews, notifications, and unrelated visual cleanup remain outside these phases until the core lifecycle works end to end.
