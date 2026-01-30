import { vi } from "vitest";

// Mock user data
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  email_confirmed_at: "2024-01-01T00:00:00.000Z",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  aud: "authenticated",
  role: "authenticated",
};

export const mockProfile = {
  id: "test-user-id",
  email: "test@example.com",
  full_name: "Test User",
  credits: 5,
  phone: "+1-555-123-4567",
  location: "New York, NY",
  linkedin_url: "https://linkedin.com/in/testuser",
  referral_code: "TEST123",
};

export const mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user: mockUser,
};

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession, user: mockUser }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: mockSession, user: mockUser }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    resend: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
  }),
  rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
});

// Mock fetch for edge functions
export const mockEdgeFunctionFetch = (responses: Record<string, Record<string, unknown>>) => {
  return vi.fn().mockImplementation((url: string) => {
    const functionName = url.split("/functions/v1/")[1]?.split("?")[0];
    const response = responses[functionName] || { error: "Not found" };
    const hasError = "error" in response;
    const status = hasError ? 400 : 200;
    
    return Promise.resolve({
      ok: status === 200,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      body: null,
    });
  });
};
