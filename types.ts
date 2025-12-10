export interface Config {
  repository: string;
  token: string;
  startDate: string;
  endDate: string;
  ratePerPoint: number;
  currencySymbol: string;
}

export interface PullRequest {
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

export interface ContributorSummary {
  author: string;
  totalPoints: number;
  totalPayout: number;
  prCount: number;
  prs: number[];
}

export interface PayrollSummary {
  totalPRs: number;
  totalPoints: number;
  totalPayout: number;
  contributors: ContributorSummary[];
}

export interface ExportData {
  metadata: {
    repository: string;
    dateRange: {
      start: string;
      end: string;
    };
    ratePerPoint: number;
    currency: string;
    exportDate: string;
  };
  summary: PayrollSummary;
  prs: PullRequest[];
}
