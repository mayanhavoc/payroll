import { PullRequest, ManualTask, ExportData, ContributorSummary } from '@/types';
import { format, parseISO } from 'date-fns';

/**
 * Generate CSV content from pull requests and manual tasks
 */
export function generateCSV(prs: PullRequest[], ratePerPoint: number, manualTasks: ManualTask[] = []): string {
  const headers = ['Type', 'Repository', 'PR/Task', 'Title', 'Author', 'Date', 'Points', 'Payout', 'URL'];
  const prRows = prs
    .filter((pr) => !pr.excluded)
    .map((pr) => {
      const payout = pr.assignedPoints * ratePerPoint;
      return [
        'PR',
        pr.repository,
        pr.number,
        `"${pr.title.replace(/"/g, '""')}"`,
        pr.author,
        format(new Date(pr.mergedAt), 'yyyy-MM-dd'),
        pr.assignedPoints,
        payout,
        pr.url,
      ].join(',');
    });

  const taskRows = manualTasks
    .filter((t) => !t.excluded)
    .map((t) => {
      const payout = t.points * ratePerPoint;
      return [
        'Task',
        t.category,
        t.id,
        `"${t.description.replace(/"/g, '""')}"`,
        t.contributor,
        '',
        t.points,
        payout,
        '',
      ].join(',');
    });

  return [headers.join(','), ...prRows, ...taskRows].join('\n');
}

/**
 * Generate Markdown report
 */
export function generateMarkdown(
  exportData: ExportData,
  contributors: ContributorSummary[]
): string {
  const { metadata, summary, prs, manualTasks } = exportData;
  const date = format(parseISO(metadata.dateRange.end), 'MMMM yyyy');
  const activeTasks = manualTasks.filter((t) => !t.excluded);

  let md = `# Payroll Report - ${date}\n\n`;
  md += `**Repositories:** ${metadata.repositories.join(', ')}\n`;
  if (metadata.contributors.length > 0) {
    md += `**Contributors:** ${metadata.contributors.join(', ')}\n`;
  }
  md += `**Period:** ${format(parseISO(metadata.dateRange.start), 'MMM dd, yyyy')} - ${format(parseISO(metadata.dateRange.end), 'MMM dd, yyyy')}\n`;
  md += `**Rate:** ${metadata.ratePerPoint}${metadata.currency} per point\n\n`;
  md += `**Budget Remaining (Start):** ${metadata.budgetRemaining.toLocaleString()}${metadata.currency}\n`;
  md += `**Budget Remaining (After):** ${(metadata.budgetRemaining - summary.totalPayout).toLocaleString()}${metadata.currency}\n\n`;

  md += `## Summary\n\n`;
  md += `- **Total PRs:** ${summary.totalPRs}\n`;
  if (summary.totalTasks > 0) {
    md += `- **Total Manual Tasks:** ${summary.totalTasks}\n`;
  }
  md += `- **Total Points:** ${summary.totalPoints}`;
  if (summary.taskPoints > 0) {
    md += ` (${summary.prPoints} PR + ${summary.taskPoints} task)`;
  }
  md += `\n`;
  md += `- **Total Rewards:** ${summary.totalPayout.toLocaleString()}${metadata.currency}\n`;
  md += `- **Contributors:** ${contributors.length}\n\n`;

  md += `## Breakdown by Contributor\n\n`;
  md += `| Contributor | PR Pts | Task Pts | Total Pts | Payout | Items |\n`;
  md += `|-------------|--------|----------|-----------|--------|-------|\n`;

  contributors
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .forEach((c) => {
      const items = [
        c.prCount > 0 ? `${c.prCount} PR${c.prCount !== 1 ? 's' : ''}` : '',
        c.taskCount > 0 ? `${c.taskCount} task${c.taskCount !== 1 ? 's' : ''}` : '',
      ].filter(Boolean).join(', ');
      md += `| ${c.author} | ${c.prPoints} | ${c.taskPoints} | ${c.totalPoints} | ${c.totalPayout.toLocaleString()}${metadata.currency} | ${items} |\n`;
    });

  md += `\n## Pull Requests\n\n`;
  md += `| Repo | PR | Title | Author | Date | Points | Payout |\n`;
  md += `|------|----|-------|--------|------|--------|--------|\n`;

  prs
    .filter((pr) => !pr.excluded)
    .forEach((pr) => {
      const payout = pr.assignedPoints * metadata.ratePerPoint;
      const mergedDate = format(new Date(pr.mergedAt), 'MMM dd');
      md += `| ${pr.repository} | [#${pr.number}](${pr.url}) | ${pr.title} | ${pr.author} | ${mergedDate} | ${pr.assignedPoints} | ${payout.toLocaleString()}${metadata.currency} |\n`;
    });

  if (activeTasks.length > 0) {
    md += `\n## Manual Tasks\n\n`;
    md += `| Category | Description | Contributor | Points | Payout |\n`;
    md += `|----------|-------------|-------------|--------|--------|\n`;

    activeTasks.forEach((t) => {
      const payout = t.points * metadata.ratePerPoint;
      md += `| ${t.category} | ${t.description} | ${t.contributor} | ${t.points} | ${payout.toLocaleString()}${metadata.currency} |\n`;
    });
  }

  return md;
}

