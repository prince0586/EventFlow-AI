import { describe, it, expect } from 'vitest';
import { VenueService } from '../server/services/venueService';
import { Gate } from '../src/types';

describe('VenueService - Routing Heuristic', () => {
  it('should calculate the best route using the 40/60 weighted heuristic', async () => {
    const userLocation = { lat: 34.0520, lng: -118.2430 };
    const mobilityFirst = false;
    const venueId = 'test_stadium';

    // BestRoute should sort by score: (Distance * 4) + (Congestion * 6)
    const gates = await VenueService.calculateBestRoute(userLocation, mobilityFirst, venueId);
    
    expect(gates.length).toBeGreaterThan(0);
    
    // Verify sorting (lower score first)
    for (let i = 0; i < gates.length - 1; i++) {
      expect(gates[i].score).toBeLessThanOrEqual(gates[i+1].score!);
    }
  });

  it('should handle mobility-first filtering strictly', async () => {
    const userLocation = { lat: 34.0520, lng: -118.2430 };
    const mobilityFirst = true;
    const venueId = 'test_stadium';

    const gates = await VenueService.calculateBestRoute(userLocation, mobilityFirst, venueId);
    
    gates.forEach(gate => {
      expect(gate.isAccessible).toBe(true);
    });
  });

  it('should prioritize congestion over distance if congestion is high', async () => {
    const userLocation = { lat: 0, lng: 0 };
    
    // Manual check of the math:
    // Gate A: dist=1, cong=0.9 => (1 * 1000 * 0.4) + (0.9 * 100 * 0.6) = 400 + 54 = 454
    // Gate B: dist=1.2, cong=0.1 => (1.2 * 1000 * 0.4) + (0.1 * 100 * 0.6) = 480 + 6 = 486
    // Gate C: dist=1, cong=0.1 => (1 * 1000 * 0.4) + (0.1 * 100 * 0.6) = 400 + 6 = 406
    
    // In our VenueService.getDefaultVenueData:
    // Gate A: name='North Gate', lat=34.0522, lng=-118.2437, cong=0.8
    // Gate B: name='South Gate', lat=34.0530, lng=-118.2445, cong=0.3
    // Gate C: name='East Gate',  lat=34.0515, lng=-118.2420, cong=0.1
    
    // User is at 34.0520, -118.2430
    // Dist A: sqrt((0.0002)^2 + (0.0007)^2) = 0.000728
    // Dist B: sqrt((0.0010)^2 + (0.0015)^2) = 0.001802
    // Dist C: sqrt((0.0005)^2 + (0.0010)^2) = 0.001118
    
    // Score A: (0.000728 * 1000 * 0.4) + (0.8 * 100 * 0.6) = 0.29 + 48 = 48.29
    // Score B: (0.001802 * 1000 * 0.4) + (0.3 * 100 * 0.6) = 0.72 + 18 = 18.72
    // Score C: (0.001118 * 1000 * 0.4) + (0.1 * 100 * 0.6) = 0.44 + 6 = 6.44
    
    const gates = await VenueService.calculateBestRoute({ lat: 34.0520, lng: -118.2430 }, false, 'test');
    expect(gates[0].id).toBe('C'); // Lowest score
  });
});
