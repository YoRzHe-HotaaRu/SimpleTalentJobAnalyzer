import React from 'react';
import { ResumeFile } from '../types';
import { Users, Target, AlertTriangle, Star } from 'lucide-react';

interface StatsOverviewProps {
  resumes: ResumeFile[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ resumes }) => {
  const completedResumes = resumes.filter(r => r.status === 'completed' && r.result);
  
  if (completedResumes.length === 0) return null;

  const avgScore = Math.round(
    completedResumes.reduce((acc, curr) => acc + (curr.result?.matchScore || 0), 0) / completedResumes.length
  );

  const topCandidates = completedResumes.filter(r => (r.result?.matchScore || 0) >= 80).length;
  
  // Find most common missing skill
  const missingSkillsMap = new Map<string, number>();
  completedResumes.forEach(r => {
    r.result?.missingSkills.forEach(skill => {
      missingSkillsMap.set(skill, (missingSkillsMap.get(skill) || 0) + 1);
    });
  });
  
  let topMissingSkill = "None";
  let maxCount = 0;
  missingSkillsMap.forEach((count, skill) => {
    if (count > maxCount) {
      maxCount = count;
      topMissingSkill = skill;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
        <div className="flex items-center gap-3 text-slate-500">
          <Users className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Candidates</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{resumes.length}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
        <div className="flex items-center gap-3 text-indigo-600">
          <Target className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Avg. Score</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{avgScore}%</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
        <div className="flex items-center gap-3 text-emerald-600">
          <Star className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Top Tier</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{topCandidates}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Top Gap</span>
        </div>
        <p className="text-lg font-bold text-slate-900 truncate" title={topMissingSkill}>
          {topMissingSkill}
        </p>
      </div>
    </div>
  );
};