import React, { useState, useEffect, useContext } from 'react';
import { Modal } from '../common/Modal';
import { LogServiceContext } from '../../services/LogServiceContext';
import { HabitLog } from '../../types/habitLog';
import styles from './ReflectionBookModal.module.css';

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
  const logService = useContext(LogServiceContext);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              {reflectionLogs.map((log) => (
                <div key={log.id} className={styles.entryCard}>
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
