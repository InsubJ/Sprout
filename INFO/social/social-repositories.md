# Social Repositories & Data Adapters

## Overview

Social operations are handled via `SocialRepository` in `@sprout/services`.

## Interface Methods

- `getFriends(userId)`: Returns all accepted friendships for user.
- `getPendingRequests(userId)`: Returns incoming & outgoing pending friendship requests.
- `sendFriendRequest(userId, friendId)`: Creates a new pending friendship record.
- `respondToFriendRequest(friendshipId, status)`: Updates status to `accepted` or `declined`.
- `sendNudge(senderId, recipientId, habitId)`: Inserts a water nudge record.
- `hasNudgedToday(senderId, habitId)`: Checks if a nudge was already sent today for this habit.

## Key Source Files

- [packages/services/src/repositories/socialRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/repositories/socialRepository.ts): Repository interface definition.
- [apps/mobile/src/repositories/demoSocialRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/repositories/demoSocialRepository.ts): Local demo repository implementation.
- [packages/services/src/supabase/supabaseSocialRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/supabase/supabaseSocialRepository.ts): Supabase production database adapter.
