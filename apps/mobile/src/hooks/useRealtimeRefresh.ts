import { useEffect, useRef } from "react";
import { useServices } from "../providers/ServicesProvider";

interface RealtimeRefreshOptions {
  channelName: string;
  tables: readonly string[];
  enabled?: boolean;
  onChange(): void;
}

export function useRealtimeRefresh({
  channelName,
  tables,
  enabled = true,
  onChange,
}: RealtimeRefreshOptions): void {
  const { client } = useServices();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!client || !enabled || !channelName.trim() || !tables.length) return undefined;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const channel = client.channel(channelName);
    const scheduleRefresh = (): void => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => onChangeRef.current(), 120);
    };

    tables.forEach((table) => {
      if (!table.trim()) throw new Error("Realtime table names must not be empty");
      channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh);
    });
    channel.subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void client.removeChannel(channel);
    };
  }, [channelName, client, enabled, tables]);
}
