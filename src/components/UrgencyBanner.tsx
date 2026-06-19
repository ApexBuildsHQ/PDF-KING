import React, { useState, useEffect } from 'react';
import { useLuckyWheel } from '../hooks/useLuckyWheel';
import { Timer, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UrgencyBanner() {
  const { activeDiscount, loaded } = useLuckyWheel();
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ minutes: 20, seconds: 0 });

  useEffect(() => {
    if (!activeDiscount) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = activeDiscount.expiresAt - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDiscount]);

  if (!loaded || !activeDiscount) return null;

  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="bg-gradient-to-r from-[#d4af37] via-[#f9d976] to-[#d4af37] text-[#111526] px-4 py-2 relative overflow-hidden shadow-md z-50 sticky top-0" dir={i18n.dir()}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>
            {t('urgency.activated', { label: activeDiscount.prize.label, defaultValue: '{{label}} activated! Complete payment before time runs out.' })}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#111526]/10 rounded-full px-4 py-1 backdrop-blur-sm border border-[#111526]/20">
          <Timer className="w-4 h-4" />
          <span className="tabular-nums font-bold text-lg" dir="ltr">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
