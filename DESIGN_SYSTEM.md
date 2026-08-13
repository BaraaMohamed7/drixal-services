# Drixal Service Platform Design System

Drixal is a multi-tenant service operations product. Its interface follows Atlassian Design System principles while retaining Drixal's own brand, domain language, Cairo typography, and equal Arabic/English support. It must not imitate a specific Atlassian product.

## Product Direction

- Optimize for clarity, collaboration, and progress through a service lifecycle.
- Put the next valid action and operational exceptions before decorative reporting.
- Use familiar, comfortable product geometry and predictable interaction states.
- Preserve dense, scannable queues for managers without making customer or employee experiences feel like back-office software.
- Avoid marketing-site composition inside authenticated product workflows.

## Technology

- Use Nuxt, Vue, Tailwind CSS, and Nuxt UI.
- Prefer Nuxt UI for controls, menus, forms, overlays, pagination, and feedback.
- Reuse semantic Drixal classes for page headers, panels, metrics, tables, and states.
- Do not add Atlaskit or copy Atlassian source components. Apply the system principles through the established stack.

## Foundations

### Color Roles

Use semantic roles rather than selecting arbitrary palette values.

| Role | Purpose |
| --- | --- |
| Neutral | Default text, navigation, secondary actions, and structural surfaces |
| Brand | Primary actions, links, focus, selected navigation, and selected state |
| Information | In-progress or informative states |
| Success | Favorable completed outcomes |
| Warning | Caution and states requiring attention |
| Danger | Failure, rejection, destructive actions, and serious errors |
| Discovery | Onboarding and genuinely new capabilities |

The official Drixal brand blue is `#2546F0`. Brand blue must not represent success, warning, or danger.

### Light Theme

| Token | Value |
| --- | --- |
| Background | `#F7F8F9` |
| Surface | `#FFFFFF` |
| Surface muted / sunken | `#F1F2F4` |
| Surface pressed | `#DCDFE4` |
| Border | `#DCDFE4` |
| Border strong | `#8590A2` |
| Text primary | `#172B4D` |
| Text secondary | `#44546F` |
| Text muted | `#626F86` |
| Brand | `#2546F0` |
| Brand subtle | `#EEF1FF` |

### Dark Theme

| Token | Value |
| --- | --- |
| Background | `#161A1D` |
| Surface | `#1D2125` |
| Surface raised | `#22272B` |
| Surface overlay | `#282E33` |
| Border | `#A6C5E229` |
| Border strong | `#738496` |
| Text primary | `#B6C2CF` |
| Text secondary | `#9FADBC` |
| Text muted | `#8C9BAB` |
| Brand | `#4B65F7` |
| Brand text | `#A0AFFF` |

Dark mode uses progressively lighter elevated surfaces. It does not invert light mode or use pure black.

### Typography

Cairo Variable is the product typeface for both Arabic and English. Atlassian Sans is not used because it does not satisfy Drixal's bilingual requirement.

| Role | Size / line height | Weight |
| --- | --- | --- |
| Page title | `24-28px / 32px` | Bold |
| Section heading | `16-20px / 24px` | Bold |
| Body | `14px / 20px` | Regular |
| Small body | `12px / 16px` | Regular or medium |
| Metric | `28-32px / 32px` | Bold |

- Use semantic heading levels in sequence.
- Use body medium when text aligns with icons or controls.
- Use bold sparingly for labels that need clear emphasis.
- Use tabular numerals for metrics, dates, and operational identifiers.
- Do not force uppercase or wide tracking in Arabic.

### Spacing

Use an 8px base with half steps where compact UI needs them:

`2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px`

- `2-8px`: icons, badges, compact control internals.
- `12-24px`: component padding and related content groups.
- `32-80px`: page-level layout and major separation.
- Group related controls by proximity and separate unrelated decisions with more space.

### Radius

| Token | Value | Use |
| --- | --- | --- |
| Detail | `2px` | Checkboxes, keyboard hints |
| Small | `4px` | Badges, lozenges, compact labels |
| Interactive | `6px` | Buttons, inputs, selects, navigation items |
| Container | `8px` | Cards, in-page panels, dropdowns |
| Large | `12px` | Tables, drawers, modals, large containers |
| Full | `999px` | Avatars and intentionally pill-shaped user UI |

