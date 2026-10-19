---
name: Athenaeum Nocturne
colors:
  surface: '#0c1322'
  surface-dim: '#0c1322'
  surface-bright: '#32394a'
  surface-container-lowest: '#070e1d'
  surface-container-low: '#151b2b'
  surface-container: '#191f2f'
  surface-container-high: '#232a3a'
  surface-container-highest: '#2e3545'
  on-surface: '#dce2f8'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#dce2f8'
  inverse-on-surface: '#2a3041'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#d4c78f'
  on-secondary: '#383006'
  secondary-container: '#4f471b'
  on-secondary-container: '#c2b57f'
  tertiary: '#e9cd67'
  on-tertiary: '#3b2f00'
  tertiary-container: '#ccb14f'
  on-tertiary-container: '#534400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#f1e3a9'
  secondary-fixed-dim: '#d4c78f'
  on-secondary-fixed: '#211b00'
  on-secondary-fixed-variant: '#4f471b'
  tertiary-fixed: '#fee179'
  tertiary-fixed-dim: '#e1c561'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#0c1322'
  on-background: '#dce2f8'
  surface-variant: '#2e3545'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-end, cinematic editorial atmosphere engineered for advanced English language mastery (CEFR levels B1 through C2). Rejecting the playful, cartoonish gamification common in mass-market language apps, the aesthetic evokes the prestige of heritage literary journals, private salon culture, and curated private-press volumes. 

The visual voice is intellectually commanding, luminous, and refined. It pairs deep architectural nocturnes with rich champagne-gold accents and warm ivory prose, instilling a sense of deliberate scholarship and effortless mastery. 

Key design pillars:
- **Cinematic Chiaroscuro:** Deep, velvet darkness contrasted against focused, radiant golden light sources to focus cognitive attention.
- **Editorial Poise:** Generous leading, asymmetric headline scales, delicate micro-borders, and high-fashion editorial typography that dignifies the study of literature, rhetoric, and idiomatic finesse.
- **Translucent Depth:** Dark glassmorphic substrate layers, subtle light refractions, and floating card layers that evoke stacked archival portfolios and physical editorial proofs.

## Colors

The palette is tuned specifically for sustained, immersive dark-mode study with zero eye fatigue while maintaining regal contrast.

### Palette Architecture
- **Primary (`#D4AF37` - Champagne Gold):** The signature accent. Used for critical progression signifiers, interactive focus states, primary actions, and gilded typographical highlights.
- **Secondary (`#F3E5AB` - Pale Aurum):** Soft champagne shimmer used for secondary button fills, subtle tag outlines, interactive hover/active flashes, and subtle gradients.
- **Tertiary (`#E6CA65` - Gilded Ochre):** A saturated gold mid-tone used sparingly for celebratory states, C2 level badges, pronunciation waves, and mastery metrics.
- **Neutral Canvas (`#0A1120` to `#030712` - Midnight Abyssal):** Deep, oceanic midnight blue serving as the foundational void. It grounds the UI in quiet authority rather than sterile pure blacks.
- **Content & Text (`#F8FAFC` to `#F1F5F9` - Warm Ivory):** Warm, bone-white typographic fills engineered for extreme legibility over dark glass sheets, eliminating chromatic aberration and harsh glare.

### Semantic Rules
- Never use high-intensity neon colors. System feedback (success, warning, error) must be muted and sophisticated:
  - Error: Vintage Burgundy (`#8B2635`) with rose-gold text (`#FECDD3`).
  - Success: Deep Verdigris (`#1B4332`) with laurel-gilded borders (`#A7F3D0`).
- Backgrounds utilize multi-stop radial meshes drifting from `#0A1120` to `#030712` with subtle 2% gold optical flares at screen apexes.

## Typography

The typography pairs the literary gravitas of `Playfair Display` with the pristine, geometric clarity of `Plus Jakarta Sans`. 

### Hierarchy & Treatment
- **Display & Headlines:** Rendered in `Playfair Display`. Reserved for module titles, rhetorical passages, literary excerpts, and core language concept introductions. Italicized cuts of Playfair Display should be used selectively for idiomatic nuances, foreign etymologies, or poetic cadences.
- **Body & Instructional Text:** Rendered in `Plus Jakarta Sans`. Delivers high-contrast, zero-distortion reading during rapid comprehension exercises, vocabulary breakdowns, and phonetics guides.
- **Labels & Overlines:** Rendered in uppercase `Plus Jakarta Sans` with tracked-out spacing (`0.06em` to `0.1em`). Used for CEFR badges (`C1 MASTERY`, `RHETORICAL DEVICE`), module counts, and structural metadata.

## Layout & Spacing

The layout is built around mobile-first immersion while seamlessly expanding to dual-pane editorial portfolios on tablets.

### Layout Mechanics
- **Grid Architecture:** 
  - Mobile: 4-column fluid layout with `0.75rem` gutters and `1.25rem` screen margins.
  - Tablet/Foldable: 8-column layout with `1rem` gutters and `2rem` screen margins to allow dual-pane reading and analytical sidebars.
