import { useState } from "react";

export type PersonalGardenTab = "forest" | "sanctuary" | "buds" | "lab" | "profile";

export type PersonalGardenPath = `/(tabs)/${PersonalGardenTab}`;

interface TabPressEvent {
  preventDefault(): void;
}

interface FriendGardenTabGuard {
  confirmationVisible: boolean;
  confirmExit(): void;
  dismissExit(): void;
  guardTabPress(tab: PersonalGardenTab): (event: TabPressEvent) => void;
}

export function useFriendGardenTabGuard(
  visitingFriend: boolean,
  navigate: (path: PersonalGardenPath) => void,
): FriendGardenTabGuard {
  const [pendingTab, setPendingTab] = useState<PersonalGardenTab | null>(null);

  function guardTabPress(tab: PersonalGardenTab): (event: TabPressEvent) => void {
    return (event) => {
      if (!visitingFriend) return;
      event.preventDefault();
      setPendingTab(tab);
    };
  }

  function confirmExit(): void {
    if (!pendingTab) return;
    const destination: PersonalGardenPath = `/(tabs)/${pendingTab}`;
    setPendingTab(null);
    navigate(destination);
  }

  function dismissExit(): void {
    setPendingTab(null);
  }

  return {
    confirmationVisible: pendingTab !== null,
    confirmExit,
    dismissExit,
    guardTabPress,
  };
}
