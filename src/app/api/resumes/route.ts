import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResume } from "@/lib/gemini";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are accepted." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum file size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const { key, url } = await uploadToS3(buffer, file.name);

    // Extract text from PDF
    const resumeText = await extractTextFromPdf(buffer);

    // Analyze with Gemini AI
    const analysisResult = await analyzeResume(resumeText);

    // Save to database in a transaction
    const resume = await prisma.$transaction(async (tx) => {
      const createdResume = await tx.resume.create({
        data: {
          fileName: file.name,
          fileSize: file.size,
          s3Key: key,
          s3Url: url,
          analysis: {
            create: {
              atsScore: analysisResult.atsScore,
              summary: analysisResult.summary,
              strengths: analysisResult.strengths,
              weaknesses: analysisResult.weaknesses,
              suggestions: analysisResult.suggestions,
              rawResponse: JSON.stringify(analysisResult),
            },
          },
        },
        include: { analysis: true },
      });

      return createdResume;
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Failed to process resume:", error);

    const message =
      error instanceof Error ? error.message : "Failed to process resume";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
