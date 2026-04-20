import React, { useState, useCallback } from 'react';
import { Navigation, MapPin, Accessibility } from 'lucide-react';
import { RouteCalculationResult } from '../types';
import { RouteDisplay } from './CrowdRouting/RouteDisplay';

interface CrowdRoutingProps {
  onRouteCalculated?: (route: RouteCalculationResult) => void;
}

/**
 * CrowdRouting Architecture
 * 
 * Orchestrates the platform's multi-weighted cost heuristic for venue ingress/egress.
 * Integrates real-time congestion telemetry via API with authoritative 
 * user-preference state management.
 * 
 * @component
 */
export const CrowdRouting = React.memo(({ onRouteCalculated }: CrowdRoutingProps) => {
  const [route, setRoute] = useState<RouteCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobilityFirst, setMobilityFirst] = useState<boolean>(false);

  /**
   * Action: Dispatch Routing Calculation
   */
  const getBestRoute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobilityFirst, 
          userLocation: { lat: 34.0520, lng: -118.2430 } 
        })
      });
      
      if (!res.ok) throw new Error(`Operational failure: ${res.status}`);
      
      const data = await res.json();
      setRoute(data);
      if (onRouteCalculated) {
        onRouteCalculated(data);
      }
    } catch (err: any) {
      setError(err.message || 'Routing engine offline');
      console.error('[CrowdRouting] Engine Failure:', err);
    } finally {
      setLoading(false);
    }
  }, [mobilityFirst, onRouteCalculated]);

  return (
    <div className="flex flex-col gap-6 h-full" role="region" aria-labelledby="routing-title">
      <div className="flex items-center justify-between col-title">
        <div id="routing-title" className="flex items-center gap-2">
          <Navigation size={14} aria-hidden="true" />
          Dynamic Routing Engine
        </div>
        {error && (
          <div className="flex items-center gap-1 text-[9px] text-accent-red font-bold animate-pulse">
             ENGINE OFFLINE
          </div>
        )}
      </div>
      
      <div className="flex-1 bg-bg rounded-xl border border-border relative overflow-hidden flex flex-col items-center justify-center p-8 transition-all hover:shadow-md">
        {route ? (
          <RouteDisplay 
            recommendedGate={route.recommendedGate} 
            alternatives={route.alternatives} 
          />
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto border border-border shadow-sm animate-pulse">
              <MapPin size={24} className="text-brand" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-text-main">Ready to Route</h3>
              <p className="text-sm text-text-sub max-w-[200px] mx-auto">Calculate the most efficient path based on real-time venue congestion.</p>
            </div>
            <div className="sr-only" aria-live="polite">
              {loading ? 'Analyzing Venue data, please wait...' : (route ? 'Routing calculation complete.' : '')}
            </div>
            <button 
              onClick={getBestRoute}
              disabled={loading}
              className="bg-brand text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-dark transition-all disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-brand focus:ring-offset-2"
              aria-busy={loading}
            >
              {loading ? 'Analyzing Venue...' : 'Initialize Routing'}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border shadow-sm font-sans">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${mobilityFirst ? 'bg-brand/10 text-brand' : 'bg-bg text-text-sub'}`}>
            <Accessibility size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-main leading-tight">Mobility-First</p>
            <p className="text-[11px] text-text-sub leading-tight">Prioritize accessible paths</p>
          </div>
        </div>
        <button 
          onClick={() => setMobilityFirst(!mobilityFirst)}
          className={`w-12 h-6 rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${mobilityFirst ? 'bg-brand' : 'bg-border'}`}
          aria-pressed={mobilityFirst}
          aria-label="Toggle Mobility-First Routing"
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${mobilityFirst ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
});

CrowdRouting.displayName = 'CrowdRouting';
