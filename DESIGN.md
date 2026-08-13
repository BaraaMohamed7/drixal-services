---
name: Drixal Service Platform
description: A bilingual enterprise control plane for daily service operations.
colors:
  drixal-blue: "#2546F0"
  drixal-blue-hover: "#1E39CC"
  drixal-blue-subtle: "#EEF1FF"
  graphite: "#161616"
  ink-secondary: "#393939"
  ink-muted: "#525252"
  canvas: "#F4F4F4"
  layer: "#FFFFFF"
  divider: "#E0E0E0"
  divider-strong: "#8D8D8D"
  success: "#0E6027"
  warning: "#684E00"
  danger: "#A2191F"
typography:
  headline:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.5
  body:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  square: "0px"
  control: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.drixal-blue}"
    textColor: "{colors.layer}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.drixal-blue-hover}"
    textColor: "{colors.layer}"
    rounded: "{rounded.control}"
  panel:
    backgroundColor: "{colors.layer}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.square}"
    padding: "16px"
  metric-tile:
    backgroundColor: "{colors.layer}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.square}"
    padding: "20px"
---

# Design System: Drixal Service Platform

## Overview

**Creative North Star: "The Service Control Plane"**

Drixal uses an IBM Carbon-inspired operating environment rather than a decorative dashboard vocabulary. The system is flat, precise, and information-dense: a graphite global bar, quiet light canvas, white working layers, hairline boundaries, and one blue action voice. Product state and the next task remain more prominent than brand expression.

The same grammar serves protected workspaces, authentication, and the public marketplace. Cairo is the only product face so Arabic RTL and English LTR retain equal authority and comparable density. Layout changes direction through logical properties rather than maintaining a separate RTL skin.

**Key Characteristics:**
- Operational hierarchy before decorative metrics.
- Flat layers separated by tone and one-pixel rules.
- Compact, tabular data with contextual actions.
- Square geometry with restrained control rounding.
- Drixal blue reserved for action, selection, focus, and navigation.

## Colors

The palette is restrained: neutral Carbon-like layers carry the interface while Drixal blue supplies the single interactive voice. Semantic success, warning, danger, and information colors remain distinct from brand blue.

### Primary
- **Drixal Blue:** Primary actions, selected navigation, links, focus, and pipeline state.
- **Drixal Blue Hover:** Deliberate hover and pressed emphasis for primary controls.
- **Drixal Blue Subtle:** Selected rows and navigation backgrounds where solid blue would overpower content.

### Neutral
- **Graphite:** Global chrome, primary text in dark contexts, and the dark theme canvas.
- **Canvas:** The office-light application background behind working layers.
- **Layer:** Tables, panels, forms, and metric regions.
- **Divider:** Structural boundaries between related modules, rows, and navigation zones.
- **Ink Secondary / Muted:** Supporting descriptions, labels, and metadata.

**The One Blue Voice Rule.** Blue means interaction, focus, or selected state. It does not stand in for success, warning, or failure.

**The Layer Before Shadow Rule.** Separate regions with neutral tone and a divider before considering elevation.

## Typography

**Display Font:** Cairo Variable with Cairo and sans-serif fallbacks.
**Body Font:** Cairo Variable with Cairo and sans-serif fallbacks.

**Character:** Cairo provides a direct, contemporary enterprise voice in both scripts. The hierarchy relies on measured scale, weight, and tabular numerals rather than uppercase labels or ornamental tracking.

### Hierarchy
- **Headline:** Page titles use a responsive 24-32px range, semibold weight, tight but readable tracking, and balanced wrapping.
- **Title:** Panel titles use a compact 16px semibold role.
- **Body:** Product copy and table content use 14px with a 1.5 line height; descriptions stop near 70 characters.
- **Label:** Metadata and metric labels use 13px semibold text without forced uppercase.
- **Data:** Counts and table numerals use tabular figures; major counts use a 32-44px responsive range.

**The Bidirectional Parity Rule.** Arabic and English use the same family and hierarchy. RTL changes flow, alignment, and transform origin, not emphasis.

## Layout

