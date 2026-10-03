---
name: ristoview
description: A Sunday pasticceria tray for a shared dinner diary and a monthly gift.
colors:
  cocoa: "#3e1f22"
  cocoa-deep: "#2c1517"
  ribbon: "#b8235a"
  ribbon-deep: "#8f1745"
  gold: "#c9a15a"
  gold-deep: "#8a6424"
  blush: "#fdeef2"
  petal: "#fbdde6"
  paper: "#fffafb"
  line: "#f1c9d5"
  stripe: "#f4a7be"
  rose: "#ee88a6"
  cocoa-soft: "#7a4a50"
  cocoa-mute: "#9c7076"
typography:
  logotype:
    fontFamily: "Yellowtail, cursive"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  moment:
    fontFamily: "Yellowtail, cursive"
    fontSize: "clamp(44px, 12vw, 68px)"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(28px, 7vw, 38px)"
    fontWeight: 760
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 720
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  entry:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 720
    lineHeight: 1.25
  body:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.5
  stamp:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(24px, 8vw, 34px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sheet-top: "4px"
  field: "12px"
  card: "14px"
  pill: "999px"
  seal: "50%"
spacing:
  gutter: "16px"
  field-gap: "6px"
  section-gap: "14px"
  sheet-pad: "26px 18px 8px"
  page-max: "720px"
  tabbar-h: "68px"
components:
  button-primary:
    backgroundColor: "{colors.cocoa}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cocoa-deep}"
  button-primary-disabled:
    backgroundColor: "{colors.cocoa-mute}"
  button-ribbon:
    backgroundColor: "{colors.ribbon}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-ribbon-hover:
    backgroundColor: "{colors.ribbon-deep}"
  button-ribbon-disabled:
    backgroundColor: "{colors.stripe}"
    textColor: "{colors.cocoa-soft}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.petal}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.ribbon-deep}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  button-sm:
    padding: "0 14px"
    height: "38px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
    height: "48px"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "{spacing.sheet-pad}"
  chip:
    backgroundColor: "{colors.petal}"
    textColor: "{colors.ribbon-deep}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  counter-stub:
    textColor: "{colors.ribbon}"
    width: "62px"
  tab-active:
    textColor: "{colors.ribbon}"
    backgroundColor: "{colors.petal}"
---

# Design System: ristoview

## Overview

**Creative North Star: "La pasticceria della domenica"**

The app is a Sunday pastry shop seen from the customer's side of the counter. The monthly gift is a pink-and-white striped package tied with a raspberry ribbon, sitting on a paper doily; the diary is the shop's counter, where every dinner is a numbered ticket. Everything else is paper: blush ground, near-white sheets with lace edges, cocoa-brown ink. The world is committed pink, but the ink is chocolate, so the screen reads warm and legible rather than sugary.

Density is phone-first and calm: one column, 16px gutters, 48px touch targets, a bottom tab bar on phones and top tabs from 900px. Decoration lives in the world's own materials (stripe, ribbon, lace, seal, rubber stamp, paw prints, two drawn dogs) and never in generic UI chrome. States are printed marks: a gold seal for the chosen gift, an inked double-bordered SFRUTTATO stamp for redeemed, a struck line for expired.

Motion is short and settling: expo-out easings, a stamp that drops from 2.2x and lands rotated, a seal that spins in, list rows that rise 14px on entry. All of it collapses to 1ms under reduced motion.

**Key Characteristics:**
- Pink-and-white wrapping stripe (14px bands) on the header band, the gift box, and the frame of big moments only.
- Cocoa ink for text and primary actions; raspberry ribbon for the signature move, active state, and focus.
- Gold scalloped seals for chosen and top-scored states.
- Paper sheets with a lace (doily) top edge and dashed ruled sections.
- Counter-ticket list rows with a perforated N° stub.
- Paw prints, not stars, for every rating.
- Yellowtail script reserved for the logotype, the gift seal, the nickname and the big moments.

## Colors

A committed pink world inked in chocolate: blush and paper carry the surface, cocoa carries the words, raspberry and gold carry meaning.

### Primary
- **Cocoa Ink** (cocoa): all body text, headings, the logotype, and the primary action fill (`button-primary`, the center "Nuova cena" tab). Hover deepens to **Bitter Cocoa** (cocoa-deep).

### Secondary
- **Raspberry Ribbon** (ribbon): the gift ribbon and bow, focus outlines, caret and accent-color, links, filled paws, the N° stub numerals, the active tab, the nickname and chosen cuisine in copy, and the `button-ribbon` signature action (untie, confirm).
- **Deep Raspberry** (ribbon-deep): ribbon hover, the bow's inner loop, the SFRUTTATO stamp ink, destructive text, chip text, error status.

### Tertiary
- **Seal Gold** (gold): the gift seal, the listino check mark, ScoreSeal for averages of 4.5 and up.
- **Seal Gold Rim** (gold-deep): the seal's dashed rim and scallops; warning sync text.

### Neutral
- **Blush** (blush): the page ground; hover wash on list items and icon buttons.
- **Petal** (petal): selected and hover fills (chosen listino item, active tab pill, ghost hover, chip ground).
- **Icing Paper** (paper): sheets, cards, inputs, top bar, button text on cocoa.
- **Sugar Line** (line): hairlines, dashed rules, input borders, empty paws, leader dots.
- **Wrapping Stripe** (stripe): the pink band of the stripe pattern, selection highlight, perforation dots, hover paws, disabled ribbon fill.
- **Rose** (rose): scrollbar thumb and the rim of the mid-score pink seal.
- **Soft Cocoa** (cocoa-soft): secondary text, labels, hints, meta lines.
- **Muted Cocoa** (cocoa-mute): placeholders, inactive tabs, expired marks, disabled primary.

### Named Rules
**The Chocolate Ink Rule.** Text and primary actions are cocoa, never pink. Pink is the ground and the wrapping; it does not carry words.

**The Ribbon Rule.** Raspberry is the ribbon: it marks the one signature move on a screen, focus, and the active place. If two ribbon buttons compete on one screen, one of them is cocoa or ghost.

**The Gold Means Chosen Rule.** Gold appears only as a seal or a seal-like mark for a chosen or top-rated state. It is never a decorative accent or a button fill.

## Typography

**Display Font:** Yellowtail (with cursive)
**Body Font:** Bricolage Grotesque Variable (with ui-sans-serif, system-ui, sans-serif)

**Character:** A shop-sign script over a chunky, friendly grotesque. The script is the hand-lettered logotype on the pastry box; the grotesque is the printed price card, set heavy (650 to 800) with tight tracking on headings.

### Hierarchy
- **Logotype** (Yellowtail 400, 34px, 1): "ristoview" in the top bar and setup screen.
- **Moment** (Yellowtail 400, clamp(44px, 12vw, 68px), 1): the easter-egg question; the same face sets the gift seal (clamp(20px, 7vw, 30px)) and the nickname at 1.3em.
- **Headline** (760, clamp(28px, 7vw, 38px), 1.15, -0.02em): page titles, balanced wrapping.
- **Title** (720, 20px, -0.01em): section heads such as "Le ultime cene".
- **Entry** (700 to 720, 18px, 1.25): restaurant names on the counter, listino items, redeem question.
- **Body** (400, 16px, 1.5): running text and inputs; ledes at 17px, max 46 to 60ch, pretty wrapping.
- **Label** (650, 14px): field labels, legends, chips, meta lines; hints at 13px; tab labels at 12px.
- **Stamp** (800, uppercase, 0.08em): SFRUTTATO and the mini stamp (12px) only.

### Named Rules
**The Shop Sign Rule.** Yellowtail is for the logotype, the gift seal, the nickname and the easter-egg question. Every heading, label and control is Bricolage.

**The Ink Stamp Rule.** Uppercase tracked type exists only as a printed state mark (stamp or expired mark). It is never a label above a heading.

**The Sixteen Rule.** Inputs never go below 16px.

## Layout

One centered column, max 720px, 16px gutters, 20px top padding. On phones the page pads its bottom by the 68px tab bar plus 40px plus the safe area; at 900px and up the tab bar disappears, top tabs appear in a 1080px top bar, and the bottom padding drops to 64px. The listino becomes two columns at 620px. The top bar is sticky paper with a 10px stripe band under it.

Rhythm is tight inside units and generous between them: 6px label to field, 14px between fields in a ruled section, 18 to 22px section padding, 40 to 44px between page sections. Every tappable target is at least 44px (paws 44x44, counter rows 68px, buttons 48px or 38px small).

## Elevation & Depth

Depth is paper on a counter: sheets and cards sit slightly lifted on the blush ground with a cocoa-and-raspberry tinted shadow, and the gift box floats higher. Hairlines and dashed rules separate content inside a sheet; shadows never stack inside one.

### Shadow Vocabulary
- **Paper rest** (`box-shadow: 0 1px 2px rgb(62 31 34 / 0.06), 0 6px 18px -6px rgb(143 23 69 / 0.18)`): sheets, visit cards, redeem card, listino, primary and ribbon buttons.
- **Box lift** (`box-shadow: 0 2px 4px rgb(62 31 34 / 0.08), 0 18px 40px -14px rgb(143 23 69 / 0.32)`): the gift box body and the easter-egg card and its main button.
- **Band glow** (`box-shadow: 0 4px 10px -6px rgb(143 23 69 / 0.35)`): the stripe band under the top bar.
- **Tab shelf** (`box-shadow: 0 -1px 0 #f1c9d5, 0 -8px 24px -12px rgb(143 23 69 / 0.25)`): the translucent blurred bottom tab bar.

### Named Rules
**The Tinted Shadow Rule.** Shadows are soft, blurred and tinted with cocoa and raspberry; never neutral grey and never hard offsets.

## Shapes

Soft but not bubbly. Controls are pills (999px). Cards and the bottom of sheets round at 14px; sheets keep a near-square 4px top because the lace edge sits there. Inputs and selectable rows round at 12px. Seals and score marks are circles with a scalloped rim (a repeating conic dash ring or a star polygon with a dashed inner circle). Rules inside sheets are 1.5px dashed sugar line; the counter list is bracketed by 2px solid cocoa; the ticket stub is cut by a 2px dotted stripe perforation; the stamp is a 4px (mini: 3px) double border at 10px (mini: 6px) radius, rotated.

## Components

### Buttons
- **Shape:** full pill (999px), 48px tall, 22px side padding; small 38px tall, 14px padding, 14px text.
- **Primary:** cocoa fill, paper text, weight 650, paper rest shadow; hover bitter cocoa; disabled muted cocoa.
- **Ribbon:** raspberry fill, white text, paper rest shadow; hover deep raspberry; disabled stripe fill with soft cocoa text and no shadow. The one signature action per screen.
- **Ghost:** transparent with a 1.5px inset sugar-line ring; hover petal.
- **Danger:** transparent, deep raspberry text and a 1.5px currentColor ring, with a trash icon; tapping turns it into an inline question with ghost "No" and ribbon confirm.
- **Press:** every button scales to 0.97 on active with 160ms expo-out.

### Chips
- **Style:** petal ground, deep raspberry text, 14px 650, 2px 10px padding, pill. Used for cuisine on the restaurant page.

### Cards / Containers
- **Sheet:** one paper sheet, radius 4px top and 14px bottom, 26px 18px 8px padding, paper rest shadow, lace top edge. Its sections and fieldsets are ruled by 1.5px dashed sugar line with 18px 0 22px padding and 14px internal gap. Forms and settings are one sheet, not stacked cards.
- **Visit card:** paper, 14px radius, 20px 18px 16px padding, paper rest shadow, 40px round edit button top-right.
- **Lace edge:** an 18px band of paper scallops with blush pin holes above the top edge, on sheets, the listino, the redeem card and the easter-egg card.

### Inputs / Fields
- **Style:** paper ground, 1.5px sugar-line border, 12px radius, 48px min height, 11px 14px padding, 16px text; textareas 92px min, vertical resize. Label above at 14px 650 soft cocoa; hint below at 13px.
- **Focus:** border turns raspberry with a 3px raspberry glow at 18% opacity. Everything else gets a 3px raspberry outline at 2px offset.

### Navigation
- **Top bar:** sticky paper, script logotype left, sync status pill right (13px 650), 10px stripe band beneath. From 900px, pill top tabs in soft cocoa; hover blush, current petal with cocoa text.
- **Tab bar (phone):** four equal columns, translucent paper (94%) with 10px blur and tab shelf shadow. Icon over 12px 650 label in muted cocoa; current tab turns raspberry with a petal pill behind the icon. The center "Nuova cena" tab is a cocoa pill with a paper plus, turning raspberry when current.

### Counter list (signature)
Every dinner is a numbered ticket on the counter. The list is bracketed top and bottom by 2px cocoa rules, rows split by 1.5px dashed sugar line, each row at least 68px with petal hover. Left is a 62px stub with the catalogue number in raspberry 13px 750 tabular, cut off by a 2px dotted stripe perforation; then the name (18px 720) and a soft cocoa meta line; right is a 44px ScoreSeal. Wishlist rows swap the number for a bookmark and the seal for a chevron.

### Gift box (signature)
The striped box with offset-striped lid, raspberry ribbon bands (34px vertical, 30px horizontal) with a sheen, a bow, a paper doily underneath and a dog peeking from behind. Untying clips the bands away, scales the bow out and lifts the lid; tissue paper unfolds. The chosen cuisine sits on a gold star seal in script; redeeming drops the SFRUTTATO stamp.

### Score seal and paw rating
- **ScoreSeal:** a circle with a scalloped conic rim showing the average (780, 34% of its size, tabular). Gold for 4.5 and up, pink (stripe on rose) for 3.5 and up, petal for lower, blush with a dash when unrated.
- **PawRating:** five paw prints, 44px hit areas; filled raspberry, empty sugar line, stripe on hover; the chosen paw scales 1.18 and tilts -8deg; tapping again clears; a word appears beside ("Da tornarci"). Read-only uses the same paws.

### State marks
- **Stamp:** deep raspberry 800 uppercase 0.08em text in a double border, translucent paper fill, rotated -14deg (mini: -8deg), roughened by the `#stamp-ink` turbulence/displacement filter defined once in the app shell.
- **Expired:** the month is struck through (2px muted cocoa line) beside a muted uppercase mark.

### Dogs
Two drawn mascots (Norfolk terrier and brown min pin) as inline SVG with a ribbon or stripe collar and gold tag. They appear at random: peeking behind the gift, heading empty states at 112px tilted.

## Do's and Don'ts

### Do:
- **Do** use the 14px pink-and-white stripe only as wrapping: the top bar band, the gift box, and the frame of a big moment.
- **Do** set text and primary actions in cocoa (#3e1f22), and reserve raspberry (#b8235a) for the one signature action, focus, links and the active place.
- **Do** show states as printed marks: gold seal for chosen, inked SFRUTTATO stamp for redeemed, a struck line for expired.
- **Do** give every rating five paw prints with 44px targets, and let a second tap clear it.
- **Do** put forms and settings on a single lace-topped paper sheet with dashed ruled sections.
- **Do** list restaurants as counter tickets with a perforated N° stub and a ScoreSeal.
- **Do** use tinted soft shadows (paper rest, box lift) and pill-shaped buttons.
- **Do** keep inputs at 16px and touch targets at 44px or more.

### Don't:
- **Don't** use stars, hearts or numeric bars for ratings.
- **Don't** set headings, labels or buttons in Yellowtail; it is the shop sign, not a voice.
- **Don't** put a small uppercase label above a heading; uppercase tracked type is reserved for stamp marks.
- **Don't** stripe sheets, cards or list rows; content sits on plain paper.
- **Don't** use gold as a decorative accent or button fill.
- **Don't** use neutral grey or hard offset shadows.
- **Don't** add a floating action button; "Nuova cena" lives in the tab bar.
