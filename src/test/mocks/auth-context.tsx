import { ReactNode, createContext, useContext } from "react";
import { mockUser, mockProfile, mockSession } from "./supabase";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  referral_code: string | null;
}

interface AuthContextType {
  user: typeof mockUser | null;
  session: typeof mockSession | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const MockAuthContext = createContext<AuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  profile?: Partial<Profile>;
  isLoading?: boolean;
}

export function MockAuthProvider({
  children,
  isAuthenticated = true,
  profile: profileOverride = {},
  isLoading = false,
}: MockAuthProviderProps) {
  const profile = isAuthenticated
    ? { ...mockProfile, ...profileOverride }
    : null;

  const value: AuthContextType = {
    user: isAuthenticated ? mockUser : null,
    session: isAuthenticated ? mockSession : null,
    profile,
    isLoading,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    refreshProfile: async () => {},
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}
