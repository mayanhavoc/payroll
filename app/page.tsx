'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PullRequest } from '@/types';
import { calculateSummary } from '@/lib/calculations';
import ConfigFormOAuth from '@/components/ConfigFormOAuth';
import PRTable from '@/components/PRTable';
import Summary from '@/components/Summary';
import ExportButtons from '@/components/ExportButtons';
import { Moon, Sun, Github, LogOut, User } from 'lucide-react';

interface Config {
  repository: string;
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currencySymbol: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [prs, setPRs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('payroll_dark_mode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('payroll_dark_mode', String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch PRs from API
  const handleFetchPRs = async (newConfig: Config) => {
    setLoading(true);
    setError(null);
    setConfig(newConfig);

    try {
      const response = await fetch('/api/github/prs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: newConfig.repository,
          startDate: newConfig.startDate,
          endDate: newConfig.endDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch PRs');
      }

      const data = await response.json();
      setPRs(data.prs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pull requests');
      console.error('Error fetching PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update PR points
  const handleUpdatePoints = async (prNumber: number, points: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber ? { ...pr, assignedPoints: points } : pr
    );
    setPRs(updatedPRs);

    // Save to database
    if (config) {
      try {
        await fetch('/api/github/save-prs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prs: updatedPRs,
            repository: config.repository,
          }),
        });
      } catch (error) {
        console.error('Failed to save PRs:', error);
      }
    }
  };

  // Toggle PR exclusion
  const handleToggleExclude = async (prNumber: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber ? { ...pr, excluded: !pr.excluded } : pr
    );
    setPRs(updatedPRs);

    // Save to database
    if (config) {
      try {
        await fetch('/api/github/save-prs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prs: updatedPRs,
            repository: config.repository,
          }),
        });
      } catch (error) {
        console.error('Failed to save PRs:', error);
      }
    }
  };

  // Calculate summary
  const summary = config
    ? calculateSummary(prs, config.ratePerPoint)
    : {
        totalPRs: 0,
        totalPoints: 0,
        totalPayout: 0,
        contributors: [],
      };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github size={32} className="text-gray-900 dark:text-white" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                GitHub Payroll Calculator
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User size={20} className="text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user?.name || session.user?.email}
                </span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-gray-700" />
                )}
              </button>

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Configuration Form */}
          <ConfigFormOAuth onSubmit={handleFetchPRs} loading={loading} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Fetching pull requests...</p>
            </div>
          )}

          {/* Summary */}
          {!loading && prs.length > 0 && config && (
            <Summary summary={summary} currency={config.currencySymbol} />
          )}

          {/* PR Table */}
          {!loading && config && (
            <PRTable
              prs={prs}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
              onUpdatePoints={handleUpdatePoints}
              onToggleExclude={handleToggleExclude}
            />
          )}

          {/* Export Buttons */}
          {!loading && prs.length > 0 && config && (
            <ExportButtons
              prs={prs}
              repository={config.repository}
              startDate={config.startDate}
              endDate={config.endDate}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Secure Production Version • Built with Next.js, TypeScript, and Tailwind CSS •{' '}
          <span className="text-green-600 dark:text-green-400 font-medium">
            OAuth 2.0 + Encrypted Storage
          </span>
        </p>
      </footer>
    </div>
  );
}
