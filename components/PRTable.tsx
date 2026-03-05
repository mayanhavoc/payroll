'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PullRequest } from '@/types';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import CurrencyAmount from '@/components/CurrencyAmount';

interface PRTableProps {
  prs: PullRequest[];
  ratePerPoint: number;
  currency: string;
  filterAuthor: string;
  filterRepo: string;
  onFilterAuthorChange: (author: string) => void;
  onFilterRepoChange: (repo: string) => void;
  onUpdatePoints: (repository: string, prNumber: number, points: number) => void;
  onToggleExclude: (repository: string, prNumber: number) => void;
}

export default function PRTable({
  prs,
  ratePerPoint,
  currency,
  filterAuthor,
  filterRepo,
  onFilterAuthorChange,
  onFilterRepoChange,
  onUpdatePoints,
  onToggleExclude,
}: PRTableProps) {
  const [editingPR, setEditingPR] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique authors for filter dropdown
  const uniqueAuthors = Array.from(new Set(prs.map((pr) => pr.author))).sort();
  const uniqueRepos = Array.from(new Set(prs.map((pr) => pr.repository))).sort();

  // Filter PRs
  const filteredPRs = prs.filter((pr) => {
    const matchesSearch =
      searchTerm === '' ||
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.number.toString().includes(searchTerm);

    const matchesAuthor = filterAuthor === 'all' || pr.author === filterAuthor;
    const matchesRepo = filterRepo === 'all' || pr.repository === filterRepo;

    return matchesSearch && matchesAuthor && matchesRepo;
  });

  // Sort PRs
  const sortedPRs = [...filteredPRs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.mergedAt).getTime() - new Date(b.mergedAt).getTime();
        break;
      case 'points':
        comparison = a.assignedPoints - b.assignedPoints;
        break;
      case 'author':
        comparison = a.author.localeCompare(b.author);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handlePointsChange = (repository: string, prNumber: number, value: string) => {
    const points = parseFloat(value);
    if (!isNaN(points) && points >= 0 && points <= 100) {
      onUpdatePoints(repository, prNumber, points);
    }
  };

  const toggleSort = (field: 'date' | 'points' | 'author') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (prs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No pull requests fetched yet. Configure and fetch PRs to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pull Requests</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search PRs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />

          {/* Author Filter */}
          <select
            value={filterAuthor}
            onChange={(e) => onFilterAuthorChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Authors</option>
            {uniqueAuthors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          {/* Repo Filter */}
          <select
            value={filterRepo}
            onChange={(e) => onFilterRepoChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Repos</option>
            {uniqueRepos.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[5%]">PR</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[14%]">Repo</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
              <th
                className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 w-[12%]"
                onClick={() => toggleSort('author')}
              >
                Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 w-[9%]"
                onClick={() => toggleSort('date')}
              >
                Merged {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[7%]">Det.</th>
              <th
                className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 w-[8%]"
                onClick={() => toggleSort('points')}
              >
                Points {sortBy === 'points' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[9%]">Payout</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[4%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedPRs.map((pr) => (
              <tr
                key={`${pr.repository}#${pr.number}`}
                className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/50 ${
                  pr.excluded ? 'opacity-40' : ''
                } ${editingPR === `${pr.repository}#${pr.number}` ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              >
                <td className="py-2.5 px-3">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 font-mono text-sm"
                  >
                    #{pr.number}
                    <ExternalLink size={12} />
                  </a>
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate block" title={pr.repository}>
                    {pr.repository.split('/')[1]}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate block" title={pr.title}>
                    {pr.title}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {pr.authorAvatar && (
                      <Image
                        src={pr.authorAvatar}
                        alt={pr.author}
                        width={22}
                        height={22}
                        className="w-5.5 h-5.5 rounded-full object-cover shrink-0"
                      />
                    )}
                    <span className="text-sm truncate">{pr.author}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {format(new Date(pr.mergedAt), 'MMM dd')}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {pr.detectedPoints !== null ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-mono">
                      {pr.detectedPoints}
                    </span>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={pr.assignedPoints}
                    onChange={(e) => handlePointsChange(pr.repository, pr.number, e.target.value)}
                    onFocus={() => setEditingPR(`${pr.repository}#${pr.number}`)}
                    onBlur={() => setEditingPR(null)}
                    className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center tabular-nums font-mono text-sm"
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-sm font-medium tabular-nums">
                  <CurrencyAmount amount={pr.assignedPoints * ratePerPoint} currency={currency} />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => onToggleExclude(pr.repository, pr.number)}
                    className="transition-colors"
                  >
                    {pr.excluded ? (
                      <Circle size={18} className="text-gray-300 dark:text-gray-600 hover:text-gray-500" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-500 hover:text-emerald-600" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sortedPRs.map((pr) => (
          <div
            key={`${pr.repository}#${pr.number}`}
            className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
              pr.excluded ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                #{pr.number}
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => onToggleExclude(pr.repository, pr.number)}
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400"
              >
                {pr.excluded ? (
                  <Circle size={20} />
                ) : (
                  <CheckCircle2 size={20} className="text-green-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{pr.repository}</p>
            <p className="text-sm font-medium mb-2">{pr.title}</p>
            <div className="flex items-center gap-2 mb-2">
              {pr.authorAvatar && (
                <Image
                  src={pr.authorAvatar}
                  alt={pr.author}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">{pr.author}</span>
              <span className="text-xs text-gray-500">
                • {format(new Date(pr.mergedAt), 'MMM dd')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Points:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={pr.assignedPoints}
                  onChange={(e) => handlePointsChange(pr.repository, pr.number, e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center tabular-nums"
                />
              </div>
              <div className="font-medium">
                <CurrencyAmount amount={pr.assignedPoints * ratePerPoint} currency={currency} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedPRs.length} of {prs.length} PRs
      </div>
    </div>
  );
}
