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

## Planned

- Provider services UI.
- Marketplace UI.
- Marketplace URL state.
- Authentication.
- Company onboarding.
- Company memberships / RBAC.
- Customers.
- Booking.
- Service requests.
- Service orders.
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
