import React, { useState } from 'react';
import { useInteractions } from '../../hooks/useInteractions';
import { InteractionService } from '../../services/interactionService';
import { ProfileService } from '../../services/profileService';
import styles from './InteractionPanel.module.css';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface InteractionPanelProps {
  logId: string;
  userId: string;
  interactionServiceOverride?: InteractionService;
  profileServiceOverride?: ProfileService;
  onAddComment?: () => void;
  onToggleReaction?: () => void;
}

const SUPPORTED_REACTIONS = ['💧', '👍', '❤️', '🌟'] as const;

export const InteractionPanel: React.FC<InteractionPanelProps> = ({
  logId,
  userId,
  interactionServiceOverride,
  profileServiceOverride,
  onAddComment,
  onToggleReaction,
}) => {
  // Preconditions (DbC)
  if (!logId) {
    throw new Error('Log ID is required');
  }
  if (typeof logId !== 'string' || !uuidRegex.test(logId)) {
    throw new Error('Log ID must be a valid UUID');
  }
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (typeof userId !== 'string' || !uuidRegex.test(userId)) {
    throw new Error('User ID must be a valid UUID');
  }

  const {
    comments,
    loading,
    error: hookError,
    reactionCounts,
    userReactions,
    toggleReaction,
    addComment,
    deleteComment,
  } = useInteractions(logId, userId, interactionServiceOverride, profileServiceOverride);

  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggleReaction = async (reactionType: string) => {
    setActionError(null);
    try {
      await toggleReaction(reactionType);
      if (onToggleReaction) {
        onToggleReaction();
      }
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to update reaction');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const trimmed = newCommentContent.trim();
    if (!trimmed) {
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(trimmed);
      setNewCommentContent('');
      if (onAddComment) {
        onAddComment();
      }
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setActionError(null);
    try {
      await deleteComment(commentId);
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const activeError = actionError || hookError;

  return (
    <div className={styles.panel} data-testid="interaction-panel">
      {/* Reactions Section */}
      <div className={styles.reactionsSection} data-testid="reactions-section">
        {SUPPORTED_REACTIONS.map(emoji => {
          const count = reactionCounts[emoji] || 0;
          const isActive = userReactions[emoji] || false;

          return (
            <button
              key={emoji}
              className={`${styles.reactionButton} ${isActive ? styles.activeReaction : ''}`}
              onClick={() => handleToggleReaction(emoji)}
              disabled={loading}
              aria-label={`Reaction ${emoji}`}
              data-testid={`reaction-btn-${emoji}`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className={styles.count} data-testid={`reaction-count-${emoji}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Error display */}
      {activeError && (
        <div className={styles.error} data-testid="interaction-error">
          {activeError}
        </div>
      )}

      {/* Comments Section */}
      <div className={styles.commentsSection} data-testid="comments-section">
        {loading && comments.length === 0 ? (
          <div className={styles.loading} data-testid="loading-indicator">
            <div className={styles.loadingSpinner} />
            <span>Loading comments...</span>
          </div>
        ) : (
          <>
            {comments.length > 0 && (
              <div className={styles.commentsList} data-testid="comments-list">
                {comments.map(comment => {
                  const initials = (comment.display_name || comment.username || 'U')
                    .substring(0, 2)
                    .toUpperCase();
                  const isAuthor = comment.user_id === userId;

                  return (
                    <div key={comment.id} className={styles.commentItem} data-testid={`comment-item-${comment.id}`}>
                      <div className={styles.avatar}>{initials}</div>
                      <div className={styles.commentContentWrapper}>
                        <div className={styles.commentHeader}>
                          <span className={styles.displayName}>
                            {comment.display_name || comment.username || 'User'}
                          </span>
                          {comment.username && (
                            <span className={styles.username}>@{comment.username}</span>
                          )}
                          <span className={styles.time}>{formatDate(comment.created_at)}</span>
                        </div>
                        <p className={styles.commentText}>{comment.content}</p>
                      </div>

                      {isAuthor && (
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label="Delete comment"
                          data-testid={`delete-comment-btn-${comment.id}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment Input Box */}
            <form onSubmit={handleCommentSubmit} className={styles.inputForm} data-testid="comment-form">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newCommentContent}
                onChange={e => setNewCommentContent(e.target.value)}
                className={styles.commentInput}
                disabled={submittingComment}
                data-testid="comment-input"
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submittingComment || !newCommentContent.trim()}
                data-testid="comment-submit-btn"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
