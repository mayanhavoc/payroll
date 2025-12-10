import { PullRequest, ExportData, ContributorSummary } from '@/types';
import { format } from 'date-fns';

/**
 * Generate CSV content from pull requests
 */
export function generateCSV(prs: PullRequest[], currency: string): string {
  const headers = ['PR Number', 'Title', 'Author', 'Merged Date', 'Points', 'Payout', 'URL'];
  const rows = prs
    .filter((pr) => !pr.excluded)
    .map((pr) => {
      const payout = pr.assignedPoints * parseFloat(currency);
      return [
        pr.number,
        `"${pr.title.replace(/"/g, '""')}"`, // Escape quotes in title
        pr.author,
        format(new Date(pr.mergedAt), 'yyyy-MM-dd'),
        pr.assignedPoints,
        payout,
        pr.url,
      ].join(',');
    });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate Markdown report
 */
export function generateMarkdown(
  exportData: ExportData,
  contributors: ContributorSummary[]
): string {
  const { metadata, summary, prs } = exportData;
  const date = format(new Date(metadata.exportDate), 'MMMM yyyy');

  let md = `# Payroll Report - ${date}\n\n`;
  md += `**Repository:** ${metadata.repository}\n`;
  md += `**Period:** ${format(new Date(metadata.dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(metadata.dateRange.end), 'MMM dd, yyyy')}\n`;
  md += `**Rate:** ${metadata.ratePerPoint}${metadata.currency} per point\n\n`;

  md += `## Summary\n\n`;
  md += `- **Total PRs:** ${summary.totalPRs}\n`;
  md += `- **Total Points:** ${summary.totalPoints}\n`;
  md += `- **Total Payout:** ${summary.totalPayout.toLocaleString()}${metadata.currency}\n`;
  md += `- **Contributors:** ${contributors.length}\n\n`;

  md += `## Breakdown by Contributor\n\n`;
  md += `| Contributor | Points | Payout | PRs |\n`;
  md += `|-------------|--------|--------|-----|\n`;

  contributors
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .forEach((contributor) => {
      md += `| ${contributor.author} | ${contributor.totalPoints} | ${contributor.totalPayout.toLocaleString()}${metadata.currency} | ${contributor.prCount} |\n`;
    });

  md += `\n## Pull Requests\n\n`;
  md += `| PR | Title | Author | Date | Points | Payout |\n`;
  md += `|----|-------|--------|------|--------|--------|\n`;

  prs
    .filter((pr) => !pr.excluded)
    .forEach((pr) => {
      const payout = pr.assignedPoints * metadata.ratePerPoint;
      const mergedDate = format(new Date(pr.mergedAt), 'MMM dd');
      md += `| [#${pr.number}](${pr.url}) | ${pr.title} | ${pr.author} | ${mergedDate} | ${pr.assignedPoints} | ${payout.toLocaleString()}${metadata.currency} |\n`;
    });

  return md;
}

/**
 * Generate JSON export
 */
export function generateJSON(exportData: ExportData): string {
  return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
