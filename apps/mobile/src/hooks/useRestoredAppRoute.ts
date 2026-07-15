import { useEffect, useState } from "react";
import { readLastAppRoute } from "../services/lastAppRoute";

interface RestoredAppRouteState {
  loading: boolean;
  route: string | null;
}

export function useRestoredAppRoute(userId?: string): RestoredAppRouteState {
  const [state, setState] = useState<RestoredAppRouteState>({ loading: true, route: null });
  useEffect(() => {
    if (!userId) {
      setState({ loading: false, route: null });
      return;
    }
    let active = true;
    setState({ loading: true, route: null });
    void readLastAppRoute(userId)
      .then((route) => {
        if (active) setState({ loading: false, route });
      })
      .catch(() => {
        if (active) setState({ loading: false, route: null });
      });
    return () => {
      active = false;
    };
  }, [userId]);
  return state;
}
