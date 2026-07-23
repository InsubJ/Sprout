# Supabase Edge Functions

## Overview

Backend API endpoints run on Deno/Hono serverless Edge Functions located in `backend/supabase/functions/`.

## Edge Function Endpoints

1. **`generate-custom-plant`**: Validates inbound auth, checks generation credit balance, dispatches prompt to AI LLM providers (Groq/Gemini/OpenAI), validates JSON SVG spec, and writes job status.
2. **`save-custom-plant`**: Saves a generated plant spec to the database and attaches it to a habit.
3. **`create-stripe-checkout`**: Generates a Stripe Checkout URL for purchasing AI plant generation credits.
4. **`stripe-webhook`**: Receives Stripe webhook events (`checkout.session.completed`) and awards generation credits to the user.

## Key Source Files

- [backend/supabase/functions/generate-custom-plant/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/generate-custom-plant/index.ts): Main AI generation endpoint handler.
- [backend/supabase/functions/save-custom-plant/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/save-custom-plant/index.ts): Custom plant persistence endpoint handler.
- [backend/supabase/functions/create-stripe-checkout/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/create-stripe-checkout/index.ts): Stripe checkout endpoint handler.
- [backend/supabase/functions/stripe-webhook/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/stripe-webhook/index.ts): Stripe webhook listener handler.
