import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Resume Analyzer',
  description:
    'Analyze your resume with AI-powered insights. Get ATS compatibility scores, strengths, weaknesses, and actionable suggestions to land your dream job.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-[260px] flex-1 px-8 py-8 lg:px-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
