import React from 'react';
import { ResumeFile } from '../types';
import { 
  FileText, 
  Loader2, 
  TrendingUp, 
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ResultsViewProps {
  resumes: ResumeFile[];
  onRemove: (id: string) => void;
  onViewDetails: (resume: ResumeFile) => void;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = "bg-red-50 text-red-700 border-red-200";
  if (score >= 80) colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (score >= 60) colorClass = "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${colorClass} font-bold text-sm`}>
      {score}
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ resumes, onRemove, onViewDetails }) => {
  if (resumes.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1">
        Analysis Results
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div 
            key={resume.id} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 group h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate text-sm" title={resume.result?.candidateName || resume.fileName}>
                    {resume.result?.candidateName || resume.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {resume.status === 'completed' && resume.result 
                      ? resume.result.roleMatch 
                      : "Pending Analysis"}
                  </p>
                </div>
              </div>
              
              {resume.status === 'completed' && resume.result && (
                <ScoreBadge score={resume.result.matchScore} />
              )}
            </div>

            {/* Body */}
            <div className="p-5 flex-grow flex flex-col gap-4">
              {resume.status === 'completed' && resume.result ? (
                <>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 h-[4.5em]">
                    {resume.result.reasoning}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-1.5 h-[52px] content-start overflow-hidden">
                        {resume.result.skills.filter(s => s.relevance === 'High').slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200 font-medium">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {resume.result.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Missing</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {resume.result.missingSkills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : resume.status === 'analyzing' ? (
                <div className="flex-grow flex flex-col items-center justify-center py-8 opacity-75">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <span className="text-sm text-slate-500 font-medium">Extracting insights...</span>
                </div>
              ) : resume.status === 'error' ? (
                <div className="flex-grow flex flex-col items-center justify-center py-8 text-center px-4">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-sm text-slate-800 font-medium">Analysis Failed</p>
                  <p className="text-xs text-slate-500 mt-1">{resume.error || "Please check the file and try again"}</p>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center py-12 text-slate-400 text-sm">
                   Ready to analyze
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
               {resume.status === 'completed' && (
                 <button 
                  onClick={() => onViewDetails(resume)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 text-xs font-semibold py-2.5 rounded-lg transition-all shadow-sm"
                 >
                   <Eye className="w-3.5 h-3.5" />
                   View Profile
                 </button>
               )}
               <button 
                onClick={() => onRemove(resume.id)}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                title="Remove Candidate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};