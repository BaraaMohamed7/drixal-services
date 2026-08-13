# Drixal Service Platform Design System

This product is an enterprise Service Management Platform. The UI must feel professional, reliable, structured, operational, modern but restrained, and suitable for daily use by business teams.

## Direction

- Use IBM Carbon principles, Nuxt UI components, Linear-level restraint, Stripe Dashboard information hierarchy, and modern ERP density as references.
- Do not copy any product visually.
- Function before decoration: every visual element must help users understand, act, navigate, identify status, or detect problems.
- This is not a marketing website. Avoid giant headings, oversized cards, excessive whitespace, illustrations, gradients, glassmorphism, decorative blobs, neon colors, and excessive shadows.
- Prefer dense but comfortable enterprise workflows.
- Consistency over creativity: do not invent new colors, spacing values, radii, button styles, table styles, or badges unless required.

## Technology

- Use Nuxt, Vue, Tailwind CSS, and Nuxt UI.
- Prefer Nuxt UI components for buttons, inputs, selects, tables, badges, modals, drawers, dropdowns, tabs, tooltips, command palette, pagination, breadcrumbs, and alerts.
- Do not recreate existing Nuxt UI components using custom Tailwind markup without a clear reason.

## Brand Color

Official Drixal Brand Blue: `#2546F0`.

Use it for primary actions, active navigation, selected states, links where appropriate, focus indicators, brand accents, and important interactive elements. Do not replace it with generic Tailwind blue.

## Drixal Scale

| Token | Value |
| --- | --- |
| Drixal 50 | `#EEF1FF` |
| Drixal 100 | `#DFE5FF` |
| Drixal 200 | `#C4CEFF` |
| Drixal 300 | `#A0AFFF` |
| Drixal 400 | `#7489FF` |
| Drixal 500 | `#4B65F7` |
| Drixal 600 | `#2546F0` |
| Drixal 700 | `#1E39CC` |
| Drixal 800 | `#1D32A6` |
| Drixal 900 | `#1B2D82` |
| Drixal 950 | `#11194F` |

## Theme Architecture

- Support Light, Dark, and System themes.
- Components must use semantic tokens: background, surface, surface-muted, border, text-primary, text-secondary, primary, danger, success, warning.
- Avoid page-level hardcoded colors like `bg-white`, `text-gray-800`, `border-gray-200`, and `bg-blue-600`.
- Use Drixal semantic variables and Nuxt UI theme configuration.

## Light Theme Tokens

| Token | Value |
| --- | --- |
| Background | `#F7F8FC` |
| Surface | `#FFFFFF` |
| Surface raised | `#FFFFFF` |
| Surface muted | `#F3F5F9` |
| Surface hover | `#EEF1F6` |
| Surface selected | `#EEF1FF` |
| Border | `#E2E6EE` |
| Border strong | `#CBD2DE` |
| Text primary | `#111827` |
| Text secondary | `#475569` |
| Text muted | `#64748B` |
| Text disabled | `#94A3B8` |
| Brand | `#2546F0` |
| Brand hover | `#1E39CC` |
| Brand active | `#1D32A6` |
| Brand subtle | `#EEF1FF` |
| Brand subtle hover | `#DFE5FF` |
| Brand border | `#C4CEFF` |
| Brand text | `#2546F0` |
| Focus ring | `#7489FF` |

## Dark Theme Tokens

| Token | Value |
| --- | --- |
| Background | `#0B1020` |
| Surface | `#111827` |
| Surface raised | `#151E31` |
| Surface muted | `#1B2435` |
| Surface hover | `#202B3F` |
| Surface selected | `#182451` |
| Border | `#273449` |
| Border strong | `#35435B` |
| Text primary | `#F8FAFC` |
| Text secondary | `#CBD5E1` |
| Text muted | `#94A3B8` |
| Text disabled | `#64748B` |
| Brand | `#2546F0` |
| Brand hover | `#4B65F7` |
| Brand active | `#1E39CC` |
| Brand text | `#A0AFFF` |
| Brand icon | `#7489FF` |
| Brand subtle | `#161F4D` |
| Brand subtle hover | `#1B2865` |
| Brand border | `#354CC5` |
| Focus ring | `#7489FF` |

