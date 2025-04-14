
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();
    
    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Clean the text
    const cleanedResume = cleanText(resumeText);
    const cleanedJobDescription = cleanText(jobDescription);

    // Step 2: Extract keywords from job description
    const jobKeywords = extractKeywords(cleanedJobDescription);

    // Step 3: Perform keyword matching
    const { matched, missing, matchScore } = performKeywordMatching(cleanedResume, jobKeywords);

    // Step 4: Apply formatting heuristics
    const { formatScore, formatStrengths, formatImprovements } = evaluateFormatting(resumeText);

    // Step 5: Calculate final score (without GPT semantic scoring for now)
    const finalScore = calculateFinalScore(matchScore, formatScore);

    // Step 6: Group keywords by category
    const groupedMatched = groupKeywordsByCategory(matched);
    const groupedMissing = groupKeywordsByCategory(missing);

    // Step 7: Generate resume strengths and improvement areas
    const strengths = generateStrengths(groupedMatched, formatStrengths);
    const improvements = generateImprovements(groupedMissing, formatImprovements);

    // Create result object
    const result = {
      score: finalScore,
      keywords: {
        found: matched,
        missing: missing
      },
      structure: {
        strengths: strengths,
        improvements: improvements
      },
      job_title: extractJobTitle(jobDescription) || "Resume Analysis"
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in resume-scan function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during resume analysis" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper Functions

function cleanText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // replace punctuation with spaces
    .replace(/\s+/g, ' ')      // normalize spacing
    .trim();
}

function extractKeywords(jobDescription) {
  // Simple keyword extraction based on common job-related terms
  // In a production environment, this would be more sophisticated
  const commonSkills = [
    "javascript", "typescript", "react", "node", "python", "java", "c++", "sql", "nosql",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "agile", "scrum", "ci/cd",
    "machine learning", "data science", "artificial intelligence", "blockchain",
    "software development", "web development", "mobile development", "devops", "sre",
    "frontend", "backend", "fullstack", "database", "rest api", "graphql", "mongodb",
    "postgresql", "mysql", "redis", "elasticsearch", "microservices", "serverless",
    "angular", "vue", "django", "flask", "spring", "dotnet", "php", "laravel", "ruby",
    "rails", "swift", "kotlin", "flutter", "react native", "figma", "sketch", "adobe",
    "ui", "ux", "product design", "user research", "wireframing", "prototyping"
  ];

  const softSkills = [
    "communication", "teamwork", "leadership", "problem solving", "critical thinking",
    "creativity", "time management", "adaptability", "flexibility", "attention to detail",
    "organization", "project management", "analytical", "decision making", "negotiation",
    "conflict resolution", "interpersonal", "presentation", "verbal communication",
    "written communication", "customer service", "collaboration", "multitasking"
  ];

  const educationTerms = [
    "bachelor", "master", "phd", "degree", "bs", "ms", "ba", "ma", "mba", "doctorate",
    "certification", "certificate", "licensed", "diploma", "graduate", "undergraduate"
  ];

  const experienceTerms = [
    "years of experience", "year experience", "years experience", "year of experience",
    "senior", "junior", "mid-level", "entry level", "lead", "manager", "director",
    "architect", "head of", "chief", "vp", "vice president", "c-level", "executive"
  ];

  const allKeywordCategories = {
    skills: commonSkills,
    soft_skills: softSkills,
    education: educationTerms,
    experience: experienceTerms
  };

  const extractedKeywords = [];

  // Extract keywords by checking if they exist in the job description
  for (const category in allKeywordCategories) {
    const categoryKeywords = allKeywordCategories[category];
    for (const keyword of categoryKeywords) {
      if (jobDescription.includes(keyword)) {
        extractedKeywords.push({
          word: keyword,
          category: category
        });
      }
    }
  }

  return extractedKeywords;
}

function performKeywordMatching(resumeText, jobKeywords) {
  const matched = [];
  const missing = [];

  for (const keywordObj of jobKeywords) {
    if (resumeText.includes(keywordObj.word)) {
      matched.push(keywordObj);
    } else {
      missing.push(keywordObj);
    }
  }

  // Calculate match score
  const matchScore = jobKeywords.length > 0 
    ? Math.round((matched.length / jobKeywords.length) * 100)
    : 0;

  return { matched, missing, matchScore };
}

