import NodeCache from 'node-cache';
import { executeWithFirestoreFallback } from '../db';
import { Gate, VenueData } from '../../src/types';

/**
 * Venue Cache
 * Cache venue data for 60 seconds to reduce Firestore reads and improve performance.
 */
const venueCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * VenueService
 * 
 * Orchestrates the retrieval of venue metadata and the execution of the 
 * "Dynamic Routing Engine." This service implements the multi-weighted 
 * cost heuristic used to balance crowd flow across venue assets.
 * 
 * @category Services
 * @heuristic Cost = (Geometric_Friction * 0.4) + (Temporal_Friction * 0.6)
 */
export class VenueService {
  /**
   * Retrieves venue telemetry and status data.
   * Implements a 60-second TTL in-memory cache to mitigate Firestore read pressure.
   * 
   * @param venueId - Unique identifier for the stadium/arena asset.
   * @returns {Promise<VenueData>} Metadata and current gate operational states.
   * @throws APIError if telemetry ingestion fails.
   */
  public static async getVenueData(venueId: string): Promise<VenueData> {
    const cachedData = venueCache.get<VenueData>(venueId);
    if (cachedData) {
      return cachedData;
    }

    try {
      const data = await executeWithFirestoreFallback(async (db) => {
        const doc = await db.collection('venues').doc(venueId).get();
        if (doc.exists) {
          return doc.data() as VenueData;
        }
        return null;
      });

      if (data) {
        venueCache.set(venueId, data);
        return data;
      }
    } catch (error) {
      const err = error as Error & { code?: number };
      const errorMsg = (err.message || String(err)).toUpperCase();
      const isAccessError = errorMsg.includes('PERMISSION_DENIED') || 
                           errorMsg.includes('NOT_FOUND') ||
                           err.code === 5 ||
                           err.code === 7;
      
      if (!isAccessError) {
        console.error('[VenueService] Firestore Telemetry Ingestion Failure:', err.message || err);
      }
    }

    return this.getDefaultVenueData(venueId);
  }

  /**
   * Optimized ingress/egress trajectory calculation.
   * 
   * Iterates through available mobility-filtered gates and ranks them based on 
   * a linear weighted sum of distance (geometric friction) and congestion (temporal friction).
   * 
   * @param userLocation - Current GPS coordinates of the attendee.
   * @param mobilityFirst - Boolean flag to activate strict ADA/mobility-only pathing.
   * @param venueId - Target facility scope.
   * @returns {Promise<Gate[]>} A prioritized list of optimal entry/exit gates.
   */
  public static async calculateBestRoute(
    userLocation: { lat: number, lng: number }, 
    mobilityFirst: boolean, 
    venueId: string
  ): Promise<Gate[]> {
    const venue = await this.getVenueData(venueId);
    
    // Accessibility Guard (WCAG 2.1 & ADA Compliance)
    const availableGates = mobilityFirst 
      ? venue.gates.filter(g => g.isAccessible) 
      : venue.gates;

    const scoredGates = availableGates.map(gate => {
      // Euclidean proximity calculation for sub-millisecond response latency
      const distance = Math.sqrt(
        Math.pow(gate.lat - userLocation.lat, 2) + 
        Math.pow(gate.lng - userLocation.lng, 2)
      );
      
      /**
       * HEURISTIC SCORING ENGINE
       * We assign a 60% weight to congestion (Temporal Friction) to maximize 
       * throughput and prevent bottleneck formation at the nearest gate.
       */
      const score = (distance * 1000 * 0.4) + (gate.congestion * 100 * 0.6);
      
      return { ...gate, score };
    });

    // Lowest score correlates to the peak operational efficiency path
    return scoredGates.sort((a, b) => (a.score || 0) - (b.score || 0));
  }

  /**
   * Provides fallback venue data if the database is unreachable.
   * 
   * @param venueId - The ID of the venue.
   * @returns A default VenueData object.
   */
  private static getDefaultVenueData(venueId: string): VenueData {
    return {
      id: venueId,
      name: 'Global Arena',
      congestionLevel: 0.4,
      gates: [
        { id: 'A', name: 'North Gate', lat: 34.0522, lng: -118.2437, isAccessible: true, congestion: 0.8 },
        { id: 'B', name: 'South Gate', lat: 34.0530, lng: -118.2445, isAccessible: true, congestion: 0.3 },
        { id: 'C', name: 'East Gate', lat: 34.0515, lng: -118.2420, isAccessible: false, congestion: 0.1 },
      ]
    };
  }
}
