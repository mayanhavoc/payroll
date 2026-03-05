export interface Config {
  repositories: string[];
  contributors: string[];
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currencySymbol: string;
  budgetRemaining: number;
  token?: string;
}

export interface PullRequest {
  repository: string;
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  mergedAt: string;
  url: string;
  detectedPoints: number | null;
  assignedPoints: number;
  excluded: boolean;
}

export interface ManualTask {
  id: string;
  contributor: string;
  description: string;
  category: string;
  points: number;
  excluded: boolean;
}

export interface ContributorSummary {
  author: string;
  totalPoints: number;
  totalPayout: number;
  prCount: number;
  taskCount: number;
  prPoints: number;
  taskPoints: number;
  prs: number[];
}

export interface PayrollSummary {
  totalPRs: number;
  totalTasks: number;
  totalPoints: number;
  totalPayout: number;
  prPoints: number;
  taskPoints: number;
  contributors: ContributorSummary[];
}

export interface ExportData {
  metadata: {
    repositories: string[];
    contributors: string[];
    dateRange: {
      start: string;
      end: string;
    };
    ratePerPoint: number;
    currency: string;
    budgetRemaining: number;
    exportDate: string;
  };
  summary: PayrollSummary;
  prs: PullRequest[];
  manualTasks: ManualTask[];
}
