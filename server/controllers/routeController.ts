import { Request, Response } from 'express';
import { z } from 'zod';
import { VenueService } from '../services/venueService';
import { AnalyticsService } from '../services/analyticsService';

const RouteSchema = z.object({
  userLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  mobilityFirst: z.boolean().optional(),
  venueId: z.string().optional()
});

/**
 * RouteController
 * 
 * Handles optimized crowd routing requests using the platform's multi-weighted cost heuristic.
 * Ensures high-throughput load balancing across venue ingress/egress points.
 * 
 * @category Controllers
 */
export class RouteController {
  /**
   * Calculates the optimal ingress/egress path based on real-time congestion and distance.
   * Leverages a linear weighted sum of geometric and temporal friction to determine target gates.
   * 
   * @param req - Express request body containing userLocation and mobility preferences.
   * @param res - Express response object with the recommended and alternative gate data.
   * @returns {Promise<Response>} A standardized JSON response containing prioritized routing telemetry.
   */
  public static async calculateRoute(req: Request, res: Response): Promise<Response> {
    const validation = RouteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Schema Validation Failure', 
        details: validation.error.format(),
        timestamp: new Date().toISOString()
      });
    }

    const { userLocation, mobilityFirst, venueId = 'stadium_01' } = validation.data;
    
    try {
      const scoredGates = await VenueService.calculateBestRoute(
        userLocation || { lat: 34.0520, lng: -118.2430 },
        !!mobilityFirst,
        venueId
      );

      // Asynchronous non-blocking telemetry logging
      AnalyticsService.logEvent({
        type: 'ROUTE_CALCULATION',
        venueId,
        payload: { mobilityFirst, gateSelected: scoredGates[0].id },
        timestamp: new Date().toISOString()
      }).catch(err => console.error('[RouteController] Analytics logging failed:', err));

      return res.json({
        recommendedGate: scoredGates[0],
        alternatives: scoredGates.slice(1),
        metadata: {
          mobilityFirst: !!mobilityFirst,
          venueId: venueId,
          computationTime: 'O(log N)'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[RouteController] Execution Failure:', err.message);
      return res.status(500).json({ 
        error: 'High-Performance Routing Calculation Failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}
