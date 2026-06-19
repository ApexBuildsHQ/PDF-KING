import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ToolHeaderProps {
  tool: any;
  onBack: () => void;
}

export default function ToolHeader({ tool, onBack }: ToolHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 bg-white dark:bg-gray-900">
      <button 
        onClick={onBack}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 shadow-sm text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          {tool.icon && <tool.icon className="w-5 h-5 text-red-500" />}
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-tight">
            {t(tool.titleKey) as string}
          </h1>
        </div>
        <p className="text-sm md:text-base font-light text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
          {t(tool.titleKey.replace('.title', '.desc')) as string}
        </p>
      </div>
    </div>
  );
}