function evaluateFormatting(resumeText) {
  let formatScore = 70; // Start with a baseline score
  const formatStrengths = [];
  const formatImprovements = [];

  // Check resume length (approximation)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount > 300 && wordCount < 800) {
    formatScore += 5;
    formatStrengths.push("Appropriate resume length");
  } else if (wordCount > 1000) {
    formatScore -= 5;
    formatImprovements.push("Resume may be too long");
  } else if (wordCount < 300) {
    formatScore -= 5;
    formatImprovements.push("Resume may be too short");
  }

  // Check for section headings
  const commonSections = ["experience", "education", "skills", "projects", "summary", "objective"];
  let foundSections = 0;
  
  for (const section of commonSections) {
    if (resumeText.toLowerCase().includes(section)) {
      foundSections++;
    }
  }
  
  if (foundSections >= 3) {
    formatScore += 5;
    formatStrengths.push("Well-organized with clear sections");
  } else {
    formatScore -= 5;
    formatImprovements.push("Add more clearly defined sections");
  }

  // Check for contact information
  const contactPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // phone
    /linkedin\.com\/in\/[a-z0-9-]+/i, // LinkedIn
    /github\.com\/[a-z0-9-]+/i // GitHub
  ];
  
  let contactFound = false;
  for (const pattern of contactPatterns) {
    if (pattern.test(resumeText)) {
      contactFound = true;
      break;
    }
  }
  
  if (contactFound) {
    formatScore += 5;
    formatStrengths.push("Clear contact information");
  } else {
    formatScore -= 10;
    formatImprovements.push("Add contact information");
  }

  // Cap the format score between 0 and 100
  formatScore = Math.max(0, Math.min(100, formatScore));

  return { formatScore, formatStrengths, formatImprovements };
}

function calculateFinalScore(keywordScore, formatScore) {
  // Weighted average: 70% keyword match, 30% formatting
  const weightedScore = (keywordScore * 0.7) + (formatScore * 0.3);
  return Math.round(weightedScore);
}

function groupKeywordsByCategory(keywords) {
  const grouped = {};
  
  for (const keyword of keywords) {
    if (!grouped[keyword.category]) {
      grouped[keyword.category] = [];
    }
    grouped[keyword.category].push(keyword.word);
  }
  
  return grouped;
}

function generateStrengths(groupedMatched, formatStrengths) {
  const strengths = [...formatStrengths];
  
  // Add strengths based on matched keywords
  if (groupedMatched.skills && groupedMatched.skills.length > 0) {
    strengths.push(`Strong technical skills including ${groupedMatched.skills.slice(0, 3).join(', ')}`);
  }
  
  if (groupedMatched.soft_skills && groupedMatched.soft_skills.length > 0) {
    strengths.push(`Good soft skills including ${groupedMatched.soft_skills.slice(0, 2).join(', ')}`);
  }
  
  if (groupedMatched.education && groupedMatched.education.length > 0) {
    strengths.push("Relevant educational background");
  }
  
  if (groupedMatched.experience && groupedMatched.experience.length > 0) {
    strengths.push("Matching experience level");
  }
  
  return strengths;
}

function generateImprovements(groupedMissing, formatImprovements) {
  const improvements = [...formatImprovements];
  
  // Add improvements based on missing keywords
  if (groupedMissing.skills && groupedMissing.skills.length > 0) {
    improvements.push(`Add missing skills: ${groupedMissing.skills.slice(0, 3).join(', ')}`);
  }
  
  if (groupedMissing.soft_skills && groupedMissing.soft_skills.length > 0) {
    improvements.push(`Highlight these soft skills: ${groupedMissing.soft_skills.slice(0, 2).join(', ')}`);
  }
  
  if (groupedMissing.education && groupedMissing.education.length > 0) {
    improvements.push("Emphasize relevant education credentials");
  }
  
  if (groupedMissing.experience && groupedMissing.experience.length > 0) {
    improvements.push("Better highlight your experience level");
  }
  
  return improvements;
}

function extractJobTitle(jobDescription) {
  // Simple job title extraction - in a production environment, this would be more sophisticated
  const commonTitles = [
    "software engineer", "web developer", "frontend developer", "backend developer",
    "full stack developer", "devops engineer", "data scientist", "data analyst",
    "product manager", "project manager", "ux designer", "ui designer",
    "systems administrator", "network engineer", "cloud architect", "security engineer",
    "qa engineer", "test engineer", "mobile developer", "android developer",
    "ios developer", "machine learning engineer", "research scientist", "database administrator"
  ];
  
  const lowercaseJD = jobDescription.toLowerCase();
  
  for (const title of commonTitles) {
    if (lowercaseJD.includes(title)) {
      return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
  
  return null;
}
