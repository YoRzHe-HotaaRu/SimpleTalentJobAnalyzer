export interface Skill {
  name: string;
  category: 'Technical' | 'Soft' | 'Domain' | 'Tool';
  yearsOfExperience?: number; // Estimated
  relevance: 'High' | 'Medium' | 'Low';
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
}

export interface AnalysisResult {
  candidateName: string;
  contact: ContactInfo;
  roleMatch: string; // e.g., "Senior Frontend Developer"
  matchScore: number; // 0-100
  summary: string;
  skills: Skill[];
  missingSkills: string[];
  education: Education[];
  experience: WorkExperience[];
  reasoning: string;
  yearsOfExperience: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ResumeFile {
  id: string;
  file: File | null; // Nullable for demo data
  fileName: string;
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  result?: AnalysisResult;
  error?: string;
  chatHistory: ChatMessage[];
  addedAt: number;
}

export interface JobConfig {
  title: string;
  description: string;
  requiredSkills: string[];
}