import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LogComment, LogReaction } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export const reactionChoices = ["👍", "❤️", "👏", "🌱"] as const;
export interface ReflectionInteractionsState {
  available: boolean;
  userId?: string;
  comments: LogComment[];
  reactions: LogReaction[];
  counts: Record<string, number>;
  busy: boolean;
  loading: boolean;
  error: string | null;
  toggle: (reactionType: string) => Promise<void>;
  comment: (content: string) => Promise<boolean>;
}

export function useReflectionInteractions(logId: string): ReflectionInteractionsState {
  const { user } = useAuth();
  const { interactions } = useServices();
  const [comments, setComments] = useState<LogComment[]>([]);
  const [reactions, setReactions] = useState<LogReaction[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const load = useCallback(async (): Promise<void> => {
    const request = ++requestId.current;
    if (!interactions) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const [nextComments, nextReactions] = await Promise.race([
        Promise.all([interactions.getComments(logId), interactions.getReactions(logId)]),
        new Promise<never>((_resolve, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Feedback is taking too long to load.")),
            8000,
          );
        }),
      ]);
      if (request === requestId.current) {
        setComments(nextComments);
        setReactions(nextReactions);
      }
    } catch (cause) {
      if (request === requestId.current)
        setError(cause instanceof Error ? cause.message : "Unable to load feedback");
    } finally {
      if (timeout) clearTimeout(timeout);
      if (request === requestId.current) setLoading(false);
    }
  }, [interactions, logId]);
  useEffect(() => {
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        reactionChoices.map((choice) => [
          choice,
          reactions.filter((item) => item.reaction_type === choice).length,
        ]),
      ),
    [reactions],
  );
  const toggle = useCallback(
    async (reactionType: string): Promise<void> => {
      if (!interactions || !user) return;
      setBusy(true);
      setError(null);
      try {
        await interactions.toggleReaction({
          log_id: logId,
          user_id: user.id,
          reaction_type: reactionType,
        });
        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to react");
      } finally {
        setBusy(false);
      }
    },
    [interactions, load, logId, user],
  );
  const comment = useCallback(
    async (content: string): Promise<boolean> => {
      const value = content.trim();
      if (!value || !interactions || !user) return false;
      setBusy(true);
      setError(null);
      try {
        await interactions.createComment({ log_id: logId, user_id: user.id, content: value });
        await load();
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to comment");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [interactions, load, logId, user],
  );
  return {
    available: Boolean(interactions && user),
    userId: user?.id,
    comments,
    reactions,
    counts,
    busy,
    loading,
    error,
    toggle,
    comment,
  };
}
