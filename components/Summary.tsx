'use client';

import { useState } from 'react';
import { PayrollSummary } from '@/types';
import { Users, FileText, Target, DollarSign, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import CurrencyAmount from '@/components/CurrencyAmount';

interface SummaryProps {
  summary: PayrollSummary;
  currency: string;
  budgetRemaining: number;
  budgetRemainingAfter: number;
  filterLabel?: string;
}

export default function Summary({
  summary,
  currency,
  budgetRemaining,
  budgetRemainingAfter,
  filterLabel,
}: SummaryProps) {
  const [showContributors, setShowContributors] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h2>
        {filterLabel && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {filterLabel}
          </span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="rounded-lg p-4 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-blue-500" size={16} />
            <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">PRs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {summary.totalPRs}
          </div>
        </div>

        <div className="rounded-lg p-4 border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="text-orange-500" size={16} />
            <span className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {summary.totalTasks}
          </div>
        </div>

        <div className="rounded-lg p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-emerald-500" size={16} />
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Pts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {summary.totalPoints}
          </div>
          {summary.taskPoints > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
              {summary.prPoints} PR + {summary.taskPoints} task
            </div>
          )}
        </div>

        <div className="rounded-lg p-4 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-amber-500" size={16} />
            <span className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">Devs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {summary.contributors.length}
          </div>
        </div>

        <div className="rounded-lg p-4 border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-teal-500" size={16} />
            <span className="text-xs font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            <CurrencyAmount amount={budgetRemainingAfter} currency={currency} />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
            of <CurrencyAmount amount={budgetRemaining} currency={currency} />
          </div>
        </div>

        {/* Total Rewards — visually prominent */}
        <div className="rounded-lg p-4 border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-violet-600 dark:text-violet-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">Total Rewards</span>
          </div>
          <div className="text-2xl font-bold text-violet-900 dark:text-violet-100 font-mono tabular-nums">
            <CurrencyAmount amount={summary.totalPayout} currency={currency} />
          </div>
        </div>
      </div>

      {/* Contributors Breakdown */}
      {summary.contributors.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowContributors(!showContributors)}
            className="flex items-center justify-between w-full text-left mb-4 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Breakdown by Contributor ({summary.contributors.length})
            </h3>
            {showContributors ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showContributors && (
            <div className="space-y-2">
              {summary.contributors
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((contributor) => (
                  <div
                    key={contributor.author}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {contributor.author}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {contributor.prCount > 0 && `${contributor.prCount} PR${contributor.prCount !== 1 ? 's' : ''}`}
                        {contributor.prCount > 0 && contributor.taskCount > 0 && ' · '}
                        {contributor.taskCount > 0 && `${contributor.taskCount} task${contributor.taskCount !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                        <CurrencyAmount amount={contributor.totalPayout} currency={currency} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {contributor.totalPoints} pts
                        {contributor.taskPoints > 0 && contributor.prPoints > 0 && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {' '}({contributor.prPoints} + {contributor.taskPoints})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
