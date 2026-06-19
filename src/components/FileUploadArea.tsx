import React, { useRef, useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlobalGuard, PlanId } from '../utils/GlobalGuard';
import { useTranslation } from 'react-i18next';

interface FileUploadAreaProps {
  tool: any;
  onFileAccepted?: (file: File) => void;
  onFilesAccepted?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
}

export default function FileUploadArea({ tool, onFileAccepted, onFilesAccepted, accept = ".pdf", multiple = false, compact = false }: FileUploadAreaProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
      window.dispatchEvent(new CustomEvent('open-pricing'));
    }, 3000);
  };

  const processFile = (file: File) => {
    const userId = user?.id || 'anonymous';
    const planId = (user?.planId as unknown as PlanId) || 0;
    const fileSizeMB = file.size / (1024 * 1024);

    const access = GlobalGuard.checkAccess(userId, planId, tool.usageType || 'normal', fileSizeMB);

    if (!access.allowed) {
      if (access.messageKey === 'ERR_FILE_SIZE') {
        const msg = t('upload.limit_exceeded', {
          limit: access.values?.maxFileSizeMB,
          plan: access.values?.nextPlanName || 'Premium'
        });
        showToast(msg);
      } else {
        const msg = t('upload.access_denied', {
          plan: access.values?.nextPlanName || 'Premium'
        });
        showToast(msg);
      }
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && onFilesAccepted) {
      const validFiles = (Array.from(files) as File[]).filter(processFile);
      if (validFiles.length > 0) {
        onFilesAccepted(validFiles);
      }
    } else if (onFileAccepted) {
      const file = files[0];
      if (processFile(file)) {
        onFileAccepted(file);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (multiple && onFilesAccepted) {
      const validFiles = (Array.from(files) as File[]).filter(processFile);
      if (validFiles.length > 0) {
        onFilesAccepted(validFiles);
      }
    } else if (onFileAccepted) {
      const file = files[0];
      if (processFile(file)) {
        onFileAccepted(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div 
        className={`w-full h-full flex flex-col items-center justify-center hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors cursor-pointer bg-transparent ${compact ? 'p-4 min-h-[100px]' : 'p-6 md:p-10 min-h-[150px] md:min-h-[200px]'}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept={accept}
          multiple={multiple}
        />
        <div className={`${compact ? 'w-10 h-10 mb-2' : 'w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6'} bg-yellow-400 rounded-full flex items-center justify-center shadow-md`}>
          <ArrowUp className={`${compact ? 'w-5 h-5' : 'w-8 h-8 md:w-10 md:h-10'} text-red-600`} strokeWidth={3} />
        </div>
        <h3 className={`${compact ? 'text-sm' : 'text-lg md:text-2xl'} font-bold text-gray-900 dark:text-white mb-1 text-center`}>
          {t('upload.drag_drop')}
        </h3>
        {!compact && (
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 text-center">
            {t('upload.or_click')}
          </p>
        )}
      </div>

    </div>
  );
}