- **Rhythm & Cadence:** Strict adherence to an 8px base rhythm. Large vertical spacing (`space-xl` / 40px) between distinct thematic sections provides generous breathing room akin to luxury print editorial margins.
- **Stacked Archival Overlaps:** Card feeds use calculated vertical overlap (-12px to -16px margin offsets) combined with progressive scale downshifts (e.g., background card at 0.95 scale) to invoke an endless deck of physical manuscripts.

## Elevation & Depth

Visual hierarchy does not rely on opaque cast shadows, but on **luminous dark glassmorphism and ambient edge-refraction**.

### Layering Strategy
1. **The Ground Void (Level 0):** Pure abyssal navy (`#030712`) overlaid with soft radial grain and a faint golden zenith vignette.
2. **Glass Baseboard (Level 1):** `rgba(10, 17, 32, 0.65)` with `16px` backdrop blur and a fine hairline rim (`1px solid rgba(212, 175, 55, 0.12)`).
3. **Elevated Manuscript Cards (Level 2):** `rgba(15, 23, 42, 0.75)` with `24px` backdrop blur, subtle inner top glow (`inset 0 1px 1px rgba(243, 229, 171, 0.15)`), and a low-frequency ambient shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.6)`.
4. **Floating Overlays & Auric Modals (Level 3):** `rgba(10, 17, 32, 0.92)` framed with high-luster champagne edge accents (`1px solid rgba(212, 175, 55, 0.35)`) and a deep atmospheric diffusion (`0 25px 50px -12px rgba(0, 0, 0, 0.85)`).

Elements interact with light dynamically: interactive cards receive an intensified rim light (`rgba(212, 175, 55, 0.4)`) upon hover, touch, or active study selection.

## Shapes

The design system maintains a balanced, architectural silhouette using `roundedness: 2` (base radius `0.5rem` / 8px; standard cards and sheets `1rem` / 16px; expansive hero containers `1.5rem` / 24px).

This geometry avoids both sterile clinical corners and overly rounded juvenile bubble-forms. It delivers crisp, tailored silhouettes reminiscent of museum placard framing and bespoke bound folios. Select micro-components (such as CEFR status pills and audio scrubber nodes) leverage dedicated full pill caps to contrast with the card geometries.

## Components

### Buttons
- **Primary ("Auric Leaf"):** Solid champagne gold fill (`#D4AF37`) with dark midnight text (`#030712`), semibold weight. Border: 1px solid `#F3E5AB`. Pressed state triggers subtle internal warmth (`#E6CA65`) and micro-compression (scale: 0.98).
- **Secondary ("Smoked Glass"):** Translucent obsidian base (`rgba(255, 255, 255, 0.04)`), warm ivory text (`#F8FAFC`), wrapped in a 1px soft gilded border (`rgba(212, 175, 55, 0.3)`).
- **Tertiary / Text Link:** Pure ivory text paired with an animated 1px gold underline that expands from the center outward upon focus.

### Chips & CEFR Badges
- Slender, refined pills (`padding: 4px 12px`).
- Background: `rgba(212, 175, 55, 0.08)`. Border: `1px solid rgba(212, 175, 55, 0.25)`.
- Typography: Label Small (`10px`), uppercase, letter spacing `0.1em`, colored in `#F3E5AB`.

### Stacked Editorial Cards
- **Structure:** Multi-layered study folios with rounded corners (`1rem`), backdrop blur (`20px`), and `1px` subtle champagne perimeter borders.
- **Atmospheric Detail:** Subtle, illuminated grain texture across the surface. An inner gradient simulates an overhead spotlight catching the top rim.
- **Overlap Behavior:** Stacked lesson cards rest beneath the active card with a 4% sequential scale reduction and 12px vertical top-peek, creating immediate tactile depth.

### Interactive Form Inputs & Cloze Tests
- **Cloze Selection Lines:** In-sentence blanks are rendered as glowing champagne horizontal lines rather than raw boxes. When active, an ambient gold blur radiates underneath the focused word slot.
- **Input Fields:** Recessed dark glass (`rgba(3, 7, 18, 0.6)`) with `1px` faint neutral border (`rgba(241, 245, 249, 0.15)`), transitioning seamlessly to `1px solid #D4AF37` with an ambient `4px` gold halo upon focus.

### Audio & Lexicon Scrubbers
- Bespoke waveform track in muted deep slate (`rgba(255, 255, 255, 0.15)`), filled dynamically with champagne gold as playback advances.
- Scrubber thumb is a precision diamond or minimal circle framed with a 1px pale aurum halo.

### Selection Lists & Multiple Choice
- Single and multi-select options live inside individual floating glass tiles.
- Unselected: Low-contrast border (`rgba(255, 255, 255, 0.08)`), dark transparent fill.
- Selected: Border jumps to `rgba(212, 175, 55, 0.8)`, background fills with `rgba(212, 175, 55, 0.12)`, and leading indicator glows with a tailored gold Roman numeral (`I`, `II`, `III`).