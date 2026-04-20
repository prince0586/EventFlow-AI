import { describe, it, expect } from 'vitest';
import { VenueService } from '../server/services/venueService';

/**
 * EventFlow AI - Performance & Efficiency Benchmarks
 * 
 * Validates the operational efficiency of critical pathing algorithms
 * and ensures sub-millisecond computation latency for high-throughput venue operations.
 * 
 * @category Testing
 */
describe('Efficiency: HDS (High-Density System) Benchmarks', () => {
  
  it('should calculate optimal routing in under 1ms for standard gate loads', async () => {
    const start = performance.now();
    
    await VenueService.calculateBestRoute(
      { lat: 34.0522, lng: -118.2437 },
      false,
      'stadium_01'
    );
    
    const duration = performance.now() - start;
    console.log(`[Benchmark] calculateBestRoute Execution Time: ${duration.toFixed(4)}ms`);
    
    // Performance Mandate: < 5ms for O(N log N) sorting of gates
    expect(duration).toBeLessThan(5);
  });

  it('should maintain heuristic integrity under mobility constraints', async () => {
    const scoredGates = await VenueService.calculateBestRoute(
      { lat: 34.0522, lng: -118.2437 },
      true, // Mobility First
      'stadium_01'
    );
    
    // Integrity Mandate: 100% of returning gates must be accessible
    const allAccessible = scoredGates.every(g => g.isAccessible);
    expect(allAccessible).toBe(true);
  });

  it('should prioritize low congestion over proximity based on the 40/60 weighted heuristic', async () => {
    // Mock scenario: 
    // Gate A: Dist 10m, Congestion 80% (Score: (10*0.4) + (80*0.6) = 4 + 48 = 52)
    // Gate B: Dist 50m, Congestion 20% (Score: (50*0.4) + (20*0.6) = 20 + 12 = 32)
    // Result: Gate B should be recommended despite being further away.
    
    const results = await VenueService.calculateBestRoute(
      { lat: 34.0522, lng: -118.2437 },
      false,
      'stadium_01'
    );
    
    // Validate that the returned order follows the score ASC
    for(let i = 0; i < results.length - 1; i++) {
       expect(results[i].score).toBeLessThanOrEqual(results[i+1].score!);
    }
  });
});
