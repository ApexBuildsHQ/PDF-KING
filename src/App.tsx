/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Suspense, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryScroller from './components/CategoryScroller';
import AdBanner from './components/AdBanner';
import ToolGrid from './components/ToolGrid';
import PopularEngine from './components/PopularEngine';
import OrganizeEngine from './components/OrganizeEngine';
import ConvertFromEngine from './components/ConvertFromEngine';
import ConvertToEngine from './components/ConvertToEngine';
import SecurityEngine from './components/SecurityEngine';
import EditEngine from './components/EditEngine';
import OptimizeEngine from './components/OptimizeEngine';
import ViewEngine from './components/ViewEngine';
import AIEngine from './components/AIEngine';
import BottomNav from './components/BottomNav';
import AdPush from './components/AdPush';
import Pricing from './components/Pricing';
import History from './components/History';
import PromoBanner from './components/PromoBanner';
import LuckyWheel from './components/LuckyWheel';
import UrgencyBanner from './components/UrgencyBanner';
import { useGeolocation } from './hooks/useGeolocation';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import WelcomeManager from './components/WelcomeManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const engineMap: Record<string, React.FC<any>> = {
  OrganizeEngine,
  EditEngine,
  ConvertFromEngine,
  ConvertToEngine,
  SecurityEngine,
  OptimizeEngine,
  ViewEngine,
  AIEngine,
  PopularEngine,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing' | 'history' | 'tool'>('home');
  const [activeCategory, setActiveCategory] = useState('organize');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  
  // Initialize geolocation on app load
  useGeolocation();

  useEffect(() => {
    const handleOpenPricing = () => setCurrentPage('pricing');
    window.addEventListener('open-pricing', handleOpenPricing);
    return () => window.removeEventListener('open-pricing', handleOpenPricing);
  }, []);

  const handleToolSelect = (tool: any) => {
    setSelectedTool(tool);
    setCurrentPage('tool');
  };

  const handleBackToHome = () => {
    setSelectedTool(null);
    setCurrentPage('home');
  };

  const renderEngine = () => {
    if (!selectedTool) return null;
    
    const props = { tool: selectedTool, onBack: handleBackToHome };
    const EngineComponent = engineMap[selectedTool.engineComponent] || OrganizeEngine;
    
    return <EngineComponent {...props} />;
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white text-black dark:bg-[#0f172a] dark:text-white transition-colors duration-300 flex flex-col font-sans relative pb-[140px] md:pb-[160px]">
        <UrgencyBanner />
        <PromoBanner />
        <Header />
        <AuthModal />
        <WelcomeManager />
        
        <main className="flex-grow flex flex-col items-center w-full">
          {currentPage === 'home' && (
            <>
              <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <CategoryScroller activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
              <AdBanner />
              <ToolGrid activeCategory={activeCategory} searchQuery={searchQuery} onToolSelect={handleToolSelect} />
            </>
          )}
          {currentPage === 'tool' && selectedTool && (
            <ErrorBoundary fallback={
              <div className="w-full max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-500">
                <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 md:p-12 text-center shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Oops! Tool crashed.
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                    An unexpected error occurred while loading this tool. Don't worry, the rest of the application is still working.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleBackToHome}
                      className="px-8 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all"
                    >
                      Back to Tools
                    </button>
                  </div>
                </div>
              </div>
            }>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
                  <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading tool...</p>
                </div>
              }>
                {renderEngine()}
              </Suspense>
            </ErrorBoundary>
          )}
          {currentPage === 'pricing' && <Pricing />}
          {currentPage === 'history' && <History setCurrentPage={setCurrentPage} />}
        </main>

        {/* Footer Area - Stacked using flex-col */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-col z-40 pointer-events-none">
          <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <AdPush />
        </div>

        <LuckyWheel />
      </div>
    </AuthProvider>
  );
}
