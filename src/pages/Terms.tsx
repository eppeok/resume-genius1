import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <SEO 
        title="Terms of Service"
        description="Terms of Service for EvolvXTalent resume optimization platform."
      />
      <Navigation />
      
      <main className="flex-1 container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 2025</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using EvolvXTalent ("the Service"), you accept and agree to be bound by 
              the terms and provisions of this agreement. If you do not agree to these terms, please 
              do not use our Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              EvolvXTalent provides AI-powered resume optimization services to help job seekers improve 
              their resumes for Applicant Tracking Systems (ATS). Our services include resume analysis, 
              optimization, and job search features.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              To use certain features of the Service, you must register for an account. You agree to 
              provide accurate, current, and complete information during registration and to update 
              such information to keep it accurate, current, and complete.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Credits and Payments</h2>
            <p className="text-muted-foreground">
              Our Service operates on a credit-based system. Credits are required for certain features 
              such as resume optimization and job searches. Credits are non-refundable unless otherwise 
              specified in our Refund Policy.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are owned by 
              Quantech IT Services FZC and are protected by international copyright, trademark, 
              and other intellectual property laws.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall EvolvXTalent or Quantech IT Services FZC be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of 
              the Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground">
              For any questions regarding these Terms of Service, please contact us at:<br />
              Email: hello@evolvxtalent.com<br />
              Phone: +971 581675393
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
