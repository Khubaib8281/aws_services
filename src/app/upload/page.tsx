'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CloudUpload,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import Dropzone from '@/components/Dropzone';
import { cn } from '@/lib/cn';

type UploadStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done' | 'error';

const steps = [
  { key: 'uploading', label: 'Uploading to cloud...', icon: CloudUpload },
  { key: 'extracting', label: 'Extracting resume text...', icon: FileText },
  { key: 'analyzing', label: 'AI analyzing your resume...', icon: Sparkles },
] as const;

function getStepIndex(step: UploadStep): number {
  if (step === 'uploading') return 0;
  if (step === 'extracting') return 1;
  if (step === 'analyzing') return 2;
  if (step === 'done') return 3;
  return -1;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setStep('idle');
  }, []);

  async function handleUpload() {
    if (!file) return;

    try {
      setError(null);
      setStep('uploading');

      // Simulate progressive steps for UX
      const stepTimer1 = setTimeout(() => setStep('extracting'), 1200);
      const stepTimer2 = setTimeout(() => setStep('analyzing'), 2800);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setStep('done');

      // Brief pause to show success, then navigate
      setTimeout(() => {
        router.push(`/resumes/${data.id}`);
      }, 800);
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  function handleRetry() {
    setStep('idle');
    setError(null);
  }

  const isProcessing = step === 'uploading' || step === 'extracting' || step === 'analyzing';
  const currentStepIndex = getStepIndex(step);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Analyze Resume</h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload your resume and let AI provide detailed feedback
        </p>
      </div>

      {/* Upload card */}
      <div
        className="glass-card relative overflow-hidden fade-in"
        style={{ animationDelay: '100ms' }}
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="p-8 space-y-6">
          {/* Dropzone */}
          <Dropzone onFileSelect={handleFileSelect} disabled={isProcessing} />

          {/* Upload button */}
          {step === 'idle' && file && (
            <button
              onClick={handleUpload}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] fade-in"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Progress steps */}
          {(isProcessing || step === 'done') && (
            <div className="space-y-3 fade-in">
              {steps.map(({ key, label, icon: Icon }, i) => {
                const isCompleted = currentStepIndex > i;
                const isActive = currentStepIndex === i;
                const isPending = currentStepIndex < i;

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-500',
                      isActive &&
                        'border-primary/20 bg-primary/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]',
                      isCompleted && 'border-success/15 bg-success/5',
                      isPending && 'border-glass-border/30 bg-surface-light/20 opacity-40'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-500',
                        isActive && 'bg-primary/15 text-primary-light',
                        isCompleted && 'bg-success/15 text-success',
                        isPending && 'bg-surface-lighter/30 text-text-secondary/40'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      ) : isActive ? (
                        <Icon className="h-4.5 w-4.5 animate-pulse" />
                      ) : (
                        <Icon className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium transition-colors duration-300',
                          isActive && 'text-text-primary',
                          isCompleted && 'text-success',
                          isPending && 'text-text-secondary/40'
                        )}
                      >
                        {isCompleted ? label.replace('...', '') : label}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            className="h-1.5 w-1.5 rounded-full bg-primary-light animate-pulse"
                            style={{ animationDelay: `${d * 200}ms` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Done state */}
              {step === 'done' && (
                <div className="flex items-center gap-4 rounded-xl border border-success/20 bg-success/5 px-5 py-4 fade-in">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-medium text-success">
                    Analysis complete! Redirecting...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {step === 'error' && error && (
            <div className="space-y-4 fade-in">
              <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-5 py-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-danger mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger">
                    Analysis failed
                  </p>
                  <p className="text-xs text-danger/70 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-glass-border bg-surface-light/50 px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div
        className="glass-card p-6 fade-in"
        style={{ animationDelay: '200ms' }}
      >
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          💡 Tips for a better score
        </h3>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-light" />
            Use standard section headings like &quot;Experience&quot;, &quot;Education&quot;, &quot;Skills&quot;
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-light" />
            Include quantifiable achievements (numbers, percentages, metrics)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-light" />
            Match keywords from the job description you&apos;re targeting
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-light" />
            Keep formatting clean — avoid tables, columns, and graphics
          </li>
        </ul>
      </div>
    </div>
  );
}
