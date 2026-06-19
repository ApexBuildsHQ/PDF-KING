import React, { useState, useEffect } from 'react';
import { usePromoEngine } from '../hooks/usePromoEngine';
import { X, Gift, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PromoBanner() {
  const { isPromoActive, showAnnouncement, showCountdown, message, subscribersLeft, loaded } = usePromoEngine();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const { t, i18n } = useTranslation();

  // Simple countdown timer logic for visual effect
  useEffect(() => {
    if (!showCountdown) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset for demo
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  if (!loaded || !showAnnouncement || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white px-4 py-3 relative overflow-hidden" dir={i18n.dir()}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        <div className="flex items-center gap-2 text-center sm:text-left">
          {isPromoActive && <Gift className="w-5 h-5 text-yellow-300 animate-pulse" />}
          <span className="font-medium text-sm sm:text-base">{message}</span>
        </div>

        {showCountdown && isPromoActive && (
          <div className="flex items-center gap-4 bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1.5 text-sm font-semibold" dir="ltr">
              <Timer className="w-4 h-4 text-yellow-300" />
              <span className="tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            <div className="w-px h-4 bg-white/30"></div>
            <div className="text-sm font-medium">
              <span className="text-yellow-300 font-bold">{subscribersLeft}</span> {t('promo.spots_left')}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className={`absolute top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors ${i18n.dir() === 'rtl' ? 'left-4' : 'right-4'}`}
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
