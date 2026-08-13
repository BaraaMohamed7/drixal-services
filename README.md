# Drixal Service Platform

Standalone-first service platform built with Nuxt 4, TypeScript, MongoDB, and Mongoose.

## Implemented

- MongoDB/Mongoose setup.
- Company model.
- Service category model.
- Service catalog model.
- Seed data for demo companies, categories, and services.
- Provider service listing.
- Service creation.
- Service editing.
- Service detail retrieval.
- Service publication lifecycle.
- Publish/unpublish endpoints.
- Public marketplace API foundation.
- Public service details API foundation.
- Provider services UI.
- Provider service create/edit UI.
- Marketplace UI with URL-backed filters.
- Public service detail UI.
- Compact responsive UI pass with horizontal overflow fixes.
- Demo-ready loading, error, and empty states.
- Lightweight customer service request intent.
- Public service request form.
- Provider request inbox UI.
- Customer directory model, API, and provider UI.
- Service request approve/reject/convert lifecycle.
- Service order model, API, conversion flow, and provider UI.
- Service order detail page with service lines.
- Scheduling and assignment view for active service orders.
- Inline service order line assignment updates.
- Argon2id password authentication with database-backed HTTP-only cookie sessions.
- Role-based permissions for provider APIs, navigation, and operational actions.
- Authenticated company registration with pending approval and owner membership creation.
- Super-admin company approval, rejection, suspension, and reactivation workflow.
- Provider company status screen with marketplace eligibility guidance.
- Four separate protected workspaces for Super Admin, Company Admin, Company Employee, and Customer roles.
- Customer-owned service requests and service orders with private tracking pages.
- Same-origin mutation checks, explicit session DTOs, and tenant-reference validation.

## Demo Flow

Seeded accounts use `DrixalDemo123!` unless `DEMO_PASSWORD` is set before `npm run seed`.

| Workspace | Login | Route |
| --- | --- | --- |
| Super Admin | `admin@drixal.example` | `/super-admin` |
| Company Admin | `manager@coolair.example` | Select `Cool Air Services`, then `/company-admin` |
| Company Employee | `technician@coolair.example` | Select `Cool Air Services`, then `/employee` |
| Customer | `customer@drixal.example` | `/customer` |

1. Sign in as the customer and submit a request from a service under `/marketplace`.
2. Sign in as the company manager, select `Cool Air Services`, and review it under `/company-admin/requests`.
3. Approve and convert the request, then manage it under `/company-admin/orders`.
4. Sign in as the customer and confirm the request/order are visible only under `/customer`.
5. Sign in as the technician, select `Cool Air Services`, and review operational work under `/employee/orders` and `/employee/schedule`.
6. Sign in as the super admin, select Platform Administration, and manage company approval under `/super-admin/companies`.
7. Register a new account at `/auth/register`, then submit a provider application at `/register/company`.
8. Pending, rejected, and suspended companies cannot publish services or appear in public marketplace results.

## Planned

- Full booking lifecycle.
- Service execution.
- Payments.
- Notifications.
- Reviews.
- Company subscriptions.
- External integrations.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

Create `.env` with a MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/service-engine
# Optional local seed password override. Use a strong secret outside demo environments.
DEMO_PASSWORD=DrixalDemo123!
# Production origin used for same-origin checks.
APP_ORIGIN=https://services.example.com
# Enable only behind a trusted proxy that sanitizes forwarding headers.
TRUST_PROXY=false
```

Seed demo data:

```bash
npm run seed
```

For an existing pre-authentication database, migrate account hashes and ownership links before deployment:

```bash
AUTH_MIGRATION_PASSWORDS='{"owner@example.com":"temporary-secret"}' \
AUTH_MIGRATION_LINK_CUSTOMERS=true \
npm run migrate:auth
```

The migration never invents passwords. It reports unresolved users and leaves ambiguous customer links unchanged for operator review.

Enable multiple company memberships and Personal/company workspace selection on an existing database:

```bash
npm run migrate:workspaces
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
