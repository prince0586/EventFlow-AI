import React from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { QueueToken } from '../../types';
import { cn, formatDuration } from '../../lib/utils';

interface TokenCardProps {
  token: QueueToken;
  className?: string;
}

/**
 * TokenCard Component
 * 
 * Displays detailed information about an active virtual queue token.
 * Features a high-performance mono font for ID and wait times.
 * 
 * @component
 */
export const TokenCard: React.FC<TokenCardProps> = ({ token, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className={cn(
        "p-4 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] uppercase font-bold rounded tracking-wider">
          {token.serviceType}
        </div>
        <div className="text-[10px] text-text-sub font-mono bg-bg px-1.5 py-0.5 rounded border border-border">
          ID: <span className="text-text-main">{token.id.slice(-6)}</span>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[11px] text-text-sub font-serif italic mb-1 flex items-center gap-1 opacity-80">
            <Clock size={10} /> Estimated Wait
          </p>
          <p className="text-3xl font-mono font-bold text-brand tracking-tighter">
            {formatDuration(token.estimatedWaitTime)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" title="Live tracking active" />
          <span className="text-[9px] text-accent-green font-bold uppercase tracking-tighter">Live</span>
        </div>
      </div>
    </motion.div>
  );
};
