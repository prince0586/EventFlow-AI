import React from 'react';
import { Activity, Radio } from 'lucide-react';

interface AnalyticsHeaderProps {
  venueId: string;
  setVenueId: (id: string) => void;
  eventType: string;
  setEventType: (type: string) => void;
}

/**
 * AnalyticsHeader Component
 * 
 * Provides controls for filtering venue intelligence reports by venue ID and event type.
 * Follows the Technical Dashboard recipe with uppercase tracking and monospace accents.
 */
export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  venueId, 
  setVenueId, 
  eventType, 
  setEventType 
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex items-center justify-between">
        <div id="analytics-title" className="flex items-center gap-2 font-bold text-[10px] text-text-sub uppercase tracking-widest">
          <Activity size={12} aria-hidden="true" />
          Venue Intelligence (BigQuery)
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded" aria-label="System is live">
          <Radio size={10} aria-hidden="true" /> LIVE
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <select 
          value={venueId} 
          onChange={e => setVenueId(e.target.value)}
          className="text-[10px] bg-bg border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand"
          aria-label="Filter by Venue"
        >
          <option value="stadium_01">Stadium 01</option>
          <option value="arena_02">Arena 02</option>
          <option value="hall_03">Hall 03</option>
        </select>
        <select 
          value={eventType} 
          onChange={e => setEventType(e.target.value)}
          className="text-[10px] bg-bg border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand"
          aria-label="Filter by Event Type"
        >
          <option value="">All Events</option>
          <option value="ROUTE_CALCULATION">Routing</option>
          <option value="QUEUE_ESTIMATE">Queuing</option>
        </select>
      </div>
    </div>
  );
};
