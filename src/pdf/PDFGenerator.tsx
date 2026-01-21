import { pdf } from "@react-pdf/renderer";
import { MinimalTemplate } from "./templates/MinimalTemplate";

export type TemplateName = "minimal";

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface GeneratePDFOptions {
  content: string;
  fullName: string;
  targetRole: string;
  template: TemplateName;
  contactInfo?: ContactInfo;
}

export async function generatePDF({ content, fullName, targetRole, template, contactInfo }: GeneratePDFOptions): Promise<Blob> {
  // Single minimal template - ignore template parameter for now
  const TemplateComponent = MinimalTemplate;
  
  const doc = <TemplateComponent content={content} fullName={fullName} targetRole={targetRole} contactInfo={contactInfo} />;
  const blob = await pdf(doc).toBlob();
  
  return blob;
}

export function downloadPDF(blob: Blob, filename: string = "resume.pdf") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
