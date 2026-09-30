import { z } from "zod";

// Auth validators
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  category: z.enum(["General", "OBC-NCL", "SC", "ST", "EWS"]),
  homeState: z.string().min(1, "Home state is required"),
  gender: z.enum(["male", "female", "other"]),
});

// Predictor validator
export const predictorSchema = z.object({
  rank: z.coerce.number().int().min(1, "Rank must be a positive integer"),
  category: z.enum(["General", "OBC-NCL", "SC", "ST", "EWS"]),
  homeState: z.string().min(1, "Home state is required"),
  gender: z.enum(["Gender-Neutral", "Female-only", "male", "female"]),
});

// College query validator
export const collegeQuerySchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(["IIT", "NIT", "IIIT", "GFTI", "State", "Private"]).optional(),
  feeMax: z.coerce.number().min(1).optional(),
  nirfMax: z.coerce.number().min(1).optional(),
  placementMin: z.coerce.number().min(1).optional(),
  sortBy: z.enum(["nirfRank", "name", "avgFee", "avgPlacement"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Save college validator
export const saveCollegeSchema = z.object({
  collegeId: z.string().min(1),
  branchId: z.string().min(1),
});

// Chat validator
export const chatSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Question too long"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type PredictorInput = z.infer<typeof predictorSchema>;
export type CollegeQueryInput = z.infer<typeof collegeQuerySchema>;
export type SaveCollegeInput = z.infer<typeof saveCollegeSchema>;
export type ChatInput = z.infer<typeof chatSchema>;

// Helper to get first zod error message (Zod v4 uses .issues)
export function getZodError(error: z.ZodError): string {
  return error.issues?.[0]?.message ?? "Validation error";
}
