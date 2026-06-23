---
name: QuickBite Design System
colors:
  surface: '#fff8f5'
  surface-dim: '#ead6c9'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e9'
  surface-container: '#ffeadd'
  surface-container-high: '#f9e4d7'
  surface-container-highest: '#f3dfd1'
  on-surface: '#241912'
  on-surface-variant: '#564334'
  inverse-surface: '#3a2e25'
  inverse-on-surface: '#ffede3'
  outline: '#897362'
  outline-variant: '#ddc1ae'
  surface-tint: '#904d00'
  primary: '#904d00'
  on-primary: '#ffffff'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#ffb77d'
  secondary: '#b7102a'
  on-secondary: '#ffffff'
  secondary-container: '#db313f'
  on-secondary-container: '#fffbff'
  tertiary: '#00658f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b5fc'
  on-tertiary-container: '#004360'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001c'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#85cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#fff8f5'
  on-background: '#241912'
  surface-variant: '#f3dfd1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered to evoke immediate hunger, energy, and reliability. It targets a diverse audience of urban professionals and families who value speed without compromising on the "soul" of their food. 

The aesthetic follows a **Modern Corporate** approach with **Tactile** influences—utilizing high-quality food photography set against expansive white space. The interface feels friendly and approachable, using soft elevations and rounded geometry to create a trustworthy environment for financial transactions and food handling. 

Key Brand Attributes:
- **Energetic:** High-vibrancy accents that drive action.
- **Appetizing:** Color palettes and imagery focus on warmth and freshness.
- **Reliable:** Precise alignment and clear hierarchy to reduce cognitive load during the ordering process.

## Colors
The palette is rooted in color psychology proven to stimulate appetite. 

- **Primary (Warm Orange):** Used for primary actions, progress indicators, and "Order Now" highlights. It represents warmth and speed.
- **Secondary (Deep Red):** Used for sale badges, heart icons (favorites), and critical alerts. It adds a layer of intensity and passion for food.
- **Neutrals:** The background uses an Off-white (#FAFAFA) to reduce screen glare, while individual cards and containers use Pure White (#FFFFFF) to pop against the base layer.
- **Success/Error:** Use standard green for "Order Confirmed" and the Deep Red for errors or cancellations.

## Typography
The system utilizes **Plus Jakarta Sans** (as a high-quality alternative to Poppins with better international support) to maintain a modern, geometric, and friendly tone. 

**Bi-directional Support (LTR/RTL):**
- For English locales, use **Plus Jakarta Sans** for its open apertures and readability.
- For Arabic locales, substitute with **Cairo** to ensure the design remains professional and culturally resonant while maintaining the same weight ratios.
- Line heights are slightly increased for Arabic text to accommodate descending characters.
- Text alignment should flip logically (Left for LTR, Right for RTL).

## Layout & Spacing
This design system employs a **12-column fluid grid** for desktop and a **4-column fluid grid** for mobile devices. 

- **Spacing Rhythm:** Based on a 4px baseline grid to ensure mathematical harmony.
- **Gutter & Margins:** Gutters are fixed at 16px to keep content tight and organized. Outer margins scale from 16px on mobile to a maximum container width of 1200px on desktop.
- **RTL Logic:** Layouts must mirror horizontally. Sidebars that appear on the left in LTR must appear on the right in RTL. Icons with directional meaning (arrows, bikes) must be flipped, while icons representing physical objects (clock, search) remain static.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Shadows** to simulate a clean, physical tabletop.

- **Level 0 (Background):** #FAFAFA. Used for the main canvas.
- **Level 1 (Cards):** #FFFFFF with `shadow-sm`. Used for restaurant listings, menu items, and profile sections.
- **Level 2 (Dropdowns/Modals):** #FFFFFF with `shadow-md`. Used for elements that temporarily float above the UI.
- **Shadow Style:** Shadows are highly diffused with a slight Warm Orange tint (e.g., `rgba(255, 140, 0, 0.05)`) to maintain the brand's warmth and prevent the UI from looking "muddy" or "grey."

## Shapes
The shape language is defined by **rounded-xl** (1.5rem / 24px) for major containers and **rounded-lg** (1rem / 16px) for standard components.

- **Cards & Modals:** Use the `rounded-xl` token to feel soft and inviting.
- **Buttons & Inputs:** Use the `rounded-lg` token.
- **Images:** Food photography should always have a minimum of 12px corner radius to avoid looking sharp or aggressive.
- **Chips/Badges:** Use pill-shaped (full rounding) to differentiate from clickable buttons.

## Components

- **Buttons:** 
  - *Primary:* Warm Orange background, white text, bold weight. 
  - *Secondary:* White background, Deep Red border and text. 
  - *States:* Hover states should darken the background by 10%.
- **Cards:** 
  - Featured restaurant cards use a vertical stack with a full-bleed image at the top. 
  - Delivery info (time/rating) should be presented as small badges within the card.
- **Input Fields:** 
  - Use a subtle #EEEEEE border that turns Warm Orange on focus. 
  - Labels should be placed above the input, never as placeholders only.
- **Chips:** 
  - Used for cuisine categories (e.g., "Pizza", "Vegan"). 
  - On selection, the chip fills with Warm Orange and the text turns white.
- **Quantity Selector:** 
  - A specialized component for cart management with a minus/plus circular button flanking the quantity digit, ensuring easy thumb-reach on mobile.
- **Lists:**
  - Standard menu items use a horizontal layout with a small square thumbnail (rounded-lg) on the leading edge (left for LTR, right for RTL).