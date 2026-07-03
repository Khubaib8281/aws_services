'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/cn';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 90) return { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)', label: 'Excellent' };
  if (score >= 70) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', label: 'Good' };
  if (score >= 40) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', label: 'Needs Work' };
  return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', label: 'Poor' };
}

export default function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<number | null>(null);

  const strokeWidth = size * 0.065;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  const color = getScoreColor(score);

  useEffect(() => {
    setMounted(true);
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [score]);

  const center = size / 2;

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center justify-center',
        mounted ? 'fade-in' : 'opacity-0'
      )}
      style={{ width: size, height: size }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 pulse-glow"
        style={{ background: color.glow }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Track subtle inner glow */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.03)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 6px ${color.glow})`,
            transition: 'stroke 0.5s ease',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tracking-tight"
          style={{
            fontSize: size * 0.28,
            color: color.stroke,
            textShadow: `0 0 20px ${color.glow}`,
          }}
        >
          {animatedScore}
        </span>
        <span
          className="text-text-secondary font-medium mt-0.5"
          style={{ fontSize: size * 0.078 }}
        >
          ATS Score
        </span>
        <span
          className="font-medium mt-1 rounded-full px-2 py-0.5"
          style={{
            fontSize: size * 0.065,
            color: color.stroke,
            background: `${color.glow.replace('0.3', '0.1')}`,
          }}
        >
          {color.label}
        </span>
      </div>
    </div>
  );
}
