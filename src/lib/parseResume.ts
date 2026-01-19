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

  // Handle PDF files - dynamic import to avoid top-level await issues
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText.trim();
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

export function getSupportedFileTypes(): string {
  return ".txt,.pdf,.docx";
}

export function getAcceptedMimeTypes(): string {
  return "text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
