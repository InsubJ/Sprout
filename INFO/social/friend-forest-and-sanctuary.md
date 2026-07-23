# Friend Forest & Sanctuary Viewing

## Overview

Users can visit a friend's active forest or completed Sanctuary while preserving the bottom navigation bar.

## Privacy & Access Rules

- **Friend Check**: Only accepted friends can view full plant titles and descriptions unless public sharing parameters (`share_name_friends`, `share_desc_friends`) permit.
- **Tab Guard**: `useFriendGardenTabGuard` validates that the target user ID exists and has an accepted friendship with the viewer.

## Key Source Files

- [apps/mobile/src/features/social/FriendForestScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/FriendForestScreen.tsx): Screen rendering a friend's active garden habits.
- [apps/mobile/src/features/sanctuary/VisitorSanctuaryScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/VisitorSanctuaryScreen.tsx): Screen rendering a friend's completed Monument Forest plants.
- [apps/mobile/src/features/social/useFriendGarden.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/useFriendGarden.ts): Custom hook fetching a friend's profile and plant collection.
- [apps/mobile/src/features/social/useFriendGardenTabGuard.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/useFriendGardenTabGuard.ts): Security guard validating friend access.
