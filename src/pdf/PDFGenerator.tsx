import { pdf } from "@react-pdf/renderer";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";

export type TemplateName = "classic" | "modern" | "executive";

interface GeneratePDFOptions {
  content: string;
  fullName: string;
  targetRole: string;
  template: TemplateName;
}

export async function generatePDF({ content, fullName, targetRole, template }: GeneratePDFOptions): Promise<Blob> {
  const templateComponents = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    executive: ExecutiveTemplate,
  };

  const TemplateComponent = templateComponents[template];
  
  const doc = <TemplateComponent content={content} fullName={fullName} targetRole={targetRole} />;
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
