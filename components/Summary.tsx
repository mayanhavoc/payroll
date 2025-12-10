'use client';

import { useState } from 'react';
import { PayrollSummary } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { Users, FileText, Target, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryProps {
  summary: PayrollSummary;
  currency: string;
}

export default function Summary({ summary, currency }: SummaryProps) {
  const [showContributors, setShowContributors] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Summary</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalPRs}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total PRs</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalPoints}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalPayout, currency)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Payout</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.contributors.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Contributors</div>
        </div>
      </div>

      {/* Contributors Breakdown */}
      {summary.contributors.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowContributors(!showContributors)}
            className="flex items-center justify-between w-full text-left mb-4 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Breakdown by Contributor ({summary.contributors.length})
            </h3>
            {showContributors ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showContributors && (
            <div className="space-y-2">
              {summary.contributors
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((contributor) => (
                  <div
                    key={contributor.author}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {contributor.author}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {contributor.prCount} PR{contributor.prCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(contributor.totalPayout, currency)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {contributor.totalPoints} points
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
