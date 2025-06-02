import { supabase } from '@/lib/supabaseClient';

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis()
};

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  }
};

// Mock subscription data
export const mockSubscription = {
  user_id: 'test-user-id',
  subscription_tier: 'free',
  scans_used: 0,
  max_scans: 5
};

// Mock resume analysis data
export const mockResumeAnalysis = {
  id: 'test-analysis-id',
  user_id: 'test-user-id',
  resume_text: 'Test resume text',
  score: 85,
  keywords_found: ['JavaScript', 'React'],
  keywords_missing: ['TypeScript', 'Node.js'],
  structure_strengths: ['Clear formatting', 'Good bullet points'],
  structure_improvements: ['Add more metrics', 'Include more details']
};

// Mock chat session data
export const mockChatSession = {
  id: 'test-session-id',
  user_id: 'test-user-id',
  session_type: 'resume',
  content: [
    {
      role: 'assistant',
      content: 'Welcome! How can I help you with your resume today?',
      timestamp: new Date().toISOString()
    }
  ]
};

// Setup test environment
export const setupTestEnv = () => {
  // Mock Supabase client
  jest.spyOn(supabase, 'auth').mockImplementation(() => mockSupabase.auth);
  jest.spyOn(supabase, 'from').mockImplementation(() => mockSupabase.from);
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  global.localStorage = localStorageMock as any;
  
  // Mock window.location
  delete window.location;
  window.location = {
    ...window.location,
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  } as any;
};

// Cleanup test environment
export const cleanupTestEnv = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
}; 