export interface SentimentVelocityPoint {
  day: string;
  score: number;
}

export interface SentimentDriver {
  topic: string;
  sentiment: number;
}

export interface AnalyzedPost {
  title: string;
  sentiment: number;
  reason: string;
  score: number;
  comments: number;
  url?: string;
}

export interface AnalysisResult {
  subredditName: string;
  postsAnalyzed: number;
  timeHorizon?: string; // e.g. "30 Days"
  subredditsCount: number;
  accuracy: number;
  overallSentiment: number;
  sentimentVelocity: SentimentVelocityPoint[];
  topDrivers: SentimentDriver[];
  methodology: string;
  summary: string;
  posts: AnalyzedPost[];
}

export type NavigationTab = "Dashboard" | "Analytics" | "Reports" | "Archives";

export interface ArchivedAnalysis {
  id: string;
  timestamp: string;
  subredditName: string;
  overallSentiment: number;
  postsAnalyzed: number;
  data: AnalysisResult;
}

export interface SavedReport {
  id: string;
  title: string;
  subredditName: string;
  timestamp: string;
  content: string;
}
