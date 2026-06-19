import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Lock, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HistoryItem {
  id: number;
  user_id: string;
  file_name: string;
  tool_used: string;
  execution_time: string;
  cloud_link: string;
}

export default function History({ setCurrentPage }: { setCurrentPage: (page: 'home' | 'pricing' | 'history') => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/history/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setIsPremium(data.isPremium);
        setPlanId(data.planId);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Expose a global function to refetch history for live sync
  useEffect(() => {
    (window as any).refetchHistory = fetchHistory;
    return () => {
      delete (window as any).refetchHistory;
    };
  }, [user]);

  // Listen for SSE events for live sync
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`/api/events/stream?userId=${user.id}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'FILE_PROCESSED') {
          fetchHistory();
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Lock className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('history.protected_title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('auth.login_required_alert')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">
          {t('history.title')}
        </h1>
        {planId === 'king' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-full border border-amber-500/20">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">{t('history.king_account')}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-500/20 shadow-sm">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg mr-4"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-amber-500/20 rounded w-3/4"></div>
                <div className="h-3 bg-amber-500/10 rounded w-1/2"></div>
              </div>
              <div className="w-24 h-10 bg-amber-500/20 rounded-lg ml-4"></div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('welcome.empty_history')}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate mb-1" dir="ltr">
                  {item.file_name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                    {item.tool_used}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.execution_time).toLocaleString('ar-EG')}</span>
                </div>
              </div>

              <a
                href={item.cloud_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('history.download')}</span>
              </a>
            </div>
          ))}

          {planId !== 'king' && history.length >= 5 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30 text-center">
              <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('history.upgrade_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {t('history.upgrade_prompt')}
              </p>
              <button
                onClick={() => setCurrentPage('pricing')}
                className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                {t('history.upgrade_btn')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
