---
name: Drixal Service Platform
description: A bilingual multi-tenant service operations product inspired by Atlassian Design System foundations.
colors:
  brand: "#2546F0"
  brand-hover: "#1E39CC"
  brand-subtle: "#EEF1FF"
  text: "#172B4D"
  text-subtle: "#44546F"
  text-muted: "#626F86"
  background: "#F7F8F9"
  surface: "#FFFFFF"
  surface-sunken: "#F1F2F4"
  border: "#DCDFE4"
  success: "#216E4E"
  warning: "#A54800"
  danger: "#AE2A19"
typography:
  family: "Cairo Variable, Cairo, sans-serif"
  page-title: "24-28px / 32px / 700"
  section-title: "16-20px / 24px / 700"
  body: "14px / 20px / 400"
  small: "12px / 16px / 500"
radius:
  detail: "2px"
  small: "4px"
  interactive: "6px"
  container: "8px"
  large: "12px"
  full: "999px"
spacing:
  base: "8px"
  scale: "2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px"
---

# Design Contract

## North Star

**Clear teamwork through the service lifecycle.**

Drixal applies Atlassian Design System principles to service-shop operations. The experience uses semantic design tokens, comfortable interaction geometry, purposeful surface layers, clear status communication, and predictable navigation. It retains Drixal blue, Cairo, bilingual parity, and the product's role-aware workflows rather than copying an Atlassian application.

## Product Hierarchy

1. Current Personal, company, or platform context.
2. The next valid action or exception requiring attention.
3. The operational queue or customer journey.
4. Supporting metrics and secondary navigation.

## Visual Grammar

- Light neutral canvas with white default surfaces.
- Navy/slate text hierarchy rather than harsh neutral black.
- Drixal blue for primary action, links, focus, and selection.
- Semantic information, success, warning, danger, and discovery roles.
- 6px interactive controls, 8px panels, 12px tables and overlays.
- Default surfaces use borders; overlays use shadows; raised surfaces are rare.
- Rounded subtle-brand navigation selection without a side stripe.
- Compact semantic lozenges with visible text.

## Typography

Cairo Variable is required for both Arabic and English. Hierarchy follows readable app typography: 24-28px bold page titles, 16-20px bold section headings, 14px body text, 12px supporting text, and 28-32px bold metrics. Semantic headings remain in order and numerals use tabular alignment where useful.

## Spacing

The system uses an 8px base and half steps for compact controls. Use proximity to show relationships, larger spacing to separate decisions, and a consistent rhythm within lists. Avoid arbitrary values when a documented spacing token fits.

## Surfaces

- Sunken surfaces group related filters, facts, or schedule columns.
- Default bordered surfaces contain most product content.
- Raised surfaces are reserved for a single focal or movable card.
- Overlay surfaces and shadows are reserved for menus, drawers, and dialogs.
- Dark mode uses lighter surfaces as elevation increases.

## Workflow Components

- Page headers stay in the content flow and contain title, description, and a focused action group.
- Metrics are supporting bordered cards with gaps, never the only dashboard content.
- Tables remain the desktop pattern for operational datasets.
- Mobile uses record lists when table overflow would hide actions.
- Forms always show labels and explain business consequences.
- Controls show only server-valid actions for the selected context and role.
- High-impact mutations require confirmation and accessible feedback.

## Bidirectional Behavior

Arabic RTL and English LTR use the same information hierarchy. Use logical properties, reverse directional icons when needed, keep status meaning stable, and verify both directions at desktop and mobile widths.

## Constraints

- Do not copy Jira, Confluence, or Trello chrome.
- Do not use brand blue for success, warning, or danger.
- Do not add shadows to every panel or round every element into a pill.
- Do not use placeholders as labels.
- Do not prioritize decorative reporting above live work.
- Do not introduce gradients, glass effects, neon color, or fabricated business evidence.

`DESIGN_SYSTEM.md` is the detailed implementation source of truth.
