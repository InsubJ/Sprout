import { useState, useEffect, useCallback, useContext } from 'react';
import { LogComment, LogReaction } from '../types/interaction';
import { Profile } from '../types/profile';
import { InteractionService } from '../services/interactionService';
import { InteractionServiceContext } from '../services/InteractionServiceContext';
import { ProfileService } from '../services/profileService';
import { ProfileServiceContext } from '../services/ProfileServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface CommentWithProfile extends LogComment {
  username?: string;
  display_name?: string | null;
}

export interface UseInteractionsResult {
  comments: CommentWithProfile[];
  reactions: LogReaction[];
  loading: boolean;
  error: string | null;
  reactionCounts: Record<string, number>;
  userReactions: Record<string, boolean>;
  fetchInteractions: () => Promise<void>;
  toggleReaction: (reactionType: string) => Promise<void>;
  addComment: (content: string) => Promise<LogComment>;
  deleteComment: (commentId: string) => Promise<void>;
}

export function useInteractions(
  logId: string,
  userId: string,
  customInteractionService?: InteractionService,
  customProfileService?: ProfileService
): UseInteractionsResult {
  const contextInteractionService = useContext(InteractionServiceContext);
  const contextProfileService = useContext(ProfileServiceContext);

  const interactionService = customInteractionService || contextInteractionService;
  const profileService = customProfileService || contextProfileService;

  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [reactions, setReactions] = useState<LogReaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derive reaction counts and current user's reaction states
  const reactionCounts: Record<string, number> = {
    '💧': 0,
    '👍': 0,
    '❤️': 0,
    '🌟': 0,
  };
  const userReactions: Record<string, boolean> = {
    '💧': false,
    '👍': false,
    '❤️': false,
    '🌟': false,
  };

  reactions.forEach(r => {
    if (r.reaction_type) {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
      if (r.user_id === userId) {
        userReactions[r.reaction_type] = true;
      }
    }
  });

  const fetchInteractions = useCallback(async () => {
    if (!interactionService) {
      setError('InteractionService is not available');
      return;
    }
    if (!logId) {
      setError('Log ID is required');
      return;
    }
    if (!isValidUuid(logId)) {
      setError('Log ID must be a valid UUID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch reactions
      const fetchedReactions = await interactionService.getReactionsByLogId(logId);
      setReactions(fetchedReactions);

      // 2. Fetch comments
      const fetchedComments = await interactionService.getCommentsByLogId(logId);
      
      // 3. Resolve profiles for comments if profileService is available
      if (profileService && fetchedComments.length > 0) {
        const commentUserIds = Array.from(new Set(fetchedComments.map(c => c.user_id)));
        const profiles = await profileService.getProfilesByIds(commentUserIds);
        
        const enrichedComments: CommentWithProfile[] = fetchedComments.map(c => {
          const profile = profiles.find(p => p.id === c.user_id);
          return {
            ...c,
            username: profile?.username,
            display_name: profile?.display_name,
          };
        });
        setComments(enrichedComments);
      } else {
        setComments(fetchedComments);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [logId, interactionService, profileService]);

  const toggleReaction = useCallback(async (reactionType: string): Promise<void> => {
    if (!interactionService) {
      throw new Error('InteractionService is not available');
    }
    if (!logId || !isValidUuid(logId)) {
      throw new Error('Log ID must be a valid UUID');
    }
    if (!userId || !isValidUuid(userId)) {
      throw new Error('User ID must be a valid UUID');
    }
    if (!reactionType || reactionType.trim() === '') {
      throw new Error('Reaction type must be a non-blank string');
    }

    setError(null);
    try {
      const result = await interactionService.toggleReaction({
        log_id: logId,
        user_id: userId,
        reaction_type: reactionType,
      });

      if (result === null) {
        // Reaction was removed
        setReactions(prev => prev.filter(r => !(r.log_id === logId && r.user_id === userId && r.reaction_type === reactionType)));
      } else {
        // Reaction was added
        setReactions(prev => [...prev, result]);
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    }
  }, [logId, userId, interactionService]);

  const addComment = useCallback(async (content: string): Promise<LogComment> => {
    if (!interactionService) {
      throw new Error('InteractionService is not available');
    }
    if (!logId || !isValidUuid(logId)) {
      throw new Error('Log ID must be a valid UUID');
    }
    if (!userId || !isValidUuid(userId)) {
      throw new Error('User ID must be a valid UUID');
    }
    if (!content || content.trim() === '') {
      throw new Error('Comment content cannot be blank');
    }

    setError(null);
    try {
      const created = await interactionService.addComment({
        log_id: logId,
        user_id: userId,
        content: content.trim(),
      });

      let commentWithProfile: CommentWithProfile = { ...created };

      // Resolve current user profile info for the UI immediately if available
      if (profileService) {
        try {
          const profiles = await profileService.getProfilesByIds([userId]);
          if (profiles.length > 0) {
            commentWithProfile.username = profiles[0].username;
            commentWithProfile.display_name = profiles[0].display_name;
          }
        } catch (e) {
          // Non-blocking profile resolution failure
        }
      }

      setComments(prev => [...prev, commentWithProfile]);
      return created;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    }
  }, [logId, userId, interactionService, profileService]);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    if (!interactionService) {
      throw new Error('InteractionService is not available');
    }
    if (!commentId || !isValidUuid(commentId)) {
      throw new Error('Comment ID must be a valid UUID');
    }

    setError(null);
    try {
      await interactionService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    }
  }, [interactionService]);

  useEffect(() => {
    if (logId && isValidUuid(logId) && userId && isValidUuid(userId)) {
      fetchInteractions();
    } else {
      setComments([]);
      setReactions([]);
      if (logId && !isValidUuid(logId)) {
        setError('Log ID must be a valid UUID');
      } else if (userId && !isValidUuid(userId)) {
        setError('User ID must be a valid UUID');
      } else {
        setError(null);
      }
    }
  }, [logId, userId, fetchInteractions]);

  return {
    comments,
    reactions,
    loading,
    error,
    reactionCounts,
    userReactions,
    fetchInteractions,
    toggleReaction,
    addComment,
    deleteComment,
  };
}
