// src/lib/pdf.ts
/**
 * Extract raw text from a PDF buffer using pdf-parse.
 * The import is performed dynamically to stay compatible with ESM.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamically import to get the CommonJS default export
    const { default: pdfParse } = await import("pdf-parse");
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
