import React from 'react';
import { motion } from 'motion/react';
import { Gate } from '../../types';

interface GateMarkerProps {
  gate: Gate;
  isRecommended: boolean;
  x: number;
  y: number;
  color: string;
}

/**
 * GateMarker Component
 * 
 * Renders a visual marker for a venue gate.
 * Features smooth scaling and shadow effects for recommended routes.
 */
export const GateMarker: React.FC<GateMarkerProps> = ({ 
  gate, 
  isRecommended, 
  x, 
  y, 
  color 
}) => {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isRecommended ? 1.25 : 1, 
        opacity: 1,
        x: x,
        y: y
      }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute flex flex-col items-center z-10 ${isRecommended ? 'z-20' : ''}`}
      role="img"
      aria-label={`Gate ${gate.name}: ${Math.round(gate.congestion * 100)}% congested`}
    >
      <motion.div 
        animate={{ 
          backgroundColor: color,
          boxShadow: isRecommended ? '0 0 10px var(--color-brand)' : 'none'
        }}
        className="w-3 h-3 rounded-full border-2 border-white shadow-sm relative" 
      />
      <span className={`text-[8px] font-bold mt-1 px-1 rounded shadow-sm whitespace-nowrap ${isRecommended ? 'bg-brand text-white' : 'bg-white text-text-main'}`}>
        {gate.name}
      </span>
    </motion.div>
  );
};
