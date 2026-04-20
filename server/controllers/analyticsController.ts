import { Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analyticsService';

const AnalyticsQuerySchema = z.object({
  venueId: z.string().optional().default('stadium_01'),
  type: z.string().optional()
});

/**
 * AnalyticsController
 * 
 * Orchestrates the retrieval of performance reports for the venue management dashboard.
 * Interfaces with the AnalyticsService to provide high-fidelity operational signals.
 * 
 * @category Controllers
 */
export class AnalyticsController {
  /**
   * Retrieves a diagnostic performance report for a specific venue.
   * 
   * @param req - Express request object containing venueId and optional eventType in the query.
   * @param res - Express response object for delivering the JSON AnalyticsReport.
   */
  public static async getReport(req: Request, res: Response) {
    const validation = AnalyticsQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: validation.error.format() });
    }

    const { venueId, type } = validation.data;
    try {
      const report = await AnalyticsService.getVenueReport(venueId, type);
      res.json(report);
    } catch (error) {
      console.error('Analytics Report Error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics report' });
    }
  }
}
