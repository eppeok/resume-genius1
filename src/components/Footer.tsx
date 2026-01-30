import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="container max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-lg mb-3">EvolvXTalent</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              AI-powered resume optimization platform that helps job seekers globally 
              land more interviews with ATS-optimized resumes.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+971581675393" className="hover:text-foreground transition-colors">
                  +971 581675393
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:hello@evolvxtalent.com" className="hover:text-foreground transition-colors">
                  hello@evolvxtalent.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  EvolvXTalent - a unit of Quantech IT Services FZC,<br />
                  Business Center, Sharjah Publishing City Free Zone,<br />
                  Sharjah, UAE
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/optimize" className="hover:text-foreground transition-colors">
                  Optimize Resume
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-foreground transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/credits" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} EvolvXTalent. All rights reserved. Your data is processed securely.</p>
        </div>
      </div>
    </footer>
  );
}
