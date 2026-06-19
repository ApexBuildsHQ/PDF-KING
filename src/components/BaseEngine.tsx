import React, { useState } from 'react';
import { GripVertical, File as FileIcon } from 'lucide-react';
import FileUploadArea from './FileUploadArea';
import AdBanner from './AdBanner';
import ToolHeader from './ToolHeader';
import ActionButton from './ActionButton';
import { HybridTaskDispatcher, TaskType } from '../utils/TaskDispatcher';
import { useTranslation } from 'react-i18next';
import { handleDownloadClick } from '../utils/ads';

interface BaseEngineProps {
  tool: any;
  onBack: () => void;
  allowedTools?: string[];
  renderFiles?: (files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>, isProcessing: boolean, progress: number, tool: any) => React.ReactNode;
  getOptions?: (files: File[]) => any;
}

export default function BaseEngine({ tool, onBack, allowedTools, renderFiles, getOptions }: BaseEngineProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customFileName, setCustomFileName] = useState('');
  
  // Smart Activation Logic
  const isMergeTool = tool.id === 'merge';
  const hasFiles = isMergeTool ? files.length > 1 : files.length > 0;
  
  // Some tools allow multiple files
  const isMultiple = ['merge', 'organize', 'extract'].includes(tool.id) || tool.id.includes('merge');

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleFileAccepted = (acceptedFile: File) => {
    setFiles([acceptedFile]);
  };

  const toolName = t(tool.titleKey);
  const defaultFileName = `${toolName} - PDF KING`;

  const handleTaskExecution = () => {
    if (!hasFiles) return;

    const category = tool.adCategory || tool.category || 'default';
    const options = getOptions ? getOptions(files) : {};

    handleDownloadClick(category, async () => {
      setIsProcessing(true);
      setProgress(0);
      try {
        const resultBlob = await HybridTaskDispatcher.dispatch(tool.id as TaskType, {
          files,
          options, 
          onProgress: (p) => setProgress(p),
        });

        if (resultBlob) {
          const url = URL.createObjectURL(resultBlob);
          const a = document.createElement('a');
          a.href = url;
          
          // Naming System
          const finalName = customFileName.trim() !== '' 
            ? customFileName.trim() 
            : defaultFileName;
            
          const downloadName = finalName.toLowerCase().endsWith('.pdf') || finalName.toLowerCase().endsWith('.zip') 
            ? finalName 
            : `${finalName}.pdf`;

          a.download = downloadName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Task execution failed:', error);
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    });
  };

  // If we want to strictly enforce allowed tools per engine
  if (allowedTools && !allowedTools.includes(tool.id)) {
    // We can still render it, but maybe log a warning or just render normally since App.tsx handles routing.
    console.warn(`Tool ${tool.id} is not explicitly allowed in this engine.`);
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden m-0 p-0 z-50">
      <header className="flex-none bg-white dark:bg-gray-900 z-10 shadow-sm">
        <ToolHeader tool={tool} onBack={onBack} />
      </header>

      <main className="flex-1 min-h-0 w-full p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className={`w-full max-w-5xl border-2 border-red-500 rounded-2xl overflow-hidden flex flex-col relative bg-white dark:bg-[#1e293b] shadow-sm transition-all duration-300 ${isMultiple && files.length > 0 ? 'h-full' : 'h-[400px] max-h-full'}`}>
          <div className="flex-1 overflow-y-auto w-full p-4 custom-scrollbar">
            {files.length === 0 ? (
              <FileUploadArea 
                tool={tool} 
                onFilesAccepted={isMultiple ? handleFilesAccepted : undefined} 
                onFileAccepted={!isMultiple ? handleFileAccepted : undefined} 
                multiple={isMultiple} 
                accept=".pdf"
              />
            ) : renderFiles ? (
              renderFiles(files, setFiles, isProcessing, progress, tool)
            ) : (
              <div className="flex-1 h-full">
                {isProcessing ? (
                  <div className="flex-1 h-full flex flex-col items-center justify-center min-h-[200px] p-8">
                    <div className="w-full max-w-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing...</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-red-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ) : isMultiple ? (
                  <div className="flex flex-col gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-move hover:border-red-300 transition-colors">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div className="w-10 h-12 bg-white dark:bg-gray-700 rounded shadow-sm flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" dir="ltr">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                    {/* Allow adding more files if multiple */}
                    <div className="mt-4">
                       <FileUploadArea 
                        tool={tool} 
                        onFilesAccepted={(newFiles) => setFiles([...files, ...newFiles])} 
                        multiple={true} 
                        accept=".pdf"
                        compact={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 h-full flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <FileIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-xs mx-auto" dir="ltr">{files[0].name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={() => setFiles([])}
                        className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="flex-none w-full flex flex-col bg-gray-200 dark:bg-gray-800 pb-[1px]">
        {hasFiles && (
          <div className="w-full bg-white dark:bg-gray-900 flex flex-col items-center pt-3 pb-3 mb-[1px]">
            <div className="w-full max-w-5xl px-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder={`Name: ${defaultFileName}`}
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                dir="auto"
              />
              <ActionButton tool={tool} onClick={handleTaskExecution} isProcessing={isProcessing} />
            </div>
          </div>
        )}
        <div className="w-full h-[90px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
          <AdBanner />
        </div>
      </footer>
    </div>
  );
}
