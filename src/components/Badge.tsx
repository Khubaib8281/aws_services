'use client';

import { cn } from '@/lib/cn';

interface BadgeProps {
  score: number;
  className?: string;
}

function getScoreConfig(score: number) {
  if (score >= 90) {
    return {
      bg: 'bg-accent/15',
      text: 'text-accent-light',
      border: 'border-accent/20',
      glow: 'shadow-[0_0_8px_rgba(6,182,212,0.15)]',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-success/15',
      text: 'text-success',
      border: 'border-success/20',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-warning/15',
      text: 'text-warning',
      border: 'border-warning/20',
      glow: 'shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    };
  }
  return {
    bg: 'bg-danger/15',
    text: 'text-danger',
    border: 'border-danger/20',
    glow: 'shadow-[0_0_8px_rgba(239,68,68,0.15)]',
  };
}

export default function Badge({ score, className }: BadgeProps) {
  const config = getScoreConfig(score);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide',
        config.bg,
        config.text,
        config.border,
        config.glow,
        className
      )}
    >
      {score}
      <span className="opacity-60">/100</span>
    </span>
  );
}
