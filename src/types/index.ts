export interface ResumeWithAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  createdAt: string;
  updatedAt: string;
  analysis: {
    id: string;
    atsScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    createdAt: string;
  } | null;
}
