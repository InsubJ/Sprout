import React, { useState, useEffect, useContext } from 'react';
import { Modal } from '../common/Modal';
import { LogServiceContext } from '../../services/LogServiceContext';
import { useAuth } from '../common/AppProviders';
import { HabitLog } from '../../types/habitLog';
import styles from './ReflectionBookModal.module.css';

interface FeedbackComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface FeedbackData {
  reactions: Record<string, number>;
  userReactions?: Record<string, string[]>;
  comments: FeedbackComment[];
}

interface ReflectionBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId: string;
  plantName: string;
  plantType: string;
  description: string | null;
  poeticSummary: string | null;
}

export const ReflectionBookModal: React.FC<ReflectionBookModalProps> = ({
  isOpen,
  onClose,
  habitId,
  plantName,
  plantType,
  description,
  poeticSummary,
}) => {
  const { currentUser } = useAuth();
  const logService = useContext(LogServiceContext);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback states indexed by logId
  const [feedback, setFeedback] = useState<Record<string, FeedbackData>>({});

  useEffect(() => {
    if (isOpen && logService && habitId) {
      setLoading(true);
      setError(null);
      logService
        .getLogsByHabitId(habitId)
        .then((fetchedLogs) => {
          // Sort chronologically (newest first)
          const sorted = [...fetchedLogs].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setLogs(sorted);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load reflections.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, habitId, logService]);

  // Load feedback from localStorage when logs list updates
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      const loadedFeedback: Record<string, FeedbackData> = {};
      logs.forEach((log) => {
        try {
          const stored = localStorage.getItem(`sprout_feedback_${log.id}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            loadedFeedback[log.id] = {
              reactions: parsed.reactions || { '👍': 0, '❤️': 0, '👏': 0, '🌱': 0 },
              userReactions: parsed.userReactions || { '👍': [], '❤️': [], '👏': [], '🌱': [] },
              comments: parsed.comments || [],
            };
          } else {
            loadedFeedback[log.id] = {
              reactions: { '👍': 0, '❤️': 0, '👏': 0, '🌱': 0 },
              userReactions: { '👍': [], '❤️': [], '👏': [], '🌱': [] },
              comments: [],
            };
          }
        } catch (e) {
          console.error('Error loading feedback from storage:', e);
        }
      });
      setFeedback(loadedFeedback);
    }
  }, [isOpen, logs]);

  const handleReact = (logId: string, emoji: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    const logFeedback = feedback[logId] || {
      reactions: { '👍': 0, '❤️': 0, '👏': 0, '🌱': 0 },
      userReactions: { '👍': [], '❤️': [], '👏': [], '🌱': [] },
      comments: [],
    };

    const userReactions = logFeedback.userReactions || { '👍': [], '❤️': [], '👏': [], '🌱': [] };
    const emojiUserIds = userReactions[emoji] || [];
    
    let updatedUserIds: string[];
    let change = 0;

    if (emojiUserIds.includes(userId)) {
      // User already reacted -> remove reaction
      updatedUserIds = emojiUserIds.filter((id: string) => id !== userId);
      change = -1;
    } else {
      // User has not reacted -> add reaction
      updatedUserIds = [...emojiUserIds, userId];
      change = 1;
    }

    const updatedReactions = {
      ...logFeedback.reactions,
      [emoji]: Math.max(0, (logFeedback.reactions[emoji] || 0) + change),
    };

    const updatedFeedback: FeedbackData = {
      ...logFeedback,
      reactions: updatedReactions,
      userReactions: {
        ...userReactions,
        [emoji]: updatedUserIds,
      },
    };

    setFeedback((prev) => ({
      ...prev,
      [logId]: updatedFeedback,
    }));

    try {
      localStorage.setItem(`sprout_feedback_${logId}`, JSON.stringify(updatedFeedback));
    } catch (e) {
      console.error('Error saving reaction:', e);
    }
  };

  const handleAddComment = (logId: string, text: string) => {
    if (!text.trim()) return;

    const logFeedback = feedback[logId] || {
      reactions: { '👍': 0, '❤️': 0, '👏': 0, '🌱': 0 },
      comments: [],
    };

    const authorName = currentUser?.display_name || currentUser?.username || 'Anonymous';
    const newComment: FeedbackComment = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(),
      author: authorName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedFeedback = {
      ...logFeedback,
      comments: [...logFeedback.comments, newComment],
    };

    setFeedback((prev) => ({
      ...prev,
      [logId]: updatedFeedback,
    }));

    try {
      localStorage.setItem(`sprout_feedback_${logId}`, JSON.stringify(updatedFeedback));
    } catch (e) {
      console.error('Error saving comment:', e);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Filter logs that have either a note or a photo
  const reflectionLogs = logs.filter((log) => log.note || log.image_url);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${plantName} Reflection Book`}>
      <div className={styles.bookContainer}>
        {/* Plant Metadata */}
        <section className={styles.metaSection}>
          <div className={styles.plantBadge}>
            <span className={styles.plantBadgeIcon}>🌿</span>
            <span className={styles.plantBadgeText}>{plantType}</span>
          </div>
          {description && (
            <div className={styles.descriptionBox}>
              <strong>Habit Description:</strong>
              <p className={styles.descriptionText}>{description}</p>
            </div>
          )}
        </section>

        {/* Poetic Summary for Completed Plants */}
        {poeticSummary && (
          <section className={styles.poetrySection}>
            <div className={styles.poetryHeader}>
              <span className={styles.poetryIcon}>✨</span>
              <strong>Poetic Growth Summary</strong>
            </div>
            <p className={styles.poetryContent}>&ldquo;{poeticSummary}&rdquo;</p>
          </section>
        )}

        <hr className={styles.divider} />

        {/* Journal Entries */}
        <section className={styles.journalSection}>
          <h4 className={styles.journalTitle}>📜 Growth Journal</h4>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Flipping pages...</span>
            </div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : reflectionLogs.length === 0 ? (
            <div className={styles.emptyJournal}>
              <span className={styles.emptyIcon}>📖</span>
              <p className={styles.emptyText}>This reflection book is empty.</p>
              <p className={styles.emptySubtext}>
                Next time you water this plant, add a note or snap a photo to record a journal entry!
              </p>
            </div>
          ) : (
            <div className={styles.entriesList}>
              {reflectionLogs.map((log) => {
                const logFeedback = feedback[log.id] || {
                  reactions: { '👍': 0, '❤️': 0, '👏': 0, '🌱': 0 },
                  comments: [],
                };
                return (
                  <div key={log.id} className={styles.entryCard} data-testid="journal-entry">
                    <div className={styles.entryHeader}>
                      <span className={styles.entryDate}>{formatDate(log.created_at)}</span>
                      <span className={styles.waterDrop}>💧 Watered</span>
                    </div>
                    
                    {log.note && (
                      <p className={styles.entryNote}>&ldquo;{log.note}&rdquo;</p>
                    )}
                    
                    {log.image_url && (
                      <div className={styles.entryImageWrapper}>
                        <img
                          src={log.image_url}
                          alt={`Reflection photo on ${new Date(log.created_at).toLocaleDateString()}`}
                          className={styles.entryImage}
                        />
                      </div>
                    )}

                    {/* Reactions Row */}
                    <div className={styles.reactionRow} data-testid="reactions-row">
                      {['👍', '❤️', '👏', '🌱'].map((emoji) => {
                        const count = logFeedback.reactions[emoji] || 0;
                        const hasReacted = currentUser && (logFeedback.userReactions?.[emoji] || []).includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(log.id, emoji)}
                            className={`${styles.reactionBtn} ${hasReacted ? styles.activeReactionBtn : ''}`}
                            data-testid={`react-btn-${emoji}`}
                          >
                            <span className={styles.emoji}>{emoji}</span>
                            {count > 0 && <span className={styles.reactionCount}>{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Comments Section */}
                    <div className={styles.commentsSection} data-testid="comments-section">
                      <h5 className={styles.commentsHeading}>Comments</h5>
                      <div className={styles.commentsList}>
                        {logFeedback.comments.length === 0 ? (
                          <p className={styles.noComments}>No comments yet. Leave a kind word!</p>
                        ) : (
                          logFeedback.comments.map((c) => (
                            <div key={c.id} className={styles.commentItem} data-testid="comment-item">
                              <div className={styles.commentMeta}>
                                <span className={styles.commentAuthor}>{c.author}</span>
                                <span className={styles.commentTime}>
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className={styles.commentText}>{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Add Comment Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const input = form.elements.namedItem('commentInput') as HTMLInputElement;
                          handleAddComment(log.id, input.value);
                          input.value = '';
                        }}
                        className={styles.commentForm}
                        data-testid="comment-form"
                      >
                        <input
                          name="commentInput"
                          type="text"
                          placeholder="Add an encouraging comment..."
                          className={styles.commentInput}
                          required
                        />
                        <button type="submit" className={styles.commentSubmitBtn}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
