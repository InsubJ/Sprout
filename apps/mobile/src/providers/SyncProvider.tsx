import NetInfo from "@react-native-community/netinfo";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useServices } from "./ServicesProvider";
interface SyncState {
  online: boolean;
  syncing: boolean;
  pending: number;
  refreshPending(): Promise<void>;
}
const SyncContext = createContext<SyncState | null>(null);
export function SyncProvider({ children }: PropsWithChildren) {
  const { queue, sync } = useServices();
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const refreshPending = async (): Promise<void> => {
    const operations = await queue.list();
    setPending(
      operations.filter((item) => item.status === "pending" || item.status === "failed").length,
    );
  };
  useEffect(() => {
    void refreshPending();
    return NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(connected);
      if (connected && sync) {
        setSyncing(true);
        sync.flush().finally(() => {
          setSyncing(false);
          void refreshPending();
        });
      }
    });
  }, [queue, sync]);
  return (
    <SyncContext.Provider
      value={useMemo(
        () => ({ online, syncing, pending, refreshPending }),
        [online, syncing, pending],
      )}
    >
      {children}
    </SyncContext.Provider>
  );
}
export function useSync(): SyncState {
  const value = useContext(SyncContext);
  if (!value) throw new Error("useSync must be used within SyncProvider");
  return value;
}
