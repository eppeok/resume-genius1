import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size (max 5MB for PDFs)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify it's a PDF
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return new Response(
        JSON.stringify({ error: "Only PDF files are supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Extract text from PDF using a simple text extraction approach
    const text = extractTextFromPDF(bytes);

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract text from PDF. The file may be scanned/image-based. Please try uploading a text-based PDF or use DOCX/TXT format." 
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ text: text.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("PDF parsing error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to parse PDF file" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Extract text from PDF bytes using basic PDF text stream parsing
 * This handles most text-based PDFs without external dependencies
 */
function extractTextFromPDF(bytes: Uint8Array): string {
  const pdfContent = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Method 1: Extract text from stream objects (BT...ET blocks)
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let streamMatch;
  
  while ((streamMatch = streamRegex.exec(pdfContent)) !== null) {
    const streamContent = streamMatch[1];
    
    // Look for text showing operators: Tj, TJ, ', "
    // Tj - show text string
    // TJ - show text array
    const tjMatches = streamContent.matchAll(/\(([^)]*)\)\s*Tj/g);
    for (const match of tjMatches) {
      const decoded = decodePDFString(match[1]);
      if (decoded) textParts.push(decoded);
    }

    // TJ operator with array of strings
    const tjArrayMatches = streamContent.matchAll(/\[([^\]]*)\]\s*TJ/g);
    for (const match of tjArrayMatches) {
      const arrayContent = match[1];
      const stringMatches = arrayContent.matchAll(/\(([^)]*)\)/g);
      for (const strMatch of stringMatches) {
        const decoded = decodePDFString(strMatch[1]);
        if (decoded) textParts.push(decoded);
      }
    }
  }

  // Method 2: Look for plain text patterns (fallback for simpler PDFs)
  if (textParts.length === 0) {
    // Try to find readable text sequences
    const readableText = pdfContent.match(/[A-Za-z][A-Za-z0-9\s.,;:!?@#$%^&*()_+\-=\[\]{}|\\'"<>\/~`]{20,}/g);
    if (readableText) {
      textParts.push(...readableText);
    }
  }

  // Clean up and join the text
  let result = textParts.join(" ");
  
  // Clean up common PDF artifacts
  result = result
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\s+/g, " ")
    .replace(/(\n\s*)+/g, "\n")
    .trim();

  return result;
}

/**
 * Decode PDF string escapes
 */
function decodePDFString(str: string): string {
  if (!str) return "";
  
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}
