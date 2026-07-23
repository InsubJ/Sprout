# Profile Management & Privacy Controls

## Overview

Users manage their avatar, display name, and social privacy preferences in Profile settings.

## Profile Attributes & Privacy

- `display_name`: Optional friendly name shown on cards.
- `avatar_url`: Storage URL or preset avatar image.
- `hide_name` / `hide_description`: Hide habit titles/descriptions from non-friends.
- `share_name_friends` / `share_desc_friends`: Array of specific user IDs allowed access.

## Key Source Files

- [apps/mobile/src/features/profile/ProfileDetailScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/profile/ProfileDetailScreen.tsx): Profile details screen.
- [apps/mobile/src/features/profile/useProfileDetail.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/profile/useProfileDetail.ts): Hook fetching profile details.
- [apps/mobile/src/components/Avatar.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/components/Avatar.tsx): Reusable avatar image component.
