import { describe, it, expect, vi } from 'vitest';
import { AnalyticsService } from '../server/services/analyticsService';

describe('AnalyticsService', () => {
  it('should generate a baseline report when no logs exist', async () => {
    const venueId = 'stadium_01';
    const report = await AnalyticsService.getVenueReport(venueId);
    
    expect(report).toBeDefined();
    expect(report.venueId).toBe(venueId);
    expect(report.status).toBe('Complete');
    expect(report.peakCongestion).toBeGreaterThan(0);
  });

  it('should handle analytics events without crashing', async () => {
    const event = {
      type: 'TEST_EVENT',
      venueId: 'stadium_01',
      payload: { foo: 'bar' },
      timestamp: new Date().toISOString()
    };
    
    // Should not throw even if Firestore fails (it has a fallback/catch)
    await expect(AnalyticsService.logEvent(event as any)).resolves.not.toThrow();
  });
});