The protected workspace has a fixed 48px global bar and a 224px navigation rail at desktop sizes. Main content is capped at 1600px with 32px desktop gutters, reducing to 24px and then 16px. Public pages use the same maximum width and compact header rhythm.

Dashboards begin with a working page header, then contiguous metric tiles sharing borders, followed by a two-column operational region. The primary queue receives roughly two-thirds of the width and the status pipeline receives the remainder. At tablet width the operational region becomes one column; metrics become two columns. On mobile, the rail becomes a drawer, metrics become one column, actions wrap, and structured tables scroll horizontally rather than dropping fields.

Spacing follows a 4px-derived rhythm. Tight controls use 4-8px gaps, component interiors use 16-20px, and major page separation uses 24-32px. Logical `start` and `end` properties are mandatory for bidirectional behavior.

## Elevation & Depth

The interface is flat by default and uses no card shadows. Depth comes from graphite chrome, canvas-to-layer contrast, and one-pixel dividers. Temporary Nuxt UI overlays may use their library elevation, but persistent product surfaces remain unshadowed.

**The Flat Working Surface Rule.** Tables, dashboards, forms, and side panels stay on the layer plane. Persistent shadows are not part of the system.

## Shapes

Persistent surfaces are square. Cards, panels, tables, alerts, and links explicitly remove inherited large radii. Nuxt UI controls retain only a small 2px radius so focus and control boundaries remain legible without becoming pill-like. Badges may remain compact chips because their silhouette communicates status rather than container styling.

Borders are structural one-pixel rules. Thick side stripes, outlined cards under shadows, and decorative framing do not belong to this system.

## Components

### Buttons
- **Shape:** Compact rectangular controls with a small control radius.
- **Primary:** Drixal blue with white text and 8px by 16px internal padding.
- **Hover / Focus:** Darker blue on hover; a two-pixel blue focus outline with a two-pixel offset.
- **Secondary / Ghost:** Neutral layer or transparent treatment with a visible boundary only when needed.

### Chips
- **Style:** Compact status labels with semantic tinted backgrounds and text. Brand-tinted chips indicate selected or informational state, not completion.
- **State:** Text always names the state so color is never the only signal.

### Cards / Containers
- **Corner Style:** Square.
- **Background:** White layer in light mode and graphite layers in dark mode.
- **Shadow Strategy:** None for persistent surfaces.
- **Border:** One-pixel neutral divider.
- **Internal Padding:** Usually 16px or 20px.

### Inputs / Fields
- **Style:** Compact Nuxt UI fields using semantic layer, text, and border tokens with the small control radius.
- **Focus:** The shared Drixal focus outline remains visible in both themes.
- **Error / Disabled:** Semantic error color and explicit copy; disabled controls retain legible muted text.

### Navigation
- **Global bar:** Graphite, 48px high, with a clear workspace and account split.
- **Rail:** White layer, 224px wide, compact 40-44px rows, Lucide icons, and a subtle blue selected background.
- **Active state:** Blue text plus a two-pixel logical-start marker. Mobile uses the same items in an off-canvas drawer.

### Operational Dashboard
- **Metric tiles:** Contiguous, border-sharing regions rather than floating cards.
- **Work queue:** A real business table receives primary visual weight.
- **Pipeline:** Horizontal status tracks use one authored scale-in motion and switch transform origin in RTL.

## Do's and Don'ts

### Do:
- **Do** lead overview screens with the real queue, review list, schedule, or exception state users act on.
- **Do** use Cairo for every visible product role and verify both Arabic RTL and English LTR.
- **Do** preserve structured data in tables, including on mobile through intentional horizontal scrolling.
- **Do** use semantic tokens for light and dark themes and keep light as the default office-use scene.
- **Do** use Lucide icons and visible keyboard focus for interactive controls.

### Don't:
- **Don't** build dashboards from floating rounded statistic cards, sparklines, progress rings, or fabricated performance data.
- **Don't** add gradients, glass effects, decorative blobs, glowing borders, or an AI-assistant panel without a real product task.
- **Don't** use brand blue for success, warning, or danger.
- **Don't** hide labels behind placeholders or expose actions that role permissions do not allow.
- **Don't** use physical left/right layout rules where logical start/end properties preserve RTL behavior.
