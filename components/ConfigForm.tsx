'use client';

import { useState } from 'react';
import { Config } from '@/types';
import { validateRepository, validateToken, validateDateRange } from '@/lib/calculations';
import { saveConfig, loadConfig } from '@/lib/storage';

interface ConfigFormProps {
  onSubmit: (config: Config) => void;
  loading?: boolean;
}

const defaultConfig: Config = {
  repository: '',
  token: '',
  startDate: '',
  endDate: '',
  ratePerPoint: 25,
  currencySymbol: '₳',
};

export default function ConfigForm({ onSubmit, loading = false }: ConfigFormProps) {
  const [config, setConfig] = useState<Config>(() => {
    const saved = loadConfig();
    return saved ?? { ...defaultConfig };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Config, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Config, string>> = {};

    if (!config.repository) {
      newErrors.repository = 'Repository is required';
    } else if (!validateRepository(config.repository)) {
      newErrors.repository = 'Invalid format. Use: owner/repo';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      saveConfig(config);
      onSubmit(config);
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
        {/* Repository */}
        <div className="md:col-span-2">
          <label htmlFor="repository" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GitHub Repository *
          </label>
          <input
            type="text"
            id="repository"
            placeholder="owner/repo"
            value={config.repository}
            onChange={(e) => setConfig({ ...config, repository: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.repository ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.repository && <p className="text-red-500 text-sm mt-1">{errors.repository}</p>}
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
