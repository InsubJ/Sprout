export type AnalyticsEvent = 'app_opened' | 'habit_created' | 'habit_watered' | 'sync_completed' | 'friend_request_sent';
export interface AnalyticsSink { track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void; captureError(error: Error, context?: string): void }
class DevelopmentAnalyticsSink implements AnalyticsSink { track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) { if (__DEV__) console.info('[analytics]', event, properties ?? {}); } captureError(error: Error, context?: string) { console.error('[sprout-error]', context ?? 'unknown', error.message); } }
export const analytics: AnalyticsSink = new DevelopmentAnalyticsSink();
