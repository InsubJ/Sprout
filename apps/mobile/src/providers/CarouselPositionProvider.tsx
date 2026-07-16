import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

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

export function createCarouselPositionStore(
  initialPositions: CarouselPositions = {},
  onChange?: (positions: CarouselPositions) => void,
): CarouselPositionStore {
  const positions = new Map<string, string>(Object.entries(initialPositions));
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
  const [store] = useState<CarouselPositionStore>(() => createCarouselPositionStore());
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
