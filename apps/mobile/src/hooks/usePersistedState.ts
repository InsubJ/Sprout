import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export type PersistedStateParser<Value> = (value: unknown) => Value;

interface PersistedStateResult<Value> {
  value: Value;
  setValue: Dispatch<SetStateAction<Value>>;
  hydrated: boolean;
}

export function usePersistedState<Value>(
  storageKey: string | null,
  initialValue: Value,
  parse: PersistedStateParser<Value>,
): PersistedStateResult<Value> {
  const [value, setValue] = useState(initialValue);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null | undefined>();
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const dirtyBeforeHydration = useRef(false);
  const hydrated = hydratedStorageKey === storageKey;
  const hydratedRef = useRef(hydrated);
  hydratedRef.current = hydrated;
  const setPersistedValue = useCallback<Dispatch<SetStateAction<Value>>>((nextValue) => {
    if (!hydratedRef.current) dirtyBeforeHydration.current = true;
    setValue(nextValue);
  }, []);

  useEffect(() => {
    let active = true;
    dirtyBeforeHydration.current = false;
    setHydratedStorageKey(undefined);
    setValue(initialValue);
    if (!storageKey) {
      setHydratedStorageKey(null);
      return () => {
        active = false;
      };
    }
    void AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active) return;
        if (raw !== null && !dirtyBeforeHydration.current)
          setValue(parse(JSON.parse(raw) as unknown));
      })
      .catch(() => {
        if (active) setValue(initialValue);
      })
      .finally(() => {
        if (active) setHydratedStorageKey(storageKey);
      });
    return () => {
      active = false;
    };
  }, [initialValue, parse, storageKey]);

  useEffect(() => {
    if (!hydrated || !storageKey) return;
    const serialized = JSON.stringify(value);
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(storageKey, serialized))
      .catch(() => undefined);
  }, [hydrated, storageKey, value]);

  return { value: hydrated ? value : initialValue, setValue: setPersistedValue, hydrated };
}