Dark mode must not simply invert light mode. Avoid pure black surfaces, neon blue, glowing borders, and excessive saturation.

## Semantic Colors

- Success: light `#15803D` on `#F0FDF4`, dark `#4ADE80` on `#102A1A`.
- Warning: light `#B45309` on `#FFFBEB`, dark `#FBBF24` on `#30220C`.
- Danger: light `#B91C1C` on `#FEF2F2`, dark `#F87171` on `#351517`.
- Information: light `#1D4ED8` on `#EFF6FF`, dark `#60A5FA` on `#10264D`.
- Never use Drixal blue to represent success, warning, or failure.

## Typography

- Use Inter or the existing professional sans-serif font.
- Page title: 24px, weight 600, line-height 32px.
- Page subtitle: 14px, regular, muted.
- Section title: 16-18px, weight 600.
- Body: 14px, line-height 20px.
- Secondary information: 13px, muted.
- Tables: 13-14px.

## Spacing

Use a 4px base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48. Avoid arbitrary spacing.

## Layout

- Desktop uses sidebar, top bar, and main content.
- Sidebar width should be roughly 240-260px and group related functionality.
- Major page header pattern: breadcrumb where useful, page title, primary action, short description, secondary actions.
- Do not place page titles inside decorative cards unless the existing page structure requires a simple bordered panel.

## Components

- Cards group meaningful information only. Avoid cards inside cards.
- Card styling: surface background, one default border, 8-10px radius, no shadow or extremely subtle shadow only when layering is needed.
- Radius: inputs/buttons 6-8px, cards 8-10px, dropdowns 8px, modals 10-12px, badges 4-6px.
- Use shadows only for dropdowns, modals, slideovers, floating menus, and command palette.

## Tables

- Tables are a primary interaction pattern for service definitions, service requests, service orders, users, companies, and customers.
- Do not convert structured business datasets into decorative card grids.
- Table toolbar usually contains search, filters, optional view controls, and primary action.
- Avoid exposing five action buttons in every row. Prefer a menu for secondary row actions.
- Do not alternate row colors unless it improves usability.

## Forms

- Forms must reflect business meaning and group related fields.
- Always show labels. Do not rely only on placeholders.
- Required fields must be marked and validation shown close to the input.
- Use slideovers/drawers for short contextual workflows and dedicated pages for complex workflows.

## States

- Empty states explain what to do next and avoid oversized illustrations.
- Loading states should prefer skeletons, table row skeletons, component-level loading, and button-level loading.
- Errors should explain what happened and what the user can do.
- Toasts are for operation results, not persistent attention.

## Responsive Design

- Desktop is primary, but tablet and mobile must remain usable.
- Mobile uses drawer navigation, single-column forms, simplified lists, and horizontal table scroll only when necessary.

## Accessibility

- Ensure keyboard navigation, visible focus states, sufficient contrast, proper labels, accessible table headers, semantic HTML, meaningful button labels, and no meaning conveyed by color alone.

## AI Rules

When implementing UI:

1. Read this file first.
2. Inspect existing components and similar screens.
3. Reuse established patterns before creating new ones.
4. Prefer Nuxt UI components.
5. Use Drixal semantic theme tokens.
6. Do not introduce new design tokens unnecessarily.
7. Keep business data structured and scannable.
8. Use tables for large structured collections.
9. Preserve business functionality and domain behavior.
10. Verify Light and Dark themes.
11. Do not redesign unrelated application areas.
12. Avoid gradients, glassmorphism, neon colors, giant hero sections, huge headings, decorative blobs, excessive rounded corners, oversized cards, excessive shadows, arbitrary spacing, cards inside cards, dashboards only made of statistics, and marketing-site patterns.

The final product should feel calm, structured, efficient, trustworthy, professional, modern, operational, and consistent. It should not feel playful, futuristic, experimental, flashy, decorative, or over-designed.
