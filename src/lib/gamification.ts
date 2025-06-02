
import { toast } from "@/components/ui/sonner";

// Badge types for achievements
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
};

// Streak tracking for learning consistency
export type Streak = {
  current: number;
  longest: number;
  lastActive: string;
};

// Load user badges from storage
export const getUserBadges = (): Badge[] => {
  try {
    const storedBadges = localStorage.getItem('jobcoach_badges');
    return storedBadges ? JSON.parse(storedBadges) : getDefaultBadges();
  } catch (error) {
    console.error('Error loading badges:', error);
    return getDefaultBadges();
  }
};

// Save user badges to storage
export const saveUserBadges = (badges: Badge[]): void => {
  try {
    localStorage.setItem('jobcoach_badges', JSON.stringify(badges));
  } catch (error) {
    console.error('Error saving badges:', error);
  }
};

// Award a new badge to the user
export const awardBadge = (badgeId: string): void => {
  const badges = getUserBadges();
  const badgeIndex = badges.findIndex(b => b.id === badgeId);
  
  if (badgeIndex >= 0 && !badges[badgeIndex].achieved) {
    badges[badgeIndex].achieved = true;
    saveUserBadges(badges);
    
    // Show a toast notification
    toast.success(`Badge Earned: ${badges[badgeIndex].name}`, {
      description: badges[badgeIndex].description,
    });
  }
};

// Update badge progress
export const updateBadgeProgress = (badgeId: string, progress: number): void => {
  const badges = getUserBadges();
  const badgeIndex = badges.findIndex(b => b.id === badgeId);
  
  if (badgeIndex >= 0) {
    badges[badgeIndex].progress = progress;
    
    // Check if badge should be awarded
    if (
      badges[badgeIndex].maxProgress !== undefined && 
      progress >= badges[badgeIndex].maxProgress && 
      !badges[badgeIndex].achieved
    ) {
      badges[badgeIndex].achieved = true;
      
      // Show a toast notification
      toast.success(`Badge Earned: ${badges[badgeIndex].name}`, {
        description: badges[badgeIndex].description,
      });
    }
    
    saveUserBadges(badges);
  }
};

// Get user's streak data
export const getUserStreak = (): Streak => {
  try {
    const storedStreak = localStorage.getItem('jobcoach_streak');
    return storedStreak ? JSON.parse(storedStreak) : {
      current: 0,
      longest: 0,
      lastActive: ''
    };
  } catch (error) {
    console.error('Error loading streak:', error);
    return {
      current: 0,
      longest: 0,
      lastActive: ''
    };
  }
};

// Update user's activity streak
export const updateStreak = (): Streak => {
  const streak = getUserStreak();
  const today = new Date().toISOString().split('T')[0];
  
  // If already logged today, return current streak
  if (streak.lastActive === today) {
    return streak;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Check if user was active yesterday
  if (streak.lastActive === yesterdayStr) {
    // Increment streak
    streak.current += 1;
    if (streak.current > streak.longest) {
      streak.longest = streak.current;
    }
  } else {
    // Reset streak
    streak.current = 1;
  }
  
  streak.lastActive = today;
  
  try {
    localStorage.setItem('jobcoach_streak', JSON.stringify(streak));
  } catch (error) {
    console.error('Error saving streak:', error);
  }
  
  return streak;
};

// Default badges for the application
const getDefaultBadges = (): Badge[] => [
  {
    id: 'keyword_ninja',
    name: 'Keyword Ninja',
    description: 'Achieve a 90% keyword match on your resume',
    icon: 'target',
    achieved: false,
    progress: 0,
    maxProgress: 90
  },
  {
    id: 'formatting_pro',
    name: 'Formatting Pro',
    description: 'Apply all formatting suggestions to your resume',
    icon: 'layout',
    achieved: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'soft_skills_champ',
    name: 'Soft Skills Champ',
    description: 'Add 5 or more soft skills to your resume',
    icon: 'users',
    achieved: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'learning_streak',
    name: 'Learning Streak',
    description: 'Complete learning activities for 5 days in a row',
    icon: 'flame',
    achieved: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'interview_master',
    name: 'Interview Master',
    description: 'Practice and receive feedback on 10 interview questions',
    icon: 'message-square',
    achieved: false,
    progress: 0,
    maxProgress: 10
  }
];
