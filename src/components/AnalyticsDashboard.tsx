import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { AnalyticsHeader } from './AnalyticsDashboard/AnalyticsHeader';
import { KpiSection } from './AnalyticsDashboard/KpiSection';
import { TelemetryFooter } from './AnalyticsDashboard/TelemetryFooter';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * AnalyticsDashboard Architecture
 * 
 * Orchestrates real-time venue operational intelligence via a high-fidelity 
 * telemetry pipeline. Implements modular sub-component partitioning and 
 * authoritative data hooks for enterprise performance.
 * 
 * @component
 */
export const AnalyticsDashboard = React.memo(() => {
  const [venueId, setVenueId] = useState<string>('stadium_01');
  const [eventType, setEventType] = useState<string>('');
  
  const { report, loading, error } = useAnalytics(venueId, eventType);

  if (loading && !report) {
    return <DashboardSkeletion />;
  }

  if (error && !report) {
    return <DashboardError message={error} />;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm" role="region" aria-labelledby="analytics-title">
      <AnalyticsHeader 
        venueId={venueId} 
        setVenueId={setVenueId} 
        eventType={eventType} 
        setEventType={setEventType} 
      />

      {report?.warning && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded p-2 text-[8px] text-accent-red italic leading-tight mb-2">
          ⚠️ {report.warning}
        </div>
      )}

      {report?.anomaliesDetected && (
        <div className="bg-accent-red rounded border-l-2 border-accent-red p-2 space-y-1 animate-pulse mb-4">
          <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase tracking-wider">
            <Radio size={10} /> ANOMALY DETECTED
          </div>
          {report.insights && (
            <p className="text-[8px] text-white/90 leading-tight italic">{report.insights}</p>
          )}
        </div>
      )}

      {report && <KpiSection report={report} />}
      
      {report && <TelemetryFooter report={report} />}
    </div>
  );
});

/**
 * Technical Placeholder - Ingestion Active
 */
const DashboardSkeletion = () => (
  <div className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-3 w-24 bg-bg rounded" />
      <div className="h-3 w-12 bg-bg rounded" />
    </div>
    <div className="grid grid-cols-2 gap-2"><div className="h-8 bg-bg rounded" /><div className="h-8 bg-bg rounded" /></div>
    <div className="h-24 bg-bg rounded" />
  </div>
);

/**
 * Telemetry Conflict Resolution
 */
const DashboardError = ({ message }: { message: string }) => (
  <div className="bg-surface border border-accent-red/50 rounded-xl p-4 shadow-sm text-center">
    <p className="text-xs text-accent-red font-bold mb-2">Ingestion Fault Detected</p>
    <p className="text-[10px] text-text-sub italic leading-tight">{message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 text-[9px] bg-bg border border-border px-2 py-1 rounded hover:bg-surface transition-colors font-bold"
    >
      REBOOT TELEMETRY
    </button>
  </div>
);

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

AnalyticsDashboard.displayName = 'AnalyticsDashboard';
