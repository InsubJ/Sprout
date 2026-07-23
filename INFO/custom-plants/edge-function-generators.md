# Supabase Edge Function AI Plant Generators

## Overview

The custom plant generation backend runs on a Supabase Deno/Hono Edge Function under `backend/supabase/functions/generate-custom-plant`.

## Multi-Provider LLM Router

The generator uses a multi-provider fallback strategy:
1. **Groq Provider** (`groqProviderFactory.ts`): Fast JSON completion using Llama models.
2. **Gemini Provider** (`providers/GeminiProvider.ts`): Google Gemini AI provider.
3. **OpenAI Compatible Provider** (`providers/OpenAiCompatibleProvider.ts`): OpenAI GPT-4o-mini provider.

## Generation Output & Fallback

The LLM returns a structured JSON plant spec defining colors, multi-stop gradients, custom vector paths (`custom_path`), atmospheric particles (`spores`, `sparkles`, `fireflies`, `petals`, `runes`), and diverse pot bases (`floating_island`, `terrarium_jar`, `crystal_base`). If the LLM output fails validation against `validateGeneratedPlantSpec`, a safe procedural fallback spec is automatically produced.

## Key Backend Source Files

- [backend/supabase/functions/generate-custom-plant/index.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/generate-custom-plant/index.ts): Main Edge Function handler.
- [backend/supabase/functions/generate-custom-plant/providerRouter.ts](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/functions/generate-custom-plant/providerRouter.ts): Router dispatching generation requests to available AI API keys.
- [packages/shared/src/utils/generatedPlantValidation/validateGeneratedPlantSpec.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/generatedPlantValidation/validateGeneratedPlantSpec.ts): Shared validator for generated plant specs.
