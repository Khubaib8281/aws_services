'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  Trash2,
  Calendar,
  FileText,
  HardDrive,
} from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import { cn } from '@/lib/cn';

interface Analysis {
  id: string;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface ResumeData {
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
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('rounded-xl shimmer', className)} />;
}

function SectionCard({
  title,
  items,
  icon: Icon,
  accentColor,
  iconBg,
  delay,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  accentColor: string;
  iconBg: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card overflow-hidden fade-in"
      style={{ animationDelay: delay }}
    >
      {/* Top accent line */}
      <div className={cn('h-px w-full', accentColor)} />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              iconBg
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <span className="ml-auto text-xs text-text-secondary/50 rounded-full border border-glass-border/50 px-2 py-0.5">
            {items.length}
          </span>
        </div>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 mt-0.5',
                  title === 'Strengths'
                    ? 'text-success'
                    : title === 'Weaknesses'
                      ? 'text-warning'
                      : 'text-accent-light'
                )}
              />
              <span className="text-sm text-text-secondary leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setResume(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchResume();
  }, [id]);

  async function handleDelete() {
    if (!resume) return;
    if (
      !window.confirm(
        `Delete "${resume.fileName}" and its analysis? This cannot be undone.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/');
    } catch {
      alert('Failed to delete. Please try again.');
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-6 w-64" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonBlock className="h-64 lg:col-span-1" />
          <SkeletonBlock className="h-64 lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonBlock className="h-52" />
          <SkeletonBlock className="h-52" />
          <SkeletonBlock className="h-52" />
        </div>
      </div>
    );
  }

  // 404 state
  if (notFound || !resume) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-5 py-32 text-center fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-light/50 border border-glass-border">
            <FileText className="h-10 w-10 text-text-secondary/30" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Resume not found
            </h2>
            <p className="text-text-secondary text-sm mt-2">
              This resume may have been deleted or the link is invalid.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary-light transition-all hover:bg-primary/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const analysis = resume.analysis;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-surface-light/50 text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary truncate max-w-md">
              {resume.fileName}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary/60">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {formatDate(resume.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(resume.fileSize)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resume.s3Url && (
            <a
              href={resume.s3Url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-surface-light/50 px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              View PDF
            </a>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-surface-light/50 px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-danger hover:border-danger/20 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {analysis ? (
        <>
          {/* Score + Summary row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score gauge card */}
            <div
              className="glass-card flex items-center justify-center p-8 lg:col-span-1 fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <ScoreGauge score={analysis.atsScore} size={190} />
            </div>

            {/* Summary card */}
            <div
              className="glass-card p-8 lg:col-span-2 fade-in"
              style={{ animationDelay: '150ms' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-light">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Summary
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Strengths / Weaknesses / Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard
              title="Strengths"
              items={analysis.strengths}
              icon={CheckCircle2}
              accentColor="bg-gradient-to-r from-transparent via-success/40 to-transparent"
              iconBg="bg-success/10 text-success"
              delay="200ms"
            />
            <SectionCard
              title="Weaknesses"
              items={analysis.weaknesses}
              icon={AlertCircle}
              accentColor="bg-gradient-to-r from-transparent via-warning/40 to-transparent"
              iconBg="bg-warning/10 text-warning"
              delay="280ms"
            />
            <SectionCard
              title="Suggestions"
              items={analysis.suggestions}
              icon={Lightbulb}
              accentColor="bg-gradient-to-r from-transparent via-accent/40 to-transparent"
              iconBg="bg-accent/10 text-accent-light"
              delay="360ms"
            />
          </div>
        </>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center gap-4 py-20 text-center fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light/50 border border-glass-border">
            <FileText className="h-8 w-8 text-text-secondary/30" />
          </div>
          <div>
            <p className="text-text-primary font-medium">
              No analysis available
            </p>
            <p className="text-text-secondary text-sm mt-1">
              This resume hasn&apos;t been analyzed yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
