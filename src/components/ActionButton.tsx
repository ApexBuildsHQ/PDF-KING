import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  tool: any;
  onClick?: () => void;
  isProcessing?: boolean;
}

export default function ActionButton({ tool, onClick, isProcessing }: ActionButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-5xl px-4 mx-auto">
      <button 
        onClick={onClick}
        disabled={isProcessing}
        className="w-full h-[60px] bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            {t('common.processing', 'Processing...')}
          </>
        ) : (
          t(tool.titleKey.replace('.title', '.action'))
        )}
      </button>
    </div>
  );
}
