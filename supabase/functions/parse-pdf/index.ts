import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  // SECURITY: Handle CORS with restricted origins
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

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

    // First try basic text extraction
    let text = extractTextFromPDF(bytes);
    const isValidText = isUsableResumeText(text);

    console.log("Basic extraction result - length:", text.length, "valid:", isValidText);

    // If no usable text found, use AI OCR as fallback
    if (!isValidText) {
      console.log("Basic extraction found unusable text, trying AI OCR...");
      
      const ocrText = await extractTextWithAI(bytes);
      
      if (ocrText && ocrText.trim().length > 0) {
        text = ocrText;
      }
    }

    if (!text || text.trim().length === 0 || !isUsableResumeText(text)) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract text from PDF. The file may be corrupted or contain only images that couldn't be processed." 
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
 * Check if extracted text is usable resume content (not just PDF metadata)
 */
function isUsableResumeText(text: string): boolean {
  if (!text || text.trim().length < 100) return false;
  
  // Check for PDF structure/metadata indicators that suggest we got garbage
  const pdfMetadataPatterns = [
    /^obj\s*<</,
    /\/Type\s*\/Catalog/,
    /\/Type\s*\/Page/,
    /\/Filter\s*\/FlateDecode/,
    /endobj\s+\d+\s+\d+\s+obj/,
    /\/FontDescriptor/,
    /\/BaseFont/,
    /\/MediaBox/,
    /stream\s+x\s+endstream/,
    /xref\s+\d+\s+\d+/,
    /%%EOF/,
  ];
  
  // If text matches too many PDF structure patterns, it's not usable content
  let metadataMatchCount = 0;
  for (const pattern of pdfMetadataPatterns) {
    if (pattern.test(text)) {
      metadataMatchCount++;
    }
  }
  
  // If more than 3 metadata patterns found, this is likely raw PDF structure
  if (metadataMatchCount > 3) {
    console.log("Text appears to be PDF metadata, not content. Matches:", metadataMatchCount);
    return false;
  }
  
  // Check for readable words - a resume should have common words
  const commonWords = ['experience', 'education', 'skills', 'work', 'email', 'phone', 
                       'summary', 'objective', 'professional', 'contact', 'address',
                       'university', 'degree', 'manager', 'engineer', 'developer',
                       'years', 'company', 'project', 'team', 'responsible'];
  
  const lowerText = text.toLowerCase();
  const wordMatches = commonWords.filter(word => lowerText.includes(word)).length;
  
  // Need at least 2 common resume words to be considered valid
  if (wordMatches < 2) {
    console.log("Text lacks common resume keywords. Found:", wordMatches);
    return false;
  }
  
  return true;
}

/**
 * Convert Uint8Array to base64 string safely (handles large files)
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Process in chunks to avoid stack overflow
  const CHUNK_SIZE = 8192;
  let result = "";
  
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(result);
}

/**
 * Extract text from PDF using AI vision model (OCR)
 */
async function extractTextWithAI(bytes: Uint8Array): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return "";
  }

  try {
    // Convert PDF bytes to base64 safely
    const base64PDF = uint8ArrayToBase64(bytes);
    
    console.log("Calling AI OCR, PDF base64 length:", base64PDF.length);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ALL text content from this PDF document. This is a resume/CV document. 
                
Please extract and return:
- All text exactly as it appears
- Maintain the general structure (sections, bullet points, etc.)
- Include all contact information, work experience, education, skills, etc.
- Do not add any commentary or explanations
- Just return the extracted text content

If the document is a scanned image or contains images with text, use OCR to extract the text from those images.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64PDF}`
                }
              }
            ]
          }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI OCR API error:", response.status, errorText);
      return "";
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "";
    
    console.log("AI OCR extracted text length:", extractedText.length);
    return extractedText;
    
  } catch (error) {
    console.error("AI OCR error:", error);
    return "";
  }
}

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
      if (decoded && decoded.trim().length > 0) textParts.push(decoded);
    }

    // TJ operator with array of strings
    const tjArrayMatches = streamContent.matchAll(/\[([^\]]*)\]\s*TJ/g);
    for (const match of tjArrayMatches) {
      const arrayContent = match[1];
      const stringMatches = arrayContent.matchAll(/\(([^)]*)\)/g);
      for (const strMatch of stringMatches) {
        const decoded = decodePDFString(strMatch[1]);
        if (decoded && decoded.trim().length > 0) textParts.push(decoded);
      }
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
