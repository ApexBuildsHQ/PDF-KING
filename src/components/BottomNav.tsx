import { useTranslation } from 'react-i18next';
import { Home, Crown, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentPage: 'home' | 'pricing' | 'history' | 'tool';
  setCurrentPage: (page: 'home' | 'pricing' | 'history' | 'tool') => void;
}

export default function BottomNav({ currentPage, setCurrentPage }: BottomNavProps) {
  const { t } = useTranslation();
  const { user, setShowAuthModal, setAuthMessage } = useAuth();

  const handleHistoryClick = () => {
    if (!user) {
      setAuthMessage('auth.login_required_alert');
      setShowAuthModal(true);
      return;
    }
    setCurrentPage('history');
  };

  return (
    <nav className="w-full bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-gray-800 pb-2 pt-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-auto transition-colors duration-200">
      <div className="w-full flex justify-around items-center">
        <button 
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center gap-1 w-full transition-colors ${currentPage === 'home' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-500'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">{t('nav.home')}</span>
        </button>
        
        <button 
          onClick={() => setCurrentPage('pricing')}
          className={`relative flex flex-col items-center gap-1 w-full transition-colors ${currentPage === 'pricing' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-500'}`}
        >
          <div className="relative">
            <Crown className="w-6 h-6" />
            <div className="absolute inset-0 bg-yellow-500/20 blur-md rounded-full -z-10 scale-150"></div>
          </div>
          <span className="text-xs font-medium">{t('nav.premium')}</span>
        </button>
        
        <button 
          onClick={handleHistoryClick}
          className={`flex flex-col items-center gap-1 w-full transition-colors ${currentPage === 'history' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-500'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-medium">{t('nav.history')}</span>
        </button>
      </div>
    </nav>
  );
}
