# Stripe Integration & Webhook Handling

## Overview

Stripe integration handles credit purchases for custom plant generation.

## Payment & Fulfillment Flow

```text
[User clicks Buy Credits in App]
       │
       ▼
[Edge Function: create-stripe-checkout] ──> Returns Stripe Checkout URL
       │
       ▼
[User Completes Payment on Stripe]
       │
       ▼
[Stripe Webhook Event: checkout.session.completed]
       │
       ▼
[Edge Function: stripe-webhook] ──> Inserts record in generation_credits table
```

## Key Source Files

- [backend/supabase/functions/create-stripe-checkout/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/create-stripe-checkout/index.ts): Creates payment session.
- [backend/supabase/functions/stripe-webhook/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/stripe-webhook/index.ts): Validates Stripe signature and awards credits.
