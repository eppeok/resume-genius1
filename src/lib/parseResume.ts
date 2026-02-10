import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";

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

  // Handle PDF files - use server-side parsing
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await parsePDFServerSide(file);
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

async function parsePDFServerSide(file: File): Promise<string> {
  // Get current session for auth
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("You must be logged in to upload PDF files");
  }

  // Create form data with the file
  const formData = new FormData();
  formData.append("file", file);

  // Get the Supabase URL from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Configuration error: Supabase URL not available");
  }

  // Call the edge function with timeout and error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for PDF processing

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/parse-pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to parse PDF (${response.status})`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error("No text extracted from PDF");
    }

    return data.text;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("PDF parsing timed out. Please try a smaller file.");
      }
      // Check if it's a network connectivity issue
      if (error.message === 'Failed to fetch') {
        throw new Error("Unable to reach the server. This may be a temporary issue - please try again in a moment.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred while parsing the PDF");
  }
}

export function getSupportedFileTypes(): string {
  return ".txt,.docx,.pdf";
}

export function getAcceptedMimeTypes(): string {
  return "text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf";
}
