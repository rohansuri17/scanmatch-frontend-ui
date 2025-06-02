# ScanMatch Frontend Documentation

## Overview
ScanMatch is a web application that helps users improve their resumes and prepare for job interviews using AI-powered analysis and coaching.

## Features
- Resume Analysis
- AI Coaching
- Learning Path Generation
- Interview Preparation
- User Authentication
- Subscription Management

## Tech Stack
- React
- TypeScript
- Supabase
- Vite
- Tailwind CSS
- Jest
- GitHub Actions

## Getting Started

### Prerequisites
- Node.js 18+
- npm 7+
- Supabase account

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/scanmatch-frontend.git
cd scanmatch-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Project Structure
```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── lib/          # Library code
├── utils/        # Utility functions
├── types/        # TypeScript types
└── App.tsx       # Main application component
```

## Testing
```bash
# Run tests
npm test

# Run type check
npm run typecheck

# Run lint
npm run lint
```

## Deployment
The application is deployed using Vercel. The deployment process is automated through GitHub Actions.

## API Documentation

### Authentication
- `signIn(email: string, password: string)`
- `signUp(email: string, password: string)`
- `signOut()`
- `getSession()`

### Resume Analysis
- `saveResumeAnalysis(analysis: ResumeAnalysis)`
- `getUserResumeAnalyses(userId: string)`
- `getResumeAnalysis(id: string)`

### AI Coaching
- `saveChatSession(session: ChatSession)`
- `getUserChatSessions(userId: string)`
- `getChatSession(id: string)`

### Learning Path
- `generateLearningPath(analysisId: string)`

### User Profile
- `getUserProfile(userId: string)`
- `updateUserProfile(userId: string, updates: Partial<UserProfile>)`

### Subscription
- `getUserSubscription(userId: string)`
- `initUserSubscription(userId: string)`
- `incrementScanCount(userId: string)`
- `canUserScan(userId: string)`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 