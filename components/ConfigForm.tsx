'use client';

import { useState } from 'react';
import { Config } from '@/types';
import { validateRepository, validateToken, validateDateRange } from '@/lib/calculations';
import { saveConfig, loadConfig } from '@/lib/storage';

interface ConfigFormState {
  repositories: string[];
  contributorsText: string;
  token: string;
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currencySymbol: string;
  budgetRemaining: number;
}

interface ConfigFormProps {
  onSubmit: (config: Config) => void;
  loading?: boolean;
}

const DEFAULT_REPOSITORIES = [
  'Andamio-Platform/andamio-platform',
  'Andamio-Platform/andamio-t3-app-template',
  'Andamio-Platform/andamio-db-api-go',
  'Andamio-Platform/andamio-db-api',
];

const DEFAULT_CONTRIBUTORS = ['wattsmainsanglais', 'zootechdrum'];

const defaultConfig: ConfigFormState = {
  repositories: [...DEFAULT_REPOSITORIES],
  contributorsText: DEFAULT_CONTRIBUTORS.join(', '),
  token: '',
  startDate: '',
  endDate: '',
  ratePerPoint: 43.75,
  currencySymbol: '₳',
  budgetRemaining: 5096.1875,
};

const parseList = (value: string): string[] =>
  value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function ConfigForm({ onSubmit, loading = false }: ConfigFormProps) {
  const [repoInput, setRepoInput] = useState('');
  const [config, setConfig] = useState<ConfigFormState>(() => {
    const saved = loadConfig();
    if (saved) {
      const repositories = saved.repositories?.length
        ? saved.repositories
        : DEFAULT_REPOSITORIES;
      const contributors = saved.contributors?.length ? saved.contributors : DEFAULT_CONTRIBUTORS;
      return {
        repositories,
        contributorsText: contributors.join(', '),
        token: saved.token ?? '',
        startDate: saved.startDate ?? '',
        endDate: saved.endDate ?? '',
        ratePerPoint: saved.ratePerPoint ?? defaultConfig.ratePerPoint,
        currencySymbol: saved.currencySymbol ?? defaultConfig.currencySymbol,
        budgetRemaining: saved.budgetRemaining ?? defaultConfig.budgetRemaining,
      };
    }
    return { ...defaultConfig };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConfigFormState, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ConfigFormState, string>> = {};
    const contributors = parseList(config.contributorsText);

    if (config.repositories.length === 0) {
      newErrors.repositories = 'Select at least one repository';
    } else {
      const invalidRepos = config.repositories.filter((repo) => !validateRepository(repo));
      if (invalidRepos.length > 0) {
        newErrors.repositories = `Invalid repo(s): ${invalidRepos.join(', ')}`;
      }
    }

    if (!config.token) {
      newErrors.token = 'Token is required';
    } else if (!validateToken(config.token)) {
      newErrors.token = 'Token must be at least 40 characters';
    }

    if (!config.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!config.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (config.startDate && config.endDate && !validateDateRange(config.startDate, config.endDate)) {
      newErrors.endDate = 'End date must be after start date and not in the future';
    }

    if (!config.ratePerPoint || config.ratePerPoint <= 0) {
      newErrors.ratePerPoint = 'Rate must be a positive number';
    }

    if (config.budgetRemaining < 0) {
      newErrors.budgetRemaining = 'Budget must be zero or greater';
    }

    if (contributors.length === 0) {
      newErrors.contributorsText = 'At least one contributor is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const contributors = parseList(config.contributorsText);
      const normalizedConfig: Config = {
        repositories: config.repositories,
        contributors,
        startDate: config.startDate,
        endDate: config.endDate,
        ratePerPoint: config.ratePerPoint,
        currencySymbol: config.currencySymbol,
        budgetRemaining: config.budgetRemaining,
        token: config.token,
      };
      saveConfig(normalizedConfig);
      onSubmit(normalizedConfig);
    }
  };

  const handleReset = () => {
    setConfig({ ...defaultConfig });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Repositories */}
        <div className="md:col-span-2">
          <label htmlFor="repoInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GitHub Repositories *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {config.repositories.map((repo) => (
              <span
                key={repo}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md"
              >
                {repo}
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, repositories: config.repositories.filter((r) => r !== repo) })
                  }
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-bold"
                  aria-label={`Remove ${repo}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="repoInput"
              placeholder="owner/repo"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const repo = repoInput.trim();
                  if (repo && !config.repositories.includes(repo)) {
                    setConfig({ ...config, repositories: [...config.repositories, repo] });
                    setRepoInput('');
                  }
                }
              }}
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.repositories ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                const repo = repoInput.trim();
                if (repo && !config.repositories.includes(repo)) {
                  setConfig({ ...config, repositories: [...config.repositories, repo] });
                  setRepoInput('');
                }
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          {errors.repositories && <p className="text-red-500 text-sm mt-1">{errors.repositories}</p>}
        </div>

        {/* Token */}
        <div className="md:col-span-2">
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GitHub Personal Access Token *
          </label>
          <input
            type="password"
            id="token"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.token ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.token && <p className="text-red-500 text-sm mt-1">{errors.token}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={config.endDate}
            onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>

        {/* Rate per Point */}
        <div>
          <label htmlFor="ratePerPoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rate per Point *
          </label>
          <input
            type="number"
            id="ratePerPoint"
            min="0"
            step="0.01"
            value={config.ratePerPoint}
            onChange={(e) => setConfig({ ...config, ratePerPoint: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.ratePerPoint ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.ratePerPoint && <p className="text-red-500 text-sm mt-1">{errors.ratePerPoint}</p>}
        </div>

        {/* Currency Symbol */}
        <div>
          <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency Symbol
          </label>
          <input
            type="text"
            id="currencySymbol"
            maxLength={3}
            value={config.currencySymbol}
            onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Contributors */}
        <div className="md:col-span-2">
          <label htmlFor="contributorsText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contributors (GitHub usernames) *
          </label>
          <input
            type="text"
            id="contributorsText"
            placeholder="user1, user2"
            value={config.contributorsText}
            onChange={(e) => setConfig({ ...config, contributorsText: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.contributorsText ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.contributorsText && <p className="text-red-500 text-sm mt-1">{errors.contributorsText}</p>}
        </div>

        {/* Budget Remaining */}
        <div>
          <label htmlFor="budgetRemaining" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Budget Remaining (ADA)
          </label>
          <input
            type="number"
            id="budgetRemaining"
            min="0"
            step="0.0001"
            value={config.budgetRemaining}
            onChange={(e) => setConfig({ ...config, budgetRemaining: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.budgetRemaining ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.budgetRemaining && <p className="text-red-500 text-sm mt-1">{errors.budgetRemaining}</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching...' : 'Fetch PRs'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
