---
name: Holdfast Labs
description: Local open-source tools in the Root Sculpture visual world.
colors:
  charcoal: "#111111"
  surface: "#1c1c1c"
  raised: "#232323"
  foreground: "#f2f2f2"
  muted: "#b2b2ad"
  bronze: "#b59c86"
  action-bronze: "#ad9071"
  hero-ivory: "#f7f0e7"
  hero-muted: "#b2a69c"
  paper: "#f5f5f2"
  paper-surface: "#eaeae4"
  paper-foreground: "#1b211e"
  paper-muted: "#555c55"
  paper-bronze: "#795b44"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(54px, 5.208vw, 96px)"
    fontWeight: 450
    lineHeight: 0.98
    letterSpacing: "-.035em"
  product-display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(80px, 10vw, 152px)"
    fontWeight: 450
    lineHeight: 0.9
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(36px, 4vw, 62px)"
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: "-.035em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "18px"
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
  code:
    fontFamily: "Spline Sans Mono, monospace"
    fontSize: "15px"
    lineHeight: 1.7
rounded:
  action: "2px"
  recording: "8px"
spacing:
  edge-desktop: "54px"
  edge-tablet: "32px"
  edge-mobile: "20px"
  section: "100px"
  section-mobile: "65px"
components:
  action:
    backgroundColor: "{colors.action-bronze}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.action}"
    padding: "14px 25px"
  action-light:
    backgroundColor: "{colors.paper-bronze}"
    textColor: "#ffffff"
    rounded: "{rounded.action}"
    padding: "14px 25px"
  recording:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.recording}"
  code:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    padding: "28px"
---

# Design System: Holdfast Labs

## Overview

**Creative North Star: "Root Sculpture"**

Charcoal, ivory and muted bronze frame a living organic specimen. Plain grotesk typography, a fine branching mark and sparse controls keep the studio recognizable; actual product recordings carry the evidence on product pages.

This records the current local implementation of user-approved composition A, selected from three comps. The cascade is `assets/styles.css`, then `assets/studio.css`, then `assets/sculpture.css`; later overrides determine the values below. No Impeccable concept roll was run and no random seed is assigned. This document records code, not a publication or finish verdict: the formal pipeline remains at plates pending its separate component receipt; browser tests and independent preview review are separate evidence.

**Key Characteristics:**
- Full-bleed organic artwork with restrained surface motion.
- Appearance follows the system color scheme; no manual theme override.
- Rectangular bronze actions and open product layouts.
- Real recordings, readable code and qualified benchmark evidence.

## Colors

### Primary

Bronze identifies actions and interaction; the sculpture action uses action-bronze while shared hover, focus and code accents use bronze. Hero ivory and hero-muted belong to the artwork composition.

### Neutral

Charcoal supports foreground and muted text; surface and raised distinguish product wells and overlays. Light appearance replaces these with paper, paper-surface, paper-foreground and paper-muted, and uses paper-bronze for actions. Navigation and footer have explicit light colors. Appearance is stored locally; dark is the default regardless of OS preference.

**The Readable Overlay Rule.** Keep copy and controls readable against both the static artwork and its animated rendering in each appearance.

## Typography

Archivo is the self-hosted variable display and body family (`assets/fonts/archivo-var.woff2`, weights 100–900). Spline Sans Mono is self-hosted for commands and JSON (`spline-sans-mono-var.woff2`, weights 300–700). The base stylesheet contains the full system fallbacks and font licenses are in `assets/fonts`.

The display is light, tightly tracked and deliberately split into two lines on the homepage. Product names use the larger product-display role. Product body copy stays around 45ch; supporting product summaries use 22px/1.4 and homepage support uses 22px/1.4. Navigation and captions use the label role; code is distinct without becoming decorative.

## Layout

The shell has a 1600px maximum width. Sculpture overrides set desktop edges to edge-desktop, then edge-tablet at 1000px and edge-mobile below 640px. The desktop header is 108px high. At 1536×1024 the approved comp places the brand at the upper left, three navigation items at the upper right, headline near x54/y310, and action near y576; the implementation positions copy with `clamp(100px, calc(29.5svh - 108px), 260px)` after the header.

