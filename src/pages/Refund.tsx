import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Refund() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <SEO 
        title="Refund Policy"
        description="Refund Policy for EvolvXTalent resume optimization platform."
      />
      <Navigation />
      
      <main className="flex-1 container max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Refund Policy</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 2025</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Credit Purchases</h2>
            <p className="text-muted-foreground">
              Credits purchased on EvolvXTalent are generally non-refundable once they have been 
              used for resume optimization or job search services. Unused credits remain in your 
              account and do not expire.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. When Refunds May Be Issued</h2>
            <p className="text-muted-foreground">
              We may issue refunds in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
              <li>Technical errors that prevented the service from being delivered</li>
              <li>Duplicate charges due to payment processing issues</li>
              <li>Service outages that significantly impacted your ability to use purchased credits</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How to Request a Refund</h2>
            <p className="text-muted-foreground">
              To request a refund, please contact our support team at hello@evolvxtalent.com with 
              the following information:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
              <li>Your registered email address</li>
              <li>Date of purchase</li>
              <li>Reason for the refund request</li>
              <li>Any relevant screenshots or documentation</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Refund Processing Time</h2>
            <p className="text-muted-foreground">
              Approved refunds will be processed within 5-10 business days. The refund will be 
              credited to the original payment method used for the purchase.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Free Credits</h2>
            <p className="text-muted-foreground">
              Free credits provided as part of signup bonuses, referral programs, or promotional 
              offers have no cash value and are not eligible for refunds.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              For any questions regarding this Refund Policy, please contact us at:<br />
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
