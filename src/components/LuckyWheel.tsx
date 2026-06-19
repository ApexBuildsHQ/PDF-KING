import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { X, Crown, Sparkles } from 'lucide-react';
import { useLuckyWheel } from '../hooks/useLuckyWheel';
import { WheelPrize } from '../config/PromotionConfig';
import { useTranslation } from 'react-i18next';

export default function LuckyWheel() {
  const { showWheel, prizes, spin, handleSpinResult, closeWheel, loaded } = useLuckyWheel();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelPrize | null>(null);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  if (!loaded || !showWheel) return null;

  const numSlices = prizes.length;
  const sliceAngle = 360 / numSlices;

  const handleSpinClick = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const winningPrize = spin();
    const winningIndex = prizes.findIndex(p => p.id === winningPrize.id);

    // Calculate rotation
    // We want the winning slice to end up at the top (0 degrees).
    // The center of slice i is at i * sliceAngle + sliceAngle / 2.
    // To bring it to top, we rotate by 360 - (center angle).
    // Add extra spins (e.g., 5 full rotations = 1800 degrees).
    const extraSpins = 5 * 360;
    const centerAngle = winningIndex * sliceAngle + sliceAngle / 2;
    const targetRotation = extraSpins + (360 - centerAngle);

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 4, ease: "circOut" }
    });

    setResult(winningPrize);
    handleSpinResult(winningPrize);
  };

  // SVG Path generator for a slice
  const getSlicePath = (index: number) => {
    const startAngle = (index * sliceAngle * Math.PI) / 180;
    const endAngle = ((index + 1) * sliceAngle * Math.PI) / 180;
    const radius = 150;
    const cx = 150;
    const cy = 150;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#111526] rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-[#d4af37]/30 flex flex-col items-center"
      >
        <button 
          onClick={closeWheel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Crown Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#f9d976] to-[#d4af37] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          <Crown className="w-8 h-8 text-[#111526]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center" dir={i18n.dir()}>{t('wheel.title')}</h2>
        <p className="text-[#d4af37] mb-8 text-center" dir={i18n.dir()}>{t('wheel.subtitle')}</p>

        {/* Wheel Container */}
        <div className="relative w-[300px] h-[300px] mb-8">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-md"></div>

          {/* Wheel */}
          <motion.div 
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)] overflow-hidden relative"
            animate={controls}
            initial={{ rotate: 0 }}
            style={{ transformOrigin: 'center' }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full transform -rotate-90">
              {prizes.map((prize, index) => {
                // Calculate text position and rotation
                const midAngle = (index * sliceAngle + sliceAngle / 2) * (Math.PI / 180);
                const textRadius = 100;
                const tx = 150 + textRadius * Math.cos(midAngle);
                const ty = 150 + textRadius * Math.sin(midAngle);
                const textRotation = (index * sliceAngle + sliceAngle / 2);

                return (
                  <g key={prize.id}>
                    <path 
                      d={getSlicePath(index)} 
                      fill={prize.color} 
                      stroke="#d4af37" 
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={prize.color === '#1a1f36' ? '#ffffff' : '#1a1f36'}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                      className="select-none"
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#111526] rounded-full border-4 border-[#d4af37] flex items-center justify-center z-20">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
            </div>
          </motion.div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpinClick}
          disabled={isSpinning}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f9d976] text-[#111526] font-bold text-lg shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? t('wheel.spinning') : t('wheel.spin_btn')}
        </button>

        {/* Result Message */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            {result.discountPercentage > 0 ? (
              <p className="text-emerald-400 font-bold text-lg">{t('wheel.win', { label: result.label })}</p>
            ) : (
              <p className="text-gray-400 font-medium">{t('wheel.lose')}</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
