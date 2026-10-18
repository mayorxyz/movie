import React from 'react';

interface RatingRingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingRing({ rating, size = 'md' }: RatingRingProps) {
  const percentage = (rating / 10) * 100;
  const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const color = rating >= 7 ? 'var(--color-success)' : rating >= 5 ? 'var(--color-accent)' : 'var(--color-error)';
  const svgSize = size === 'sm' ? 40 : size === 'md' ? 48 : 60;

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`Rating: ${rating.toFixed(1)} out of 10`}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={size === 'sm' ? 2 : 3}
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size === 'sm' ? 2 : 3}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className={`absolute font-semibold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`} style={{ color }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
