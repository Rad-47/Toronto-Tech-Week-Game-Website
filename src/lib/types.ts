export type CategoryId = "basketball" | "ohl-hockey" | "baseball" | "fanlinc-mix";

export type Role = "Fan" | "Investor" | "Founder" | "Athlete" | "Sponsor" | "Team Rep";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  tagline: string;
}

export interface Question {
  id: string;
  type: string;
  prompt: string;
  options: string[];
  answer: number;
  explain?: string;
}

export interface QuestionBank {
  categories: Category[];
  questions: Record<CategoryId, Question[]>;
}

export interface Signup {
  id: string;
  name: string;
  email: string;
  favorite: string;
  role: Role;
  consent: boolean;
  createdAt: number;
}

export type Badge =
  | "Rookie Fan"
  | "Superfan"
  | "GameDay Expert"
  | "Future GM"
  | "FanLinc MVP";

export interface LeaderboardEntry {
  id: string;
  name: string;
  category: CategoryId;
  categoryName: string;
  score: number;
  correct: number;
  total: number;
  badge: Badge;
  durationMs: number;
  createdAt: number;
}
