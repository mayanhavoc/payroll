'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PullRequest } from '@/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/calculations';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';

interface PRTableProps {
  prs: PullRequest[];
  ratePerPoint: number;
  currency: string;
  onUpdatePoints: (prNumber: number, points: number) => void;
  onToggleExclude: (prNumber: number) => void;
}

export default function PRTable({
  prs,
  ratePerPoint,
  currency,
  onUpdatePoints,
  onToggleExclude,
}: PRTableProps) {
  const [editingPR, setEditingPR] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique authors for filter dropdown
  const uniqueAuthors = Array.from(new Set(prs.map((pr) => pr.author))).sort();

  // Filter PRs
  const filteredPRs = prs.filter((pr) => {
    const matchesSearch =
      searchTerm === '' ||
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.number.toString().includes(searchTerm);

    const matchesAuthor = filterAuthor === 'all' || pr.author === filterAuthor;

    return matchesSearch && matchesAuthor;
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

  const handlePointsChange = (prNumber: number, value: string) => {
    const points = parseInt(value, 10);
    if (!isNaN(points) && points >= 0 && points <= 100) {
      onUpdatePoints(prNumber, points);
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
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Authors</option>
            {uniqueAuthors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">PR</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                onClick={() => toggleSort('author')}
              >
                Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                onClick={() => toggleSort('date')}
              >
                Merged {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Detected</th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                onClick={() => toggleSort('points')}
              >
                Points {sortBy === 'points' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Payout</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Include</th>
            </tr>
          </thead>
          <tbody>
            {sortedPRs.map((pr) => (
              <tr
                key={pr.number}
                className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  pr.excluded ? 'opacity-50' : ''
                } ${editingPR === pr.number ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
              >
                <td className="py-3 px-4">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    #{pr.number}
                    <ExternalLink size={14} />
                  </a>
                </td>
                <td className="py-3 px-4 max-w-md truncate" title={pr.title}>
                  {pr.title}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {pr.authorAvatar && (
                      <Image
                        src={pr.authorAvatar}
                        alt={pr.author}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm">{pr.author}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(pr.mergedAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  {pr.detectedPoints !== null ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {pr.detectedPoints}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pr.assignedPoints}
                    onChange={(e) => handlePointsChange(pr.number, e.target.value)}
                    onFocus={() => setEditingPR(pr.number)}
                    onBlur={() => setEditingPR(null)}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </td>
                <td className="py-3 px-4 font-medium">
                  {formatCurrency(pr.assignedPoints * ratePerPoint, currency)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onToggleExclude(pr.number)}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {pr.excluded ? (
                      <Circle size={20} />
                    ) : (
                      <CheckCircle2 size={20} className="text-green-600" />
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
            key={pr.number}
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
                onClick={() => onToggleExclude(pr.number)}
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400"
              >
                {pr.excluded ? (
                  <Circle size={20} />
                ) : (
                  <CheckCircle2 size={20} className="text-green-600" />
                )}
              </button>
            </div>
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
                  value={pr.assignedPoints}
                  onChange={(e) => handlePointsChange(pr.number, e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="font-medium">
                {formatCurrency(pr.assignedPoints * ratePerPoint, currency)}
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
