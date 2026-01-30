import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <SEO 
        title="Privacy Policy"
        description="Privacy Policy for EvolvXTalent resume optimization platform."
      />
      <Navigation />
      
      <main className="flex-1 container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 2025</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including your name, email address, 
              resume content, and job descriptions you submit for optimization. We also collect 
              information about your use of our Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our Service, 
              process your resume optimizations, communicate with you, and protect against fraud 
              and abuse.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. Your 
              resume data is encrypted and stored securely.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your account is active or as needed 
              to provide you services. You can delete your resume data at any time from your dashboard.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use AI services to process and optimize your resume. Your resume content is sent 
              to these services for processing but is not stored by them beyond the immediate 
              processing needs.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. You can 
              manage your data through your account settings or by contacting us directly.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For any questions regarding this Privacy Policy, please contact us at:<br />
              Email: hello@evolvxtalent.com<br />
              Phone: +971 581675393<br /><br />
              EvolvXTalent - a unit of Quantech IT Services FZC,<br />
              Business Center, Sharjah Publishing City Free Zone,<br />
              Sharjah, UAE
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
