import mammoth from "mammoth";

export async function parseResumeFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Handle text files
  if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return await file.text();
  }

  // Handle DOCX files
  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  // Handle DOC files (older Word format) - limited support
  if (fileType === "application/msword" || fileName.endsWith(".doc")) {
    throw new Error("Old .doc format is not supported. Please save as .docx or .pdf");
  }

  // Handle PDF files - inform user to use text-based formats
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    throw new Error("PDF parsing is not supported in the browser. Please copy and paste your resume text directly, or save your resume as .docx or .txt format.");
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

export function getSupportedFileTypes(): string {
  return ".txt,.docx";
}

export function getAcceptedMimeTypes(): string {
  return "text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
