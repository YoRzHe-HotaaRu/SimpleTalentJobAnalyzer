import React, { useState, useRef, useEffect } from 'react';
import { ResumeFile, ChatMessage } from '../types';
import { X, MessageSquare, FileText, Briefcase, GraduationCap, Send, Bot, User, Phone, Mail, MapPin, Linkedin } from 'lucide-react';
import { chatWithCandidate } from '../services/geminiService';

interface CandidateModalProps {
  resume: ResumeFile;
  onClose: () => void;
  onUpdateChat: (resumeId: string, history: ChatMessage[]) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ resume, onClose, onUpdateChat }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [resume.chatHistory, activeTab, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !resume.result) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...resume.chatHistory, userMsg];
    
    onUpdateChat(resume.id, newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await chatWithCandidate(resume.result, newHistory, input);
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      onUpdateChat(resume.id, [...newHistory, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I encountered an error analyzing the resume context.", timestamp: Date.now() };
      onUpdateChat(resume.id, [...newHistory, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!resume.result) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-100">
              {resume.result.candidateName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{resume.result.candidateName}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">{resume.result.roleMatch}</span>
                <span className="text-slate-300">•</span>
                <span className={`font-semibold ${resume.result.matchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {resume.result.matchScore}% Match
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'overview' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Overview
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'chat' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Assistant
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden bg-slate-50/50">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</h3>
                  <div className="space-y-3">
                    {resume.result.contact.email && (
                      <div className="flex items-start gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                        <a href={`mailto:${resume.result.contact.email}`} className="text-slate-700 hover:text-blue-600 break-all">{resume.result.contact.email}</a>
                      </div>
                    )}
                    {resume.result.contact.phone && (
                      <div className="flex items-start gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="text-slate-700">{resume.result.contact.phone}</span>
                      </div>
                    )}
                    {resume.result.contact.location && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="text-slate-700">{resume.result.contact.location}</span>
                      </div>
                    )}
                    {resume.result.contact.linkedin && (
                      <div className="flex items-start gap-3 text-sm">
                        <Linkedin className="w-4 h-4 text-blue-600 mt-0.5" />
                        <a href={resume.result.contact.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">LinkedIn</a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{resume.result.summary}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {resume.result.skills.map((skill, idx) => (
                    <div key={idx} className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors
                      ${skill.relevance === 'High' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                        skill.relevance === 'Medium' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-500'}
                    `}>
                      <span className="font-medium">{skill.name}</span>
                      {skill.yearsOfExperience && (
                        <span className="text-[10px] opacity-70 bg-black/5 px-1.5 py-0.5 rounded ml-1">{skill.yearsOfExperience}y</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {resume.result.missingSkills.length > 0 && (
                  <div className="bg-red-50/50 border border-red-100 rounded-lg p-4">
                     <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Missing Capabilities</h4>
                     <div className="flex flex-wrap gap-2">
                        {resume.result.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white text-red-600 border border-red-100 text-xs rounded-md font-medium shadow-sm">
                            {skill}
                          </span>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-6">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  Professional History
                </h3>
                <div className="space-y-8">
                  {resume.result.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-6 border-l border-slate-200 last:border-0">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white ring-1 ring-slate-100"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <h4 className="font-bold text-slate-900">{exp.role}</h4>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit mt-1 sm:mt-0">{exp.duration}</span>
                      </div>
                      <div className="text-sm text-indigo-600 font-medium mb-3">{exp.company}</div>
                      <ul className="space-y-2">
                        {exp.highlights.map((hl, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                            <span className="leading-relaxed">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full bg-slate-50">
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4" ref={scrollRef}>
                {resume.chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Bot className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-slate-800 font-semibold mb-2">Interview Assistant</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-6">
                      I have analyzed {resume.result.candidateName}'s profile. Ask me specific questions to dig deeper.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "What is their strongest technical skill?",
                        "Do they have leadership experience?",
                        "Summarize the recent project"
                      ].map(q => (
                        <button 
                          key={q}
                          onClick={() => setInput(q)} 
                          className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-2 rounded-lg transition-all shadow-sm"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {resume.chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                    `}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all text-sm pr-12"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};