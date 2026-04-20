import React from 'react';
import { TrendingUp, Clock3 } from 'lucide-react';
import { AnalyticsReport } from '../../types';

interface KpiSectionProps {
  report: AnalyticsReport;
}

/**
 * KpiSection Component
 * 
 * Orchestrates the visualization of Key Performance Indicators (KPIs) through
 * high-fidelity fluid progress bars and monospace data anchors. This component
 * implements the "Technical Dashboard" design recipe with technical precision.
 * 
 * @param {KpiSectionProps} props - Component properties containing the analytics report.
 * @returns {JSX.Element} Reactive KPI visualization grid.
 * @category Components
 */
export const KpiSection: React.FC<KpiSectionProps> = ({ report }) => {
  // Calculated operational load for the wait-time progress bar (Baseline: 20 minutes)
  const waitTimeLoad = Math.min((report.avgWaitTime / 20) * 100, 100);

  return (
    <div className="grid grid-cols-2 gap-4 border-y border-border py-4 my-2" aria-live="polite">
      {/* Congestion KPI Architecture */}
      <div className="space-y-1 relative pr-4 border-r border-border">
        <p className="text-[10px] text-text-sub font-serif italic tracking-wide">Peak Congestion</p>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-mono font-bold tracking-tighter text-text-main">
            {(report.peakCongestion * 100).toFixed(0)}%
          </span>
          <TrendingUp size={10} className="text-accent-red" aria-hidden="true" />
        </div>
        <div 
          className="w-full h-1.5 bg-bg rounded-none overflow-hidden border border-border mt-2" 
          role="progressbar" 
          aria-valuenow={report.peakCongestion * 100} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className="h-full bg-accent-red transition-all duration-1000 shadow-[2px_0_4px_rgba(239,68,68,0.3)]" 
            style={{ width: `${report.peakCongestion * 100}%` }} 
          />
        </div>
      </div>

      {/* Wait Time KPI Architecture */}
      <div className="space-y-1 pl-2">
        <p className="text-[10px] text-text-sub font-serif italic tracking-wide">Avg Wait Time</p>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-mono font-bold tracking-tighter text-text-main">
            {report.avgWaitTime}m
          </span>
          <Clock3 size={10} className="text-brand" aria-hidden="true" />
        </div>
        <div 
          className="w-full h-1.5 bg-bg rounded-none overflow-hidden border border-border mt-2" 
          role="progressbar" 
          aria-valuenow={waitTimeLoad} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className="h-full bg-brand transition-all duration-1000 shadow-[2px_0_4px_rgba(37,99,235,0.3)]" 
            style={{ width: `${waitTimeLoad}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
