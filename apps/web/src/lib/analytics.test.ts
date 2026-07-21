import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureAnalytics, track } from './analytics';

describe('privacy-conscious analytics', () => {
  beforeEach(() => localStorage.clear());
  it('does not emit without consent', () => {
    const spy = vi.fn();
    configureAnalytics({ track: spy });
    track('cta_click', 'assessment');
    expect(spy).not.toHaveBeenCalled();
  });
  it('emits only the safe event envelope after consent', () => {
    const spy = vi.fn();
    configureAnalytics({ track: spy });
    localStorage.setItem('analytics-consent', 'granted');
    track('service_view', 'cloud-security');
    expect(spy).toHaveBeenCalledWith({ event: 'service_view', label: 'cloud-security', path: '/' });
  });
});
