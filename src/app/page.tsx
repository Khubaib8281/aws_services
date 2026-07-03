'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  TrendingUp,
  Award,
  Trash2,
  Eye,
  Plus,
  Search,
  Inbox,
} from 'lucide-react';
import Badge from '@/components/Badge';
import { cn } from '@/lib/cn';

interface Analysis {
  id: string;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  createdAt: string;
  analysis: Analysis | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl p-4">
      <div className="h-10 w-10 rounded-lg shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded shimmer" />
        <div className="h-3 w-24 rounded shimmer" />
      </div>
      <div className="h-6 w-16 rounded-full shimmer" />
      <div className="h-4 w-20 rounded shimmer" />
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-lg shimmer" />
        <div className="h-8 w-8 rounded-lg shimmer" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card-hover p-6 fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold tracking-tight mt-2 text-text-primary">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to fetch resumes');
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, fileName: string) {
    if (!window.confirm(`Delete "${fileName}" and its analysis? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete resume. Please try again.');
    }
  }

  const totalResumes = resumes.length;
  const scores = resumes
    .map((r) => r.analysis?.atsScore)
    .filter((s): s is number => s != null);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const highestScore = scores.length ? Math.max(...scores) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track and manage your resume analyses
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Analyze Resume
        </Link>
      </div>

      {/* Stats cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total Resumes"
            value={totalResumes}
            accent="bg-primary/10 text-primary-light"
            delay="0ms"
          />
          <StatCard
            icon={TrendingUp}
            label="Average ATS Score"
            value={avgScore ? `${avgScore}%` : '—'}
            accent="bg-success/10 text-success"
            delay="80ms"
          />
          <StatCard
            icon={Award}
            label="Highest Score"
            value={highestScore ? `${highestScore}%` : '—'}
            accent="bg-accent/10 text-accent-light"
            delay="160ms"
          />
        </div>
      )}

      {/* Resume list */}
      <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: '200ms' }}>
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-glass-border px-6 py-4">
          <Search className="h-4 w-4 text-text-secondary/50" />
          <h2 className="flex-1 text-sm font-semibold text-text-secondary">
            Recent Analyses
          </h2>
          <span className="text-xs text-text-secondary/50">
            {totalResumes} {totalResumes === 1 ? 'resume' : 'resumes'}
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="divide-y divide-glass-border/50 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-danger text-sm font-medium">{error}</p>
            <button
              onClick={fetchResumes}
              className="rounded-lg border border-glass-border bg-surface-light/50 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light/50 border border-glass-border">
              <Inbox className="h-8 w-8 text-text-secondary/40" />
            </div>
            <div>
              <p className="text-text-primary font-medium">No resumes yet</p>
              <p className="text-text-secondary text-sm mt-1">
                Upload your first resume to get AI-powered insights
              </p>
            </div>
            <Link
              href="/upload"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary-light transition-all hover:bg-primary/15 hover:border-primary/30"
            >
              <Plus className="h-4 w-4" />
              Upload Resume
            </Link>
          </div>
        )}

        {/* Resume rows */}
        {!loading && !error && resumes.length > 0 && (
          <div className="divide-y divide-glass-border/30">
            {resumes.map((resume, i) => (
              <div
                key={resume.id}
                className="group flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-surface-light/30 cursor-pointer fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => router.push(`/resumes/${resume.id}`)}
              >
                {/* File icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <FileText className="h-5 w-5 text-primary-light/70" />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-white transition-colors">
                    {resume.fileName}
                  </p>
                  <p className="text-xs text-text-secondary/60 mt-0.5">
                    {formatFileSize(resume.fileSize)}
                  </p>
                </div>

                {/* Score badge */}
                <div className="shrink-0">
                  {resume.analysis ? (
                    <Badge score={resume.analysis.atsScore} />
                  ) : (
                    <span className="text-xs text-text-secondary/50 italic">
                      Pending
                    </span>
                  )}
                </div>

                {/* Date */}
                <p className="shrink-0 text-xs text-text-secondary/60 w-24 text-right">
                  {formatDate(resume.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex shrink-0 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    href={`/resumes/${resume.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-surface-light/50 text-text-secondary hover:text-primary-light hover:border-primary/20 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resume.id, resume.fileName);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-surface-light/50 text-text-secondary hover:text-danger hover:border-danger/20 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
