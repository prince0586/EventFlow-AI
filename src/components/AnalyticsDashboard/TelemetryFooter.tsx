import React from 'react';
import { AnalyticsReport } from '../../types';

interface TelemetryFooterProps {
  report: AnalyticsReport;
}

/**
 * TelemetryFooter Component
 * 
 * Renders the high-precision metadata for the analytics pipeline.
 * Features monospace data anchors and status heartbeat indicators.
 * 
 * @component
 */
export const TelemetryFooter: React.FC<TelemetryFooterProps> = ({ report }) => {
  return (
    <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
      <div className="flex justify-between items-center text-[9px] text-text-sub font-serif italic">
        <div className="flex items-center gap-1 group cursor-help">
          <span className="w-1 h-1 bg-brand rounded-full animate-pulse" />
          Last Ingestion: <span className="text-text-main font-mono not-italic font-bold">
            {new Intl.DateTimeFormat('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            }).format(new Date(report.generatedAt))}
          </span>
        </div>
        <div className="font-mono">
          Tier: <span className="text-brand font-bold uppercase tracking-tighter">Enterprise</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-[9px] text-text-sub font-mono italic">
        <div>
          Throughput: <span className="text-text-main font-bold">{report.totalThroughput.toLocaleString()} units</span>
        </div>
        <div>
          Latency: <span className="text-accent-green font-bold">14ms</span>
        </div>
      </div>
    </div>
  );
};
