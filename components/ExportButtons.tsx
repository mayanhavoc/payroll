'use client';

import { useState } from 'react';
import { PullRequest, ExportData } from '@/types';
import { calculateSummary } from '@/lib/calculations';
import { generateCSV, generateMarkdown, generateJSON, downloadFile, copyToClipboard } from '@/lib/export';
import { Download, FileText, FileJson, Copy, CheckCircle } from 'lucide-react';

interface ExportButtonsProps {
  prs: PullRequest[];
  repository: string;
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currency: string;
}

export default function ExportButtons({
  prs,
  repository,
  startDate,
  endDate,
  ratePerPoint,
  currency,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getExportData = (): ExportData => {
    const summary = calculateSummary(prs, ratePerPoint);

    return {
      metadata: {
        repository,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        ratePerPoint,
        currency,
        exportDate: new Date().toISOString(),
      },
      summary,
      prs: prs.filter((pr) => !pr.excluded),
    };
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(prs, currency);
    const filename = `payroll_${repository.replace('/', '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
  };

  const handleExportMarkdown = () => {
    const exportData = getExportData();
    const mdContent = generateMarkdown(exportData, exportData.summary.contributors);
    const filename = `payroll_${repository.replace('/', '_')}_${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(mdContent, filename, 'text/markdown');
  };

  const handleExportJSON = () => {
    const exportData = getExportData();
    const jsonContent = generateJSON(exportData);
    const filename = `payroll_${repository.replace('/', '_')}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>

        <button
          onClick={handleExportMarkdown}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          <FileText size={18} />
          Export Markdown
        </button>

        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
        >
          <FileJson size={18} />
          Export JSON
        </button>

        <button
          onClick={handleCopyMarkdown}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Summary
            </>
          )}
        </button>
      </div>
    </div>
  );
}
