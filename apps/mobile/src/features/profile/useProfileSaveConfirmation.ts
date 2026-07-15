import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

interface ProfileSaveConfirmationState {
  visible: boolean;
  show(): void;
  hide(): void;
}

export function useProfileSaveConfirmation(): ProfileSaveConfirmationState {
  const [visible, setVisible] = useState(false);
  const show = useCallback((): void => setVisible(true), []);
  const hide = useCallback((): void => setVisible(false), []);
  useFocusEffect(
    useCallback(
      () => () => {
        setVisible(false);
      },
      [],
    ),
  );
  return { visible, show, hide };
}
