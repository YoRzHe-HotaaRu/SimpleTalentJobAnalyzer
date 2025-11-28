import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobInput } from './components/JobInput';
import { ResultsView } from './components/ResultsView';
import { StatsOverview } from './components/StatsOverview';
import { CandidateModal } from './components/CandidateModal';
import { ResumeFile, ChatMessage, AnalysisResult } from './types';
import { analyzeResume } from './services/geminiService';
import { Sparkles, ScanLine, Github, Library, LayoutDashboard } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 15);

// --- DEMO DATA GENERATOR ---
const generateDemoData = (): ResumeFile[] => {
  const timestamp = Date.now();
  
  const demoResult1: AnalysisResult = {
    candidateName: "Jordan Lee",
    roleMatch: "Senior Frontend Engineer",
    matchScore: 92,
    yearsOfExperience: 6,
    contact: { email: "jordan.lee@example.com", location: "San Francisco, CA", linkedin: "linkedin.com/in/jordanlee-demo" },
    summary: "Experienced Frontend Engineer specialized in React ecosystem with a strong background in performance optimization and UI/UX implementation.",
    skills: [
      { name: "React", category: "Technical", yearsOfExperience: 5, relevance: "High" },
      { name: "TypeScript", category: "Technical", yearsOfExperience: 4, relevance: "High" },
      { name: "Tailwind CSS", category: "Technical", yearsOfExperience: 3, relevance: "Medium" },
      { name: "Node.js", category: "Technical", yearsOfExperience: 2, relevance: "Medium" },
    ],
    missingSkills: ["GraphQL", "AWS"],
    education: [{ degree: "BS Computer Science", institution: "University of Tech", year: "2018" }],
    experience: [
      { role: "Senior Frontend Dev", company: "TechFlow", duration: "2021-Present", highlights: ["Led migration to Next.js", "Improved LCP by 40%"] },
      { role: "Web Developer", company: "Creative Agency", duration: "2018-2021", highlights: ["Built 15+ client sites"] }
    ],
    reasoning: "Strong match for frontend requirements. Excellent React/TS experience. Slight gap in cloud infrastructure knowledge."
  };

  const demoResult2: AnalysisResult = {
    candidateName: "Alex Chen",
    roleMatch: "Full Stack Developer",
    matchScore: 78,
    yearsOfExperience: 4,
    contact: { email: "alex.c@example.com", location: "Remote" },
    summary: "Versatile developer comfortable with both backend Python and frontend JS frameworks. Passionate about clean code.",
    skills: [
      { name: "Python", category: "Technical", yearsOfExperience: 4, relevance: "High" },
      { name: "Django", category: "Technical", yearsOfExperience: 3, relevance: "High" },
      { name: "JavaScript", category: "Technical", yearsOfExperience: 4, relevance: "Medium" },
      { name: "Docker", category: "Tool", yearsOfExperience: 2, relevance: "Medium" },
    ],
    missingSkills: ["React", "Kubernetes"],
    education: [{ degree: "Bootcamp Cert", institution: "Code Academy", year: "2019" }],
    experience: [
      { role: "Backend Eng", company: "DataCo", duration: "2020-Present", highlights: ["Optimized API latency"] }
    ],
    reasoning: "Solid backend skills but lacks the specific React depth required for the senior frontend role."
  };

  return [
    { id: generateId(), file: null, fileName: "jordan_lee_resume.pdf", status: 'completed', result: demoResult1, chatHistory: [], addedAt: timestamp },
    { id: generateId(), file: null, fileName: "alex_chen_resume.pdf", status: 'completed', result: demoResult2, chatHistory: [], addedAt: timestamp }
  ];
};

export default function App() {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeFile | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const newResumes: ResumeFile[] = files.map(file => ({
      id: generateId(),
      file,
      fileName: file.name,
      status: 'idle',
      chatHistory: [],
      addedAt: Date.now()
    }));
    setResumes(prev => [...prev, ...newResumes]);
  };

  const handleRemoveResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    if (selectedResume?.id === id) setSelectedResume(null);
  };

  const handleChatUpdate = (resumeId: string, history: ChatMessage[]) => {
    setResumes(prev => prev.map(r => r.id === resumeId ? { ...r, chatHistory: history } : r));
    if (selectedResume?.id === resumeId) {
      setSelectedResume(prev => prev ? { ...prev, chatHistory: history } : null);
    }
  };

  const loadDemoData = () => {
    setJobDescription("We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern CSS frameworks. Experience with Node.js is a plus. Must have a degree in CS or equivalent.");
    setResumes(prev => [...prev, ...generateDemoData()]);
  };

  const startAnalysis = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description first.");
      return;
    }

    setIsProcessing(true);
    const unprocessed = resumes.filter(r => r.status === 'idle' || r.status === 'error');
    
    // Optimistic Update
    setResumes(prev => prev.map(r => 
      (r.status === 'idle' || r.status === 'error') ? { ...r, status: 'analyzing', error: undefined } : r
    ));

    const processPromises = unprocessed.map(async (resume) => {
      if (!resume.file) return; // Skip demo files
      try {
        const result = await analyzeResume(resume.file, jobDescription);
        setResumes(prev => prev.map(r => 
          r.id === resume.id ? { ...r, status: 'completed', result } : r
        ));
      } catch (error: any) {
        setResumes(prev => prev.map(r => 
          r.id === resume.id ? { ...r, status: 'error', error: error.message || "Failed to analyze" } : r
        ));
      }
    });

    await Promise.all(processPromises);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              TalentScout AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadDemoData}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Library className="w-4 h-4" />
              Load Demo Data
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <a 
              href="#" 
              className="text-slate-400 hover:text-slate-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section - Only show if no resumes */}
        {resumes.length === 0 && (
          <div className="text-center max-w-2xl mx-auto mb-12 py-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Recruitment Intelligence
            </h2>
            <p className="text-slate-500 text-lg">
              Advanced ATS parsing powered by Gemini 2.5 Flash. Upload resumes to instantly score candidates against your exact requirements.
            </p>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Job Input */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <JobInput value={jobDescription} onChange={setJobDescription} />
          </div>
          
          {/* Right: Upload & Results */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Action Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-slate-400" />
                      Candidate Pipeline
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {resumes.length === 0 ? "Upload PDF resumes to begin" : `${resumes.length} candidates in pipeline`}
                    </p>
                 </div>
                 {resumes.length > 0 && (
                    <button
                      onClick={startAnalysis}
                      disabled={isProcessing || !jobDescription}
                      className={`
                        flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all w-full sm:w-auto
                        ${isProcessing || !jobDescription 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'}
                      `}
                    >
                      {isProcessing ? (
                        <>Analyzing...</>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Run Analysis
                        </>
                      )}
                    </button>
                 )}
              </div>
              
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>

            {/* Statistics */}
            <StatsOverview resumes={resumes} />
            
            {/* Results Grid */}
            <ResultsView 
              resumes={resumes} 
              onRemove={handleRemoveResume} 
              onViewDetails={setSelectedResume}
            />
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedResume && (
        <CandidateModal 
          resume={selectedResume} 
          onClose={() => setSelectedResume(null)}
          onUpdateChat={handleChatUpdate}
        />
      )}
    </div>
  );
}