import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QueueButtonProps {
  type: string;
  onClick: () => void;
  loading: boolean;
  className?: string;
}

/**
 * QueueButton Component
 * 
 * An interactive CTA for joining a specific service queue.
 * Includes loading states and hover effects following the Technical Dashboard recipe.
 * 
 * @component
 */
export const QueueButton: React.FC<QueueButtonProps> = ({ type, onClick, loading, className }) => {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-brand hover:shadow-sm transition-all group focus:ring-2 focus:ring-brand focus:ring-offset-2",
        className
      )}
      aria-label={`Join ${type} queue`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center text-text-sub group-hover:text-brand transition-colors">
          {loading ? (
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          ) : (
            <Users size={16} aria-hidden="true" />
          )}
        </div>
        <span className="capitalize font-bold text-sm text-text-main">{type}</span>
      </div>
      <ChevronRight size={16} className="text-border group-hover:text-brand transition-all" aria-hidden="true" />
    </button>
  );
};
