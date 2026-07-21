type SafeEvent =
  | 'cta_click'
  | 'assessment_start'
  | 'assessment_complete'
  | 'contact_complete'
  | 'resource_view'
  | 'service_view';

type AnalyticsPayload = { event: SafeEvent; path: string; label?: string };

export interface AnalyticsAdapter {
  track(payload: AnalyticsPayload): void;
}

const noOpAdapter: AnalyticsAdapter = { track: () => undefined };
let adapter: AnalyticsAdapter = noOpAdapter;

export function configureAnalytics(next: AnalyticsAdapter) {
  adapter = next;
}

export function track(event: SafeEvent, label?: string) {
  // Never pass form values, identifiers, messages, findings, or credentials here.
  if (localStorage.getItem('analytics-consent') === 'granted') {
    adapter.track({ event, label, path: window.location.pathname });
  }
}
