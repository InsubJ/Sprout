import React from 'react';
import { HabitLog } from '../../types/habitLog';
import styles from './HabitTimeline.module.css';

export interface HabitTimelineProps {
  logs: HabitLog[];
  habitName?: string;
  onDeleteLog?: (logId: string) => void;
}

/**
 * HabitTimeline component displays a vertical chronological timeline of check-in logs.
 */
export const HabitTimeline: React.FC<HabitTimelineProps> = ({
  logs,
  habitName,
  onDeleteLog,
}): React.ReactElement => {
  // Preconditions validation (Design by Contract)
  if (!Array.isArray(logs)) {
    throw new Error('Precondition failed: logs must be a valid array');
  }

  // Validate structure of each log entry
  logs.forEach((log, index) => {
    if (!log || typeof log !== 'object') {
      throw new Error('Precondition failed: log must be an object');
    }
    if (typeof log.id !== 'string' || !log.id.trim()) {
      throw new Error('Precondition failed: log must have a valid string id');
    }
    if (typeof log.created_at !== 'string' || !log.created_at.trim()) {
      throw new Error('Precondition failed: log must have a valid string created_at');
    }
  });

  // Sort logs chronologically (oldest to newest)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Format the date/time beautifully
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className={styles.timelineContainer} data-testid="habit-timeline">
      {habitName && (
        <h3 className={styles.timelineHeader} data-testid="timeline-header">
          Growth Timeline: {habitName}
        </h3>
      )}
      {sortedLogs.length === 0 ? (
        <div className={styles.emptyState} data-testid="timeline-empty-state">
          <span className={styles.emptyIcon} data-testid="timeline-empty-icon">🌱</span>
          <p className={styles.emptyText}>No check-in logs yet. Water your plant to start the timeline!</p>
        </div>
      ) : (
        <div className={styles.timeline} data-testid="timeline-list">
          {sortedLogs.map((log) => (
            <div key={log.id} className={styles.timelineItem} data-testid="timeline-item">
              <div className={styles.timelineMarkerContainer}>
                <div className={styles.timelineMarker} data-testid="timeline-marker">
                  <div className={styles.markerInner} />
                </div>
                <div className={styles.timelineLine} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeaderRow}>
                  <time className={styles.timelineDate} dateTime={log.created_at} data-testid="timeline-item-date">
                    {formatDate(log.created_at)}
                  </time>
                  {onDeleteLog && (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => onDeleteLog(log.id)}
                      data-testid={`delete-log-${log.id}`}
                      aria-label="Delete check-in log"
                    >
                      <svg
                        className={styles.deleteIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
                {log.note && (
                  <p className={styles.timelineNote} data-testid="timeline-item-note">
                    {log.note}
                  </p>
                )}
                {log.image_url && (
                  <div className={styles.imageContainer} data-testid="timeline-item-image-container">
                    <img
                      src={log.image_url}
                      alt="Check-in progress photo"
                      className={styles.timelineImage}
                      data-testid="timeline-item-image"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};