'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-glass-border bg-glass backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          <Sparkles className="h-5 w-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-40 blur-lg" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-text-primary">
            Resume<span className="gradient-text">AI</span>
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary/60">
            Analyzer
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-1.5 px-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-light/50 hover:text-text-primary'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-primary to-accent shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              )}

              <Icon
                className={cn(
                  'h-[18px] w-[18px] transition-colors duration-200',
                  isActive ? 'text-primary-light' : 'text-text-secondary group-hover:text-text-primary'
                )}
              />
              {label}

              {/* Hover glow */}
              {isActive && (
                <div className="absolute inset-0 -z-10 rounded-xl bg-primary/5 blur-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-5 pb-5">
        <div className="mx-auto h-px bg-gradient-to-r from-transparent via-glass-border to-transparent mb-4" />
        <div className="flex items-center justify-between text-[11px] text-text-secondary/40">
          <span>ResumeAI</span>
          <span className="rounded-full border border-glass-border bg-surface-light/40 px-2 py-0.5 text-[10px]">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