/**
 * Generate a Payment Pack (Markdown) for CF payouts
 */
export function generatePaymentPack(exportData: ExportData): string {
  const { metadata, summary, prs, manualTasks } = exportData;
  const periodLabel = format(parseISO(metadata.dateRange.end), 'MMMM yyyy');
  const periodStart = format(parseISO(metadata.dateRange.start), 'MMM dd, yyyy');
  const periodEnd = format(parseISO(metadata.dateRange.end), 'MMM dd, yyyy');
  const budgetAfter = metadata.budgetRemaining - summary.totalPayout;

  const activePRs = prs.filter((pr) => !pr.excluded);
  const activeTasks = manualTasks.filter((t) => !t.excluded);

  const prsByContributor = new Map<string, PullRequest[]>();
  activePRs.forEach((pr) => {
    const list = prsByContributor.get(pr.author) ?? [];
    list.push(pr);
    prsByContributor.set(pr.author, list);
  });

  const tasksByContributor = new Map<string, ManualTask[]>();
  activeTasks.forEach((t) => {
    const list = tasksByContributor.get(t.contributor) ?? [];
    list.push(t);
    tasksByContributor.set(t.contributor, list);
  });

  let md = `# CF Payroll Payment Pack — ${periodLabel}\n\n`;
  md += `**Period:** ${periodStart} — ${periodEnd}\n`;
  md += `**Repositories:** ${metadata.repositories.join(', ')}\n`;
  if (metadata.contributors.length > 0) {
    md += `**Contributors:** ${metadata.contributors.join(', ')}\n`;
  }
  md += `**Rate:** ${metadata.ratePerPoint}${metadata.currency} per point\n`;
  md += `**Budget (Start):** ${metadata.budgetRemaining.toLocaleString()}${metadata.currency}\n`;
  md += `**Total Rewards:** ${summary.totalPayout.toLocaleString()}${metadata.currency}`;
  if (summary.taskPoints > 0) {
    md += ` (${summary.prPoints} PR pts + ${summary.taskPoints} task pts)`;
  }
  md += `\n`;
  md += `**Budget (After):** ${budgetAfter.toLocaleString()}${metadata.currency}\n\n`;

  md += `## Transfer Summary\n\n`;
  md += `- **Transfer from CF Treasury → Clearing:** ${summary.totalPayout.toLocaleString()}${metadata.currency}\n\n`;

  md += `## Contributor Breakdown\n\n`;
  md += `| Contributor | PR Pts | Task Pts | Total Pts | Payout | Detail |\n`;
  md += `|-------------|--------|----------|-----------|--------|--------|\n`;

  summary.contributors
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .forEach((c) => {
      const prList = (prsByContributor.get(c.author) ?? [])
        .map((pr) => `${pr.repository}#${pr.number}`)
        .join(', ');
      const taskList = (tasksByContributor.get(c.author) ?? [])
        .map((t) => `${t.category}: ${t.description}`)
        .join(', ');
      const detail = [prList, taskList].filter(Boolean).join(' · ');
      md += `| ${c.author} | ${c.prPoints} | ${c.taskPoints} | ${c.totalPoints} | ${c.totalPayout.toLocaleString()}${metadata.currency} | ${detail} |\n`;
    });

  md += `\n## PR Detail\n\n`;
  md += `| Repo | PR | Title | Author | Date | Points | Payout |\n`;
  md += `|------|----|-------|--------|------|--------|--------|\n`;

  activePRs.forEach((pr) => {
    const payout = pr.assignedPoints * metadata.ratePerPoint;
    const mergedDate = format(new Date(pr.mergedAt), 'MMM dd');
    md += `| ${pr.repository} | [#${pr.number}](${pr.url}) | ${pr.title} | ${pr.author} | ${mergedDate} | ${pr.assignedPoints} | ${payout.toLocaleString()}${metadata.currency} |\n`;
  });

  if (activeTasks.length > 0) {
    md += `\n## Manual Tasks\n\n`;
    md += `| Category | Description | Contributor | Points | Payout |\n`;
    md += `|----------|-------------|-------------|--------|--------|\n`;

    activeTasks.forEach((t) => {
      const payout = t.points * metadata.ratePerPoint;
      md += `| ${t.category} | ${t.description} | ${t.contributor} | ${t.points} | ${payout.toLocaleString()}${metadata.currency} |\n`;
    });
  }

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