Radius communicates scale. Do not apply large rounding indiscriminately.

### Elevation

Use four conceptual layers:

1. Sunken: grouped backdrops such as schedule columns or filter wells.
2. Default: normal page and bordered panels.
3. Raised: movable or singular focal cards only.
4. Overlay: dropdowns, drawers, dialogs, and popovers.

- Default product panels use a surface and border, not a shadow.
- Raised shadows are exceptional and limited to one focal region.
- Overlays always pair the overlay surface with the overlay shadow.
- Dark mode differentiates elevation with surface tone as well as shadow.

## Layout

- Desktop uses a top navigation bar, contextual side navigation, and main content.
- The current Personal/company/platform context must remain visible and switchable.
- Selected navigation uses a rounded subtle-brand background, not a decorative side stripe.
- Page headers are part of page flow, not isolated decorative cards.
- Main content uses 16px mobile, 24px tablet, and 32px desktop gutters.
- Use logical `start` and `end` properties so RTL and LTR share one implementation.

## Components

### Buttons

- Primary actions use Drixal blue and white text.
- Secondary actions use a neutral surface or subtle background.
- Destructive actions use danger styling and confirmation where impact is high.
- Use one primary action per decision region.
- Use icon-only buttons only when the icon is conventional and an accessible label exists.

### Navigation

- Navigation labels describe destinations, not abstract modules.
- The workspace selector identifies Personal, company name and role, or Platform Administration.
- Desktop and mobile expose the same destinations and selected context.
- Mobile navigation uses an accessible slideover with focus management and Escape behavior.

### Cards and Panels

- Cards group one meaningful unit; avoid cards inside cards.
- Use whitespace before adding another boundary.
- Default panels use an 8px radius, one subtle border, and no shadow.
- Use a muted/sunken region for related facts or controls within a panel.

### Status Lozenges

- Use compact 4px rounded labels with semantic background and text.
- Status text is always visible so color is not the only signal.
- Brand color is acceptable for selected or informational state, never successful completion.

### Forms

- Always show labels; placeholders provide examples only.
- Mark required fields and keep validation next to the field.
- Preserve known user information and prefill it where appropriate.
- Explain business consequences before submission.
- Protect against duplicate submissions and show pending state on the triggering action.
- Use dedicated pages for complex workflows and drawers for short contextual actions.

### Tables and Lists

- Keep tables for structured business datasets on desktop.
- Use a 12px rounded table container and a subtle neutral header surface.
- Make record titles the primary navigation target.
- Keep row actions contextual and place secondary actions in an overflow menu.
- On mobile, use simplified record lists when horizontal scrolling would hide primary actions.
- Reserve horizontal scrolling for genuinely tabular comparisons.

### Feedback

- Loading states use component-level skeletons where practical.
- Error messages explain impact and offer retry or recovery.
- Empty states explain why the area is empty and identify the next step.
- Confirmation is required for rejection, suspension, cancellation, unpublishing, and other high-impact mutations.
- Operation results are announced through an `aria-live` region or accessible toast.

## Workflow Rules

- UI controls must reflect server-authorized next actions.
- Do not expose actions that the selected workspace, role, company status, or record state cannot perform.
- Keep customer-safe information separate from internal company data.
- Place assignment and schedule controls near the order state they affect.
- Put active, overdue, blocked, unassigned, and unscheduled work before decorative totals.

## Accessibility and Localization

- Meet WCAG AA contrast: `4.5:1` for normal text and `3:1` for essential UI boundaries and large text.
- Preserve visible focus with a 2px offset.
- Support keyboard navigation, focus return, semantic labels, and non-color status cues.
- Verify every changed workflow in English LTR and Arabic RTL.
- Localize statuses, enums, dates, numbers, currency, duration, and validation text.

## Avoid

- Do not copy Jira, Confluence, or Trello layouts or branding.
- Do not use gradients, glassmorphism, neon color, glowing borders, or decorative AI motifs.
- Do not use oversized hero sections or excessive empty space in operational screens.
- Do not turn every region into a raised card.
- Do not fabricate reviews, ratings, performance trends, or business evidence.
- Do not let visual styling obscure tenant context, permissions, or the next valid action.
