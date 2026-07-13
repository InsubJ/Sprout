import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, type PanResponderInstance } from "react-native";

interface SwipeUpActionReveal {
  contentTranslateY: Animated.Value;
  panHandlers: PanResponderInstance["panHandlers"];
  revealed: boolean;
  hide(): void;
}

export const swipeUpActionRevealHeight = 72;
const revealThreshold = 34;

export function shouldCaptureVerticalSwipe(dx: number, dy: number): boolean {
  if (!Number.isFinite(dx) || !Number.isFinite(dy))
    throw new Error("Swipe distances must be finite");
  return Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.25;
}

export function shouldRevealSwipeAction(wasRevealed: boolean, dy: number): boolean {
  if (!Number.isFinite(dy)) throw new Error("Swipe distance must be finite");
  return wasRevealed ? dy < revealThreshold : dy <= -revealThreshold;
}

export function useSwipeUpActionReveal(): SwipeUpActionReveal {
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const revealedRef = useRef(false);
  const gestureStartedRevealedRef = useRef(false);
  const latestGestureDyRef = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const settle = useCallback(
    (shouldReveal: boolean): void => {
      revealedRef.current = shouldReveal;
      setRevealed(shouldReveal);
      Animated.spring(contentTranslateY, {
        toValue: shouldReveal ? -swipeUpActionRevealHeight : 0,
        useNativeDriver: false,
        speed: 22,
        bounciness: 2,
      }).start();
    },
    [contentTranslateY],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          revealedRef.current && shouldCaptureVerticalSwipe(gesture.dx, gesture.dy),
        onMoveShouldSetPanResponder: (_event, gesture) =>
          shouldCaptureVerticalSwipe(gesture.dx, gesture.dy),
        onPanResponderGrant: () => {
          gestureStartedRevealedRef.current = revealedRef.current;
          latestGestureDyRef.current = 0;
        },
        onPanResponderMove: (_event, gesture) => {
          latestGestureDyRef.current = gesture.dy;
          const origin = gestureStartedRevealedRef.current ? -swipeUpActionRevealHeight : 0;
          const next = Math.max(-swipeUpActionRevealHeight, Math.min(0, origin + gesture.dy));
          contentTranslateY.setValue(next);
        },
        onPanResponderRelease: (_event, gesture) => {
          settle(shouldRevealSwipeAction(gestureStartedRevealedRef.current, gesture.dy));
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: () =>
          settle(
            shouldRevealSwipeAction(gestureStartedRevealedRef.current, latestGestureDyRef.current),
          ),
      }),
    [contentTranslateY, settle],
  );

  return {
    contentTranslateY,
    panHandlers: panResponder.panHandlers,
    revealed,
    hide: () => settle(false),
  };
}
