# Friendship Requests & Buds Management

## Overview

Gardeners connect with other users ("Buds") to view each other's forests and send encouragement nudges.

## Friendship State Machine

```text
[User Sends Request] ──> (status: "pending")
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [Friend Accepts]              [Friend Declines]
               │                             │
               ▼                             ▼
     (status: "accepted")          (status: "declined")
```

## Key Source Files

- [packages/shared/src/types/friendship.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/types/friendship.ts): `Friendship` interface and status types.
- [apps/mobile/src/features/social/useBuds.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/useBuds.ts): Manages incoming requests, outgoing requests, and accepted friend lists.
- [apps/mobile/src/features/social/useAcceptedFriends.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/useAcceptedFriends.ts): Retrieves accepted friends for social interactions.
- [apps/mobile/src/features/social/BudsScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/BudsScreen.tsx): UI screen for searching users, sending friend requests, and managing requests.
