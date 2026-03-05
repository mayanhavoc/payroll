'use client';

import { useState, useEffect } from 'react';
import { Config, PullRequest } from '@/types';
import { fetchMergedPRs } from '@/lib/github';
import { calculateSummary } from '@/lib/calculations';
import { savePRs, loadPRs, saveDarkMode, loadDarkMode } from '@/lib/storage';
import ConfigForm from '@/components/ConfigForm';
import PRTable from '@/components/PRTable';
import Summary from '@/components/Summary';
import ExportButtons from '@/components/ExportButtons';
import { Moon, Sun, Github } from 'lucide-react';

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);
  const [prs, setPRs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterRepo, setFilterRepo] = useState<string>('all');

  // Load dark mode preference and PRs on mount
  useEffect(() => {
    const isDark = loadDarkMode();
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    const savedPRs = loadPRs();
    if (savedPRs) {
      setPRs(savedPRs);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch PRs from GitHub
  const handleFetchPRs = async (newConfig: Config) => {
    setLoading(true);
    setError(null);
    setConfig(newConfig);

    try {
      const repository = newConfig.repositories[0];
      const fetchedPRs = await fetchMergedPRs({
        repository,
        token: newConfig.token || '',
        startDate: newConfig.startDate,
        endDate: newConfig.endDate,
      });

      setPRs(fetchedPRs);
      savePRs(fetchedPRs);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to fetch pull requests');
      console.error('Error fetching PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update PR points
  const handleUpdatePoints = (repository: string, prNumber: number, points: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber && pr.repository === repository
        ? { ...pr, assignedPoints: points }
        : pr
    );
    setPRs(updatedPRs);
    savePRs(updatedPRs);
  };

  // Toggle PR exclusion
  const handleToggleExclude = (repository: string, prNumber: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber && pr.repository === repository
        ? { ...pr, excluded: !pr.excluded }
        : pr
    );
    setPRs(updatedPRs);
    savePRs(updatedPRs);
  };

  // Calculate summary
  const summary = config
    ? calculateSummary(prs, config.ratePerPoint)
    : {
        totalPRs: 0,
        totalTasks: 0,
        totalPoints: 0,
        totalPayout: 0,
        prPoints: 0,
        taskPoints: 0,
        contributors: [],
      };

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Configuration Form */}
          <ConfigForm onSubmit={handleFetchPRs} loading={loading} />

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
            <Summary
              summary={summary}
              currency={config.currencySymbol}
              budgetRemaining={config.budgetRemaining}
              budgetRemainingAfter={config.budgetRemaining - summary.totalPayout}
            />
          )}

          {/* PR Table */}
          {!loading && config && (
            <PRTable
              prs={prs}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
              filterAuthor={filterAuthor}
              filterRepo={filterRepo}
              onFilterAuthorChange={setFilterAuthor}
              onFilterRepoChange={setFilterRepo}
              onUpdatePoints={handleUpdatePoints}
              onToggleExclude={handleToggleExclude}
            />
          )}

          {/* Export Buttons */}
          {!loading && prs.length > 0 && config && (
            <ExportButtons
              prs={prs}
              manualTasks={[]}
              repositories={config.repositories}
              contributors={config.contributors}
              startDate={config.startDate}
              endDate={config.endDate}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
              budgetRemaining={config.budgetRemaining}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Built with Next.js, TypeScript, and Tailwind CSS •{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
