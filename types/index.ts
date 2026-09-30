// Shared TypeScript types for CollegeFinder AI

export type CollegeType = "IIT" | "NIT" | "IIIT" | "GFTI" | "State" | "Private";
export type Category = "General" | "OBC-NCL" | "SC" | "ST" | "EWS";
export type Quota = "HS" | "OS" | "AI";
export type Gender = "male" | "female" | "other";
export type CutoffGender = "Gender-Neutral" | "Female-only";
export type AuthProvider = "google" | "credentials";
export type UserRole = "student";
export type Probability = "Safe" | "Moderate" | "Ambitious";

export interface ICollege {
  _id: string;
  name: string;
  type: CollegeType;
  state: string;
  city: string;
  website: string;
  nirfRank: number | null;
  logoUrl?: string;
  description?: string;
  createdAt: string;
}

export interface IBranch {
  _id: string;
  collegeId: string;
  name: string;
  seatsTotal: number;
}

export interface ICutoff {
  _id: string;
  branchId: string;
  examName: string;
  year: number;
  category: string;
  quota: Quota;
  gender: CutoffGender;
  openingRank: number;
  closingRank: number;
}

export interface IFee {
  _id: string;
  collegeId: string;
  year: number;
  tuitionPerYear: number;
  hostelPerYear: number;
  otherFeesPerYear: number;
}

export interface IPlacement {
  _id: string;
  collegeId: string;
  year: number;
  avgPackageLPA: number;
  medianPackageLPA: number;
  highestPackageLPA: number;
  placementPercent: number;
}

export interface ISavedCollege {
  _id: string;
  userId: string;
  collegeId: string;
  branchId: string;
  savedAt: string;
  college?: ICollege;
  branch?: IBranch;
}

export interface IChatLog {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  contextUsed: string[];
  createdAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  authProvider: AuthProvider;
  role: UserRole;
  examPreferences?: {
    examName: string;
    category: Category;
    homeState: string;
    gender: Gender;
  };
  createdAt: string;
}

// Predictor types
export interface PredictorInput {
  rank: number;
  category: string;
  homeState: string;
  gender: string;
}

export interface PredictorResult {
  collegeId: string;
  collegeName: string;
  collegeType: CollegeType;
  branchId: string;
  branchName: string;
  closingRank: number;
  openingRank: number;
  probability: Probability;
  quota: Quota;
  nirfRank: number | null;
  state: string;
}

// College Explorer types
export interface CollegeListItem {
  _id: string;
  name: string;
  type: CollegeType;
  state: string;
  city: string;
  nirfRank: number | null;
  avgFee: number | null;
  avgPlacement: number | null;
  logoUrl?: string;
}

export interface CollegeDetail extends ICollege {
  branches: IBranch[];
  fees: IFee[];
  placements: IPlacement[];
  cutoffTrends: CutoffTrend[];
}

export interface CutoffTrend {
  branchId: string;
  branchName: string;
  data: {
    year: number;
    openingRank: number;
    closingRank: number;
    category: string;
    quota: string;
    gender: string;
  }[];
}

// Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CollegeFilters {
  search?: string;
  state?: string;
  type?: CollegeType;
  feeMax?: number;
  nirfMax?: number;
  placementMin?: number;
  sortBy?: "nirfRank" | "name" | "avgFee" | "avgPlacement";
}
