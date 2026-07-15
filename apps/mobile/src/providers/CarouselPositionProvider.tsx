import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface CarouselPositionStore {
  read(carouselId: string): string | null;
  write(carouselId: string, itemKey: string): void;
}

interface CarouselPosition {
  initialItemKey: string | null;
  rememberItem(itemKey: string): void;
}

const CarouselPositionContext = createContext<CarouselPositionStore | null>(null);

type CarouselPositions = Record<string, string>;
const storageKey = "sprout_carousel_positions_v1";

export function parseCarouselPositions(value: unknown): CarouselPositions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([carouselId, itemKey]) =>
        Boolean(carouselId.trim()) && typeof itemKey === "string" && Boolean(itemKey.trim()),
    ),
  );
}

export function createCarouselPositionStore(
  initialPositions: CarouselPositions = {},
  onChange?: (positions: CarouselPositions) => void,
): CarouselPositionStore {
  const positions = new Map<string, string>(
    Object.entries(parseCarouselPositions(initialPositions)),
  );
  return {
    read: (carouselId) => positions.get(carouselId) ?? null,
    write: (carouselId, itemKey) => {
      if (!carouselId.trim() || !itemKey.trim())
        throw new Error("Carousel and item identifiers must not be empty");
      if (positions.get(carouselId) === itemKey) return;
      positions.set(carouselId, itemKey);
      onChange?.(Object.fromEntries(positions));
    },
  };
}

export function CarouselPositionProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CarouselPositionStore | null>(null);
  useEffect(() => {
    let active = true;
    const createPersistedStore = (positions: CarouselPositions): CarouselPositionStore =>
      createCarouselPositionStore(positions, (next) => {
        void AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined);
      });
    void AsyncStorage.getItem(storageKey)
      .then((raw) => {
        let positions: CarouselPositions = {};
        try {
          positions = parseCarouselPositions(raw ? JSON.parse(raw) : null);
        } catch {
          positions = {};
        }
        if (!active) return;
        setStore(createPersistedStore(positions));
      })
      .catch(() => {
        if (active) setStore(createPersistedStore({}));
      });
    return () => {
      active = false;
    };
  }, []);
  if (!store) return null;
  return (
    <CarouselPositionContext.Provider value={store}>{children}</CarouselPositionContext.Provider>
  );
}

export function useCarouselPosition(carouselId: string): CarouselPosition {
  const store = useContext(CarouselPositionContext);
  if (!store) throw new Error("useCarouselPosition requires CarouselPositionProvider");
  if (!carouselId.trim()) throw new Error("Carousel identifier must not be empty");
  const rememberItem = useCallback(
    (itemKey: string): void => store.write(carouselId, itemKey),
    [carouselId, store],
  );
  return { initialItemKey: store.read(carouselId), rememberItem };
}
