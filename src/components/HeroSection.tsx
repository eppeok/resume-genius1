import { FileText, Zap, Target, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const features = [
    { icon: Target, text: "Keyword optimization for ATS" },
    { icon: Zap, text: "AI-powered rewriting" },
    { icon: CheckCircle2, text: "Job-specific tailoring" },
  ];

  return (
    <div className="text-center space-y-6 animate-slide-up">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <FileText className="h-4 w-4" />
        AI Resume Optimizer
      </div>
      
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
        Land Your Dream Job with an{" "}
        <span className="text-gradient">ATS-Optimized</span> Resume
      </h1>
      
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
        Transform your resume into a powerful, keyword-rich document that passes 
        Applicant Tracking Systems and catches recruiters' attention.
      </p>

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 text-sm font-medium"
          >
            <feature.icon className="h-4 w-4 text-primary" />
            {feature.text}
          </div>
        ))}
      </div>
    </div>
  );
}
