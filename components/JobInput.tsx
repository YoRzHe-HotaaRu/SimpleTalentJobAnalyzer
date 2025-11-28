import React from 'react';
import { Briefcase } from 'lucide-react';

interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobInput: React.FC<JobInputProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Briefcase className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Job Description</h2>
          <p className="text-xs text-slate-500">Criteria for scoring</p>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <textarea
          className="w-full h-full p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400 leading-relaxed"
          placeholder="Paste the full job description here...
          
Example:
We are looking for a Senior React Developer with:
- 5+ years of experience
- Strong TypeScript skills
- Experience with AWS and CI/CD pipelines
- Excellent communication skills"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};