// src/lib/pdf.ts
/**
 * Extract raw text from a PDF buffer using pdf-parse.
 * The import is performed dynamically to stay compatible with ESM.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamically import the pdf-parse module (CommonJS) and obtain the function
    const pdfParseModule = await import("pdf-parse");
    const pdfParse: any = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    if (!data?.text?.trim()) {
      throw new Error("No text content found in PDF");
    }
    return data.text.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  }
}
