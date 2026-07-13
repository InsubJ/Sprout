import { useEffect, useState } from "react";
import type { HabitLog } from "@sprout/shared";
import { useServices } from "../../../providers/ServicesProvider";

export function useReflectionDetail(id?: string): HabitLog | null | undefined {
  const { logs } = useServices();
  const [entry, setEntry] = useState<HabitLog | null | undefined>();
  useEffect(() => {
    let active = true;
    if (!logs || !id) {
      setEntry(null);
      return () => {
        active = false;
      };
    }
    setEntry(undefined);
    void logs.getById(id).then(
      (value) => {
        if (active) setEntry(value);
      },
      () => {
        if (active) setEntry(null);
      },
    );
    return () => {
      active = false;
    };
  }, [id, logs]);
  return entry;
}
