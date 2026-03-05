'use client';

import { useState } from 'react';
import { PullRequest, ManualTask, ExportData } from '@/types';
import { calculateSummary } from '@/lib/calculations';
import { generateCSV, generateMarkdown, generatePaymentPack, generateJSON, downloadFile, copyToClipboard } from '@/lib/export';
import { Download, FileText, FileJson, Copy, CheckCircle } from 'lucide-react';

interface ExportButtonsProps {
  prs: PullRequest[];
  manualTasks: ManualTask[];
  repositories: string[];
  contributors: string[];
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currency: string;
  budgetRemaining: number;
}

export default function ExportButtons({
  prs,
  manualTasks,
  repositories,
  contributors,
  startDate,
  endDate,
  ratePerPoint,
  currency,
  budgetRemaining,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getExportData = (): ExportData => {
    const summary = calculateSummary(prs, ratePerPoint, manualTasks);

    return {
      metadata: {
        repositories,
        contributors,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        ratePerPoint,
        currency,
        budgetRemaining,
        exportDate: new Date().toISOString(),
      },
      summary,
      prs: prs.filter((pr) => !pr.excluded),
      manualTasks: manualTasks.filter((t) => !t.excluded),
    };
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(prs, ratePerPoint, manualTasks);
    const repoSlug = repositories.length === 1 ? repositories[0].replace('/', '_') : 'multi_repo';
    const filename = `payroll_${repoSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
  };

  const handleExportMarkdown = () => {
    const exportData = getExportData();
    const mdContent = generateMarkdown(exportData, exportData.summary.contributors);
    const repoSlug = repositories.length === 1 ? repositories[0].replace('/', '_') : 'multi_repo';
    const filename = `payroll_${repoSlug}_${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(mdContent, filename, 'text/markdown');
  };

  const handleExportJSON = () => {
    const exportData = getExportData();
    const jsonContent = generateJSON(exportData);
    const repoSlug = repositories.length === 1 ? repositories[0].replace('/', '_') : 'multi_repo';
    const filename = `payroll_${repoSlug}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
  };

  const handleExportPaymentPack = () => {
    const exportData = getExportData();
    const packContent = generatePaymentPack(exportData);
    const filename = `payment_pack_${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(packContent, filename, 'text/markdown');
  };

  const handleCopyMarkdown = async () => {
    const exportData = getExportData();
    const mdContent = generateMarkdown(exportData, exportData.summary.contributors);

    try {
      await copyToClipboard(mdContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (prs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Download size={15} />
          CSV
        </button>

        <button
          onClick={handleExportPaymentPack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <FileText size={15} />
          Payment Pack
        </button>

        <button
          onClick={handleExportMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <FileText size={15} />
          Markdown
        </button>

        <button
          onClick={handleExportJSON}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <FileJson size={15} />
          JSON
        </button>

        <button
          onClick={handleCopyMarkdown}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle size={15} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
