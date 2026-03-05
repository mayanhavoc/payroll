'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Config, PullRequest, ManualTask } from '@/types';
import { calculateSummary } from '@/lib/calculations';
import ConfigFormOAuth from '@/components/ConfigFormOAuth';
import PRTable from '@/components/PRTable';
import ManualTasks from '@/components/ManualTasks';
import Summary from '@/components/Summary';
import ExportButtons from '@/components/ExportButtons';
import { Moon, Sun, Github, LogOut, User } from 'lucide-react';

const TASKS_STORAGE_KEY = 'payroll_manual_tasks';

function loadManualTasks(): ManualTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveManualTasks(tasks: ManualTask[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [prs, setPRs] = useState<PullRequest[]>([]);
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Lifted filter state — shared between PRTable and Summary
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterRepo, setFilterRepo] = useState<string>('all');

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load dark mode + manual tasks
  useEffect(() => {
    const isDark = localStorage.getItem('payroll_dark_mode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    setManualTasks(loadManualTasks());
  }, []);

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
          repositories: newConfig.repositories,
          contributors: newConfig.contributors,
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to fetch pull requests');
      console.error('Error fetching PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update PR points
  const handleUpdatePoints = async (repository: string, prNumber: number, points: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber && pr.repository === repository
        ? { ...pr, assignedPoints: points }
        : pr
    );
    setPRs(updatedPRs);

    if (config) {
      try {
        await fetch('/api/github/save-prs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prs: updatedPRs }),
        });
      } catch (error) {
        console.error('Failed to save PRs:', error);
      }
    }
  };

  // Toggle PR exclusion
  const handleToggleExclude = async (repository: string, prNumber: number) => {
    const updatedPRs = prs.map((pr) =>
      pr.number === prNumber && pr.repository === repository
        ? { ...pr, excluded: !pr.excluded }
        : pr
    );
    setPRs(updatedPRs);

    if (config) {
      try {
        await fetch('/api/github/save-prs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prs: updatedPRs }),
        });
      } catch (error) {
        console.error('Failed to save PRs:', error);
      }
    }
  };

  // Manual task handlers
  const handleAddTask = (task: ManualTask) => {
    const updated = [...manualTasks, task];
    setManualTasks(updated);
    saveManualTasks(updated);
  };

  const handleRemoveTask = (id: string) => {
    const updated = manualTasks.filter((t) => t.id !== id);
    setManualTasks(updated);
    saveManualTasks(updated);
  };

  const handleUpdateTaskPoints = (id: string, points: number) => {
    const updated = manualTasks.map((t) => (t.id === id ? { ...t, points } : t));
    setManualTasks(updated);
    saveManualTasks(updated);
  };

  const handleToggleTaskExclude = (id: string) => {
    const updated = manualTasks.map((t) => (t.id === id ? { ...t, excluded: !t.excluded } : t));
    setManualTasks(updated);
    saveManualTasks(updated);
  };

  // Filtered data — respects author and repo filters
  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      const matchesAuthor = filterAuthor === 'all' || pr.author === filterAuthor;
      const matchesRepo = filterRepo === 'all' || pr.repository === filterRepo;
      return matchesAuthor && matchesRepo;
    });
  }, [prs, filterAuthor, filterRepo]);

  const filteredTasks = useMemo(() => {
    return manualTasks.filter((t) => {
      return filterAuthor === 'all' || t.contributor === filterAuthor;
    });
  }, [manualTasks, filterAuthor]);

  // Summary uses filtered data
  const summary = config
    ? calculateSummary(filteredPRs, config.ratePerPoint, filteredTasks)
    : { totalPRs: 0, totalTasks: 0, totalPoints: 0, totalPayout: 0, prPoints: 0, taskPoints: 0, contributors: [] };

  const budgetRemainingAfter = config ? config.budgetRemaining - summary.totalPayout : 0;

  const filterLabel = filterAuthor !== 'all'
    ? filterAuthor
    : filterRepo !== 'all'
      ? filterRepo.split('/')[1] ?? filterRepo
      : undefined;

  // Contributors list for manual task dropdown
  const contributorNames = config?.contributors ?? [];

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Github size={24} className="text-gray-900 dark:text-white" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                Payroll
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-gray-500" />}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <ConfigFormOAuth onSubmit={handleFetchPRs} loading={loading} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Fetching pull requests...</p>
            </div>
          )}

          {/* Summary — filter-aware */}
          {!loading && (prs.length > 0 || manualTasks.length > 0) && config && (
            <Summary
              summary={summary}
              currency={config.currencySymbol}
              budgetRemaining={config.budgetRemaining}
              budgetRemainingAfter={budgetRemainingAfter}
              filterLabel={filterLabel}
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

          {/* Manual Tasks */}
          {!loading && config && (
            <ManualTasks
              tasks={filteredTasks}
              contributors={contributorNames}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
              onAdd={handleAddTask}
              onRemove={handleRemoveTask}
              onUpdatePoints={handleUpdateTaskPoints}
              onToggleExclude={handleToggleTaskExclude}
            />
          )}

          {/* Export — uses filtered data */}
          {!loading && (prs.length > 0 || manualTasks.length > 0) && config && (
            <ExportButtons
              prs={filteredPRs}
              manualTasks={filteredTasks}
              repositories={config.repositories}
              contributors={filterAuthor !== 'all' ? [filterAuthor] : config.contributors}
              startDate={config.startDate}
              endDate={config.endDate}
              ratePerPoint={config.ratePerPoint}
              currency={config.currencySymbol}
              budgetRemaining={config.budgetRemaining}
            />
          )}
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        <p>GitHub Payroll · OAuth 2.0 · Encrypted Storage</p>
      </footer>
    </div>
  );
}
