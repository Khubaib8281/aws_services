import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of hiring practices across all industries.

Analyze the following resume text and provide a detailed evaluation. Return ONLY valid JSON with the following structure — no markdown, no code fences, no extra text:

{
  "atsScore": <number from 0 to 100 representing ATS compatibility score>,
  "summary": "<a 2-3 sentence overall summary of the resume quality and candidate profile>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...]
}

Scoring criteria:
- Keyword optimization and relevance (20%)
- Formatting and ATS readability (20%)
- Work experience clarity and impact (20%)
- Skills section completeness (15%)
- Education and certifications (10%)
- Overall structure and organization (15%)

Provide at least 3 items each for strengths, weaknesses, and suggestions.

Resume text:
`;

const DEFAULT_RESULT: AnalysisResult = {
  atsScore: 0,
  summary: "Unable to analyze the resume. Please try again.",
  strengths: ["Unable to determine strengths"],
  weaknesses: ["Unable to determine weaknesses"],
  suggestions: ["Please re-upload your resume and try again"],
};

export async function analyzeResume(
  resumeText: string
): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(ANALYSIS_PROMPT + resumeText);
    const response = result.response;
    const text = response.text();

    // Strip markdown code fences if present
    const cleanedText = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Validate and return with safe defaults
    return {
      atsScore:
        typeof parsed.atsScore === "number"
          ? Math.min(100, Math.max(0, Math.round(parsed.atsScore)))
          : DEFAULT_RESULT.atsScore,
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : DEFAULT_RESULT.summary,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
        : DEFAULT_RESULT.strengths,
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses
        : DEFAULT_RESULT.weaknesses,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : DEFAULT_RESULT.suggestions,
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return DEFAULT_RESULT;
  }
}