The homepage fills at least one small viewport height; the art spans behind header, content and footer. At mobile widths the header is 80px, copy has 48px top and 280px bottom padding, and the image starts at 39% height with a 66% crop and a neutral opacity fade. Mobile headline is `clamp(32px, 10.25vw, 48px)` at 1.06 line height. Secondary header links disappear below 900px; Products stays available.

Product introductions use two columns, recordings span the shell, agent sections use a .85fr/1.15fr split, and workflow steps use three columns. Below 640px these become single columns; section spacing changes from section to section-mobile. Preserve horizontal code scrolling and nonshrinking benchmark value labels.

## Elevation & Depth

The artwork supplies depth through branching fibers, shadow and glints. Product sections are flat tonal regions with no card shadows. The Products overlay alone uses `0 16px 48px #0005` as a floating menu shadow. The source shader adds a subtle green shadow grade; this is an image treatment, not another UI accent.

## Shapes

Actions use the action radius; recordings use the recording radius. Code and install wells are square. The mark is a simple unfilled branching SVG with rounded line ends (1.2 stroke), not a filled badge. The homepage footer has no manual appearance or motion controls.

## Components

- **Actions:** bronze filled, 53px minimum height, 16px text; mobile uses 48px and 12px/22px padding. Hover lifts 2px, active scales to .98. Focus uses a 2px accent outline offset 5px. Text links underline on hover.
- **Products navigation:** native `details`/`summary`, a turning chevron and a square tonal panel. It works as a disclosure without JavaScript; enhancement closes on outside click, Escape or focus leaving. The homepage action opens it and focuses the summary when JavaScript runs.
- **Recordings:** native video controls, real source clips, posters and download fallback links. Tabs use selected underlines and semantic tab/tabpanel markup. seekfs shows its desktop and CLI; vanth shows OpenCode, Codex, launch-to-wake and the actual vanth-monitor.
- **Code and evidence:** use Spline Sans Mono for commands and structured output. Label the seekfs JSON as an example with selected fields. Benchmark bars retain values and the method link; `assets/seekfs-vs-everything.json` describes 20,000 files, 90 complete CLI calls per query/tool, on one Windows PC, not a general product ranking.
- **Artwork:** `root-art.webp` with PNG fallback fills the homepage. WebGL samples that same image with low amplitude displacement, pointer response and bronze glints; product focus/hover strengthens the glints. It caps pixel ratio at 1.5, paints around 30fps and pauses when hidden. No WebGL or context loss exposes the static image. Light mode uses a paper shader or inverted grayscale fallback.
- **Motion and appearance:** footer buttons have accessible action labels. The motion button reflects playback with `aria-pressed`; OS reduced motion initializes it paused and disables displacement, pointer response and glints. Explicit play can opt back in. Reduced motion also suppresses CSS transitions and smooth scrolling. Without JavaScript the artwork and native Products disclosure remain available.

## Do's and Don'ts

### Do:
- **Do** preserve the fine outlined mark and the restrained bronze action treatment.
- **Do** retain static artwork, native disclosure, video controls and reduced-motion behavior.
- **Do** keep recordings and benchmark qualifications attached to their evidence.

### Don't:
- **Don't** replace actual product proof with invented results or decorative mock interfaces.
- **Don't** inherit the legacy rounded glass cards or hidden eyebrows as the new studio style.
- **Don't** treat this documentation as a completed review gate or publication approval.

Not canonized: retained legacy route styles are compatibility code, not new-world primitives; pending review findings must not be normalized into tokens.

## Approved publication adjustments

The product dropdown contains only seekfs and vanth. Standalone install, documentation and benchmark pages were removed; direct release, project reference and benchmark JSON links remain on product pages. Appearance follows prefers-color-scheme on first paint and subsequent system changes, ignoring previous localStorage overrides. No manual appearance or motion control is shown. Animation follows the system reduced-motion preference, including changes during the visit.
