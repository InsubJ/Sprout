# AI Generation Credits & Monetization

## Overview

Generating custom plants requires AI generation credits. Credits are earned through gameplay achievements or purchased via Stripe integration.

## How Credits Are Earned & Used

1. **Disco Plant Completion**: Completing a habit associated with the Disco Plant awards +1 free AI custom plant generation credit.
2. **Stripe Checkout**: Users can purchase credit packs ($0.99 for 1 credit, $2.99 for 5 credits) through Stripe Checkout sessions.
3. **Usage**: 1 credit is consumed per successful custom plant generation job creation.

## Key Source Files

- [packages/shared/src/domain/generationCreditRules.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/generationCreditRules.ts): Business logic for earning and spending generation credits.
- [apps/mobile/src/features/customPlants/services/demoRewardState.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/customPlants/services/demoRewardState.ts): In-memory demo state tracker for credits.
- [backend/supabase/functions/create-stripe-checkout/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/create-stripe-checkout/index.ts): Edge function creating Stripe payment sessions.
- [backend/supabase/functions/stripe-webhook/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/stripe-webhook/index.ts): Stripe webhook handler adding credits to user account upon successful payment.
