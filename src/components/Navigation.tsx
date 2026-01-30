import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LogOut, User, CreditCard, History, Sparkles, Settings, Shield, Briefcase } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container max-w-6xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="EvolvXTalent" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/optimize">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Optimize
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Jobs
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium">
                <CreditCard className="h-4 w-4" />
                <span>{profile?.credits ?? 0} credits</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.full_name || profile?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <History className="h-4 w-4 mr-2" />
                    My Resumes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/credits")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Credits
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
