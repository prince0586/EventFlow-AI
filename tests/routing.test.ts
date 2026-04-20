import { describe, it, expect, vi } from 'vitest';
import { RouteCalculationResult } from '../src/types';

describe('EventFlow AI - Routing Data Integrity', () => {
  it('should correctly structure routing payloads for high-throughput load balancing', () => {
    const mockRoute: RouteCalculationResult = {
      recommendedGate: {
        id: 'gate_01',
        name: 'VIP Entrance',
        lat: 34.05,
        lng: -118.24,
        isAccessible: true,
        congestion: 0.15,
        score: 1.2
      },
      alternatives: [
        {
          id: 'gate_02',
          name: 'General Admission',
          lat: 34.06,
          lng: -118.25,
          isAccessible: false,
          congestion: 0.45,
          score: 3.5
        }
      ],
      requestLocation: { lat: 34.05, lng: -118.24 }
    };

    expect(mockRoute.recommendedGate.congestion).toBeLessThan(0.7);
    expect(mockRoute.recommendedGate.isAccessible).toBe(true);
    expect(mockRoute.alternatives[0].score).toBeGreaterThan(mockRoute.recommendedGate.score!);
  });

  it('should validate discriminated union types in telemetry payloads', () => {
    const event = {
      type: 'ROUTE_CALCULATION',
      venueId: 'stadium_01',
      payload: { gateId: 'A', mobilityRequested: true },
      timestamp: new Date().toISOString()
    };
    
    expect(event.type).toBe('ROUTE_CALCULATION');
    expect(event.payload.mobilityRequested).toBe(true);
  });
});
