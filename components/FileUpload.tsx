import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(
      (file) => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = (Array.from(e.target.files) as File[]).filter(
        (file) => file.type === 'application/pdf'
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  return (
    <div 
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label 
        htmlFor="file-upload" 
        className={`
          flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
          </div>
          <p className="mb-1 text-sm text-slate-700 font-medium">
            <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">PDF Resumes (Max 10MB)</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          multiple 
          accept="application/pdf"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
};