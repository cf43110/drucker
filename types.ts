export interface DruckerEntry {
  date: string; // e.g., "January 1"
  title: string;
  subheading: string;
  body: string;
  actionPoint: string;
  source: string;
}

export interface DailyAnalysis {
  modernRelevance: string;
  keyTakeaways: string[];
  challengeQuestion: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
