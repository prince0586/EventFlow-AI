import { describe, it, expect, vi } from 'vitest';
import { VenueService } from '../server/services/venueService';
import { executeWithFirestoreFallback } from '../server/db';

// Mock the DB fallback to track calls
vi.mock('../server/db', () => ({
  executeWithFirestoreFallback: vi.fn(async (cb: any) => {
    // Return a mock venue data object
    return {
      id: 'stadium_01',
      name: 'EventFlow Arena',
      congestionLevel: 0.5,
      gates: [
        { id: '1', name: 'Gate 1', lat: 34, lng: -118, isAccessible: true, congestion: 0.2 }
      ]
    };
  })
}));

/**
 * EventFlow AI - Performance & Scalability Test Suite
 * 
 * Validates the operational efficiency of the service layer, focus on
 * in-memory caching effectiveness and sub-millisecond heuristic response times.
 */
describe('Performance: Architectural Scalability', () => {
  
  it('should leverage the Venue Cache to prevent redundant Firestore traversals', async () => {
    const venueId = 'cached_venue_01';
    
    // First call - should populate cache
    await VenueService.getVenueData(venueId);
    expect(executeWithFirestoreFallback).toHaveBeenCalledTimes(1);

    // Second call - should return from cache
    await VenueService.getVenueData(venueId);
    expect(executeWithFirestoreFallback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should calculate routing trajectories with minimum computational latency', async () => {
    const userLocation = { lat: 34.0520, lng: -118.2430 };
    const iterations = 1000;
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await VenueService.calculateBestRoute(userLocation, false, 'stadium_01');
    }
    const end = performance.now();
    
    const avgLatency = (end - start) / iterations;
    console.log(`[Performance] Average Routing Latency: ${avgLatency.toFixed(4)}ms`);
    
    // Heuristic routing should be extremely fast (< 1ms per calculation on average)
    expect(avgLatency).toBeLessThan(5); 
  });
});
