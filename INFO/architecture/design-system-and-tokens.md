# Design System & Visual Tokens

## Overview

The Sprout design system is maintained in `@sprout/design-tokens`. It defines the color palettes, border radii, spacing scales, shadow specs, and visual tokens used across all screens and components.

## Color Tokens & Palettes

- **Forest / Emeralds**: Primary brand greens (`#3F7D3A`, `#4E9648`, `#8FC65C`) representing healthy growth.
- **Withered / Muted Coral & Olive**: Muted tones (`#c26555`, `#8E9277`, `#A9B991`) representing neglected or withered state.
- **Disco / Cosmic Purple & Gold**: Bright accents (`#C77DFF`, `#FF6B9D`, `#FFD93D`) for the Disco Plant and mythical tiers.
- **Plant God / Mythical Gold**: Celestial gold gradients (`#F59E0B`, `#FBBF24`, `#FEF3C7`) for custom plant generation.

## Key Files

- [packages/design-tokens/src/colors.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/design-tokens/src/colors.ts): Raw color constants and theme pairings.
- [packages/design-tokens/src/spacing.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/design-tokens/src/spacing.ts): Spacing grid values (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`).
- [packages/design-tokens/src/radii.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/design-tokens/src/radii.ts): Border radius constants.
- [apps/mobile/src/components/ScreenState.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/components/ScreenState.tsx): Reusable empty/message state view (default `loading = false`).
- [apps/mobile/src/components/LoadingState.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/components/LoadingState.tsx): Loading indicator component.
- [apps/mobile/src/components/ErrorState.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/components/ErrorState.tsx): Error retry component.
