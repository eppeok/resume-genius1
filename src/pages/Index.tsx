import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, CheckCircle, Zap, FileText, TrendingUp, 
  Download, Shield, Target, Award, Briefcase 
} from "lucide-react";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EvolvXTalent",
  "url": "https://resume-genius1.lovable.app",
  "logo": "https://resume-genius1.lovable.app/favicon.ico",
  "description": "AI-powered resume optimization platform that helps job seekers land more interviews.",
  "sameAs": []
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "EvolvXTalent Resume Optimizer",
  "url": "https://resume-genius1.lovable.app",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Start with 3 free credits"
  },
  "description": "Transform your resume with AI-powered ATS optimization. Get higher scores, match job requirements, and land more interviews."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I upload my resume to EvolvXTalent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can paste your resume text directly or upload a PDF/DOCX file. Our system will automatically parse and analyze your content."
      }
    },
    {
      "@type": "Question",
      "name": "What should I include in the job description?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Paste the full job posting you're applying for. Our AI will analyze the requirements and optimize your resume to match the keywords and skills employers are looking for."
      }
    },
    {
      "@type": "Question",
      "name": "How does EvolvXTalent optimize my resume?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI analyzes your resume against the job description, identifies missing keywords, improves formatting for ATS systems, and provides an optimized version with before/after scoring."
      }
    },
    {
      "@type": "Question",
      "name": "What formats can I download my optimized resume in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can export your optimized resume as a PDF in three professional templates: Classic, Modern, or Executive. All templates are ATS-friendly and ready for job applications."
      }
    }
  ]
};

const combinedSchema = [organizationSchema, webApplicationSchema, faqSchema];

const features = [
  {
    icon: Target,
    title: "ATS Score Analysis",
    description: "Get detailed before/after scoring on keyword match, formatting, and readability",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Optimization",
    description: "Our AI rewrites your resume to perfectly match job descriptions",
  },
  {
    icon: Briefcase,
    title: "Global Job Search",
    description: "Find relevant jobs from LinkedIn, Indeed, Glassdoor, and regional boards worldwide",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download in 3 professional templates: Classic, Modern, or Executive",
  },
  {
    icon: Shield,
    title: "ATS-Friendly",
    description: "Optimized formatting that passes through applicant tracking systems",
  },
];

const stats = [
  { value: "85%", label: "Average Score Improvement" },
  { value: "3", label: "Professional Templates" },
  { value: "30s", label: "Average Processing Time" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <SEO 
        canonical="/"
        structuredData={combinedSchema}
      />
      <Navigation />
      
      <main className="flex-1">
      {/* Hero Section */}
      <section className="container max-w-6xl py-16 md:py-24 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Resume Optimization
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
            Land More Interviews with an{" "}
            <span className="text-gradient">ATS-Optimized</span> Resume
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our AI analyzes your resume against job descriptions, optimizes for ATS systems, 
            and helps you stand out to recruiters. See your score improve in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            ✓ 3 free optimizations • ✓ No credit card required
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container max-w-4xl px-4 pb-16">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-6xl py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">
            Everything You Need to Beat the ATS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive toolkit ensures your resume gets past automated screening 
            and into the hands of hiring managers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-gradient-card hover:shadow-elevated transition-shadow">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container max-w-4xl py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">How It Works</h2>
        </div>
        
        <div className="space-y-8">
          {[
            { step: 1, title: "Upload Your Resume", description: "Paste your resume or upload a PDF/DOCX file" },
            { step: 2, title: "Add Job Description", description: "Paste the job posting you're applying for" },
            { step: 3, title: "Get Optimized Resume", description: "Receive an ATS-optimized version with improved scores" },
            { step: 4, title: "Download & Apply", description: "Export as PDF and start applying with confidence" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-4xl py-16 px-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ready to Land Your <span className="text-gradient">Dream Job</span>?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join thousands of job seekers who have improved their resume scores 
              and increased their interview callbacks.
            </p>
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Optimizing for Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      </main>

      <Footer />
    </div>
  );
};

export default Index;
