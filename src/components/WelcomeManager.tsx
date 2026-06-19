import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Crown, X, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function WelcomeManager() {
  const { user, checkAuth } = useAuth();
  const { t, i18n } = useTranslation();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'first_login' | 'premium_celebration' | null;
  }>({
    isOpen: false,
    type: null,
  });

  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    if (!user) return;

    // Check for first login
    if (user.hasSeenWelcome === false) {
      setModalState({ isOpen: true, type: 'first_login' });
      return;
    }

    // Check for premium upgrade (this logic might need to be triggered by a specific event or state change in a real app, 
    // but for now we'll simulate it if they are premium and haven't seen the celebration - assuming we add a flag for that later, 
    // or we just trigger it from the component that handles the upgrade success)
    // For this implementation, we will rely on external triggers or specific state changes if needed.
    // We'll expose a global function to trigger the premium celebration for testing/integration.
    (window as any).triggerPremiumCelebration = () => {
      setModalState({ isOpen: true, type: 'premium_celebration' });
      triggerConfetti();
    };

    return () => {
      delete (window as any).triggerPremiumCelebration;
    };
  }, [user]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleClose = async () => {
    setModalState({ isOpen: false, type: null });

    if (modalState.type === 'first_login' && user) {
      try {
        const token = localStorage.getItem('authToken');
        await fetch('/api/auth/welcome-seen', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh user data to update hasSeenWelcome in context
        await checkAuth();
      } catch (error) {
        console.error('Failed to mark welcome as seen:', error);
      }
    }
  };

  if (!modalState.isOpen || !modalState.type) return null;

  const content = {
    first_login: {
      icon: <Crown className="w-16 h-16 text-amber-500 mb-4" />,
      title: t('welcome.first_login_title'),
      message: t('welcome.first_login'),
      buttonText: t('welcome.start_now'),
    },
    premium_celebration: {
      icon: <Sparkles className="w-16 h-16 text-amber-400 mb-4" />,
      title: t('welcome.premium_title'),
      message: t('welcome.premium_celebration'),
      buttonText: t('welcome.continue'),
    }
  };

  const currentContent = content[modalState.type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" dir={i18n.dir()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#111526] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={handleClose}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 flex flex-col items-center text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              {currentContent.icon}
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-4"
            >
              {currentContent.title}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 mb-8 leading-relaxed"
            >
              {currentContent.message}
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {currentContent.buttonText}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
