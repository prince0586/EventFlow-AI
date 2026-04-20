import React from 'react';
import { Gate } from '../../types';
import { Clock, Accessibility } from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface RouteDisplayProps {
  recommendedGate: Gate;
  alternatives: Gate[];
}

/**
 * RouteDisplay Component
 * 
 * Shows the calculated routing results with primary recommendation and ranked alternatives.
 * Uses consistent cards and monospace timestamps for data precision.
 * 
 * @component
 */
export const RouteDisplay: React.FC<RouteDisplayProps> = ({ recommendedGate, alternatives }) => {
  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
        <div className="text-[12px] text-brand font-bold mb-1 uppercase tracking-widest">RECOMMENDED PATH</div>
        <h3 className="text-xl font-bold mb-2 text-text-main">{recommendedGate.name}</h3>
        <div className="flex items-center gap-4 text-sm text-text-sub">
          <div className="flex items-center gap-1" aria-label={`Estimated wait time: ${formatDuration(recommendedGate.congestion * 15)}`}>
            <Clock size={14} aria-hidden="true" />
            {formatDuration(recommendedGate.congestion * 15)} wait
          </div>
          <div className="flex items-center gap-1" aria-label={`Accessibility: ${recommendedGate.isAccessible ? 'Accessible' : 'Standard'}`}>
            <Accessibility size={14} aria-hidden="true" />
            {recommendedGate.isAccessible ? 'Accessible' : 'Standard'}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-text-sub font-bold">Alternative Gates</p>
        {alternatives.map((alt) => (
          <div key={alt.id} className="flex justify-between items-center text-sm p-3 bg-surface rounded-lg border border-border hover:border-brand/30 transition-colors">
            <span className="font-medium text-text-main">{alt.name}</span>
            <span className="text-text-sub font-mono">+{Math.round((alt.score || 0) * 100)}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};
