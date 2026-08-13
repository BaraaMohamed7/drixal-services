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

## Demo Flow

1. Open `/provider/services`.
2. Create a service from `/provider/services/new`.
3. Confirm the new service starts as `DRAFT`.
4. Open `/marketplace` and verify the draft is hidden.
5. Publish the service from provider UI.
6. Search and filter it in `/marketplace`.
7. Open the public service details page.
8. Submit a request from the service details page.
9. Open `/provider/requests` and confirm the request appears.
10. Approve the request and convert it into a service order.
11. Open `/provider/orders` and confirm the order appears.
12. Open a service order and add a service line.
13. Open `/provider/customers` and confirm the customer appears.
14. Unpublish the service and confirm it is hidden again.

## Planned

- Authentication.
- Company onboarding.
- Company memberships / RBAC.
- Customers.
- Full booking lifecycle.
- Full booking lifecycle.
- Scheduling.
- Service execution.
- Payments.
- Notifications.
- Dashboards.
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
```

Seed demo data:

```bash
npm run seed
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
