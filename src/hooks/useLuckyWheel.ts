import { useState, useEffect } from 'react';
import { WHEEL_CONFIG, WheelPrize } from '../config/PromotionConfig';
import { useGeolocation } from './useGeolocation';

interface ActiveDiscount {
  prize: WheelPrize;
  expiresAt: number;
}

export function useLuckyWheel() {
  const { countryCode, loaded } = useGeolocation();
  const [showWheel, setShowWheel] = useState(false);
  const [activeDiscount, setActiveDiscount] = useState<ActiveDiscount | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const regionKey = countryCode === 'EG' ? 'EG' : 'GLOBAL';
  const prizes = regionKey === 'EG' ? WHEEL_CONFIG.localPrizes : WHEEL_CONFIG.globalPrizes;
  const isWheelEnabled = regionKey === 'EG' ? WHEEL_CONFIG.showLocalWheel : WHEEL_CONFIG.showGlobalWheel;
  const currentVersion = regionKey === 'EG' ? WHEEL_CONFIG.localWheelVersion : WHEEL_CONFIG.globalWheelVersion;

  useEffect(() => {
    if (!loaded) return;

    const spunKey = `wheel_spun_${regionKey}_v${currentVersion}`;
    const discountKey = `active_wheel_discount_${regionKey}_v${currentVersion}`;

    const hasSpunBefore = localStorage.getItem(spunKey) === 'true';
    setHasSpun(hasSpunBefore);

    // Check for active discount
    const storedDiscount = localStorage.getItem(discountKey);
    if (storedDiscount) {
      const parsed: ActiveDiscount = JSON.parse(storedDiscount);
      if (Date.now() < parsed.expiresAt) {
        setActiveDiscount(parsed);
      } else {
        localStorage.removeItem(discountKey); // Expired
      }
    }

    // Show wheel if enabled, hasn't spun, and no active discount
    if (isWheelEnabled && !hasSpunBefore && !storedDiscount) {
      // Add a small delay for better UX
      const timer = setTimeout(() => setShowWheel(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loaded, isWheelEnabled, regionKey, currentVersion]);

  const spin = (): WheelPrize => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedPrize = prizes[prizes.length - 1]; // Default to last

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    return selectedPrize;
  };

  const handleSpinResult = (prize: WheelPrize) => {
    const spunKey = `wheel_spun_${regionKey}_v${currentVersion}`;
    localStorage.setItem(spunKey, 'true');
    setHasSpun(true);

    if (prize.discountPercentage > 0) {
      const expiresAt = Date.now() + 20 * 60 * 1000; // 20 minutes
      const newDiscount: ActiveDiscount = { prize, expiresAt };
      
      const discountKey = `active_wheel_discount_${regionKey}_v${currentVersion}`;
      localStorage.setItem(discountKey, JSON.stringify(newDiscount));
      setActiveDiscount(newDiscount);
    }
    
    // Hide wheel after a delay to show result
    setTimeout(() => {
      setShowWheel(false);
    }, 3000);
  };

  const closeWheel = () => {
    setShowWheel(false);
  };

  // Check expiration periodically
  useEffect(() => {
    if (!activeDiscount) return;

    const interval = setInterval(() => {
      if (Date.now() > activeDiscount.expiresAt) {
        setActiveDiscount(null);
        const discountKey = `active_wheel_discount_${regionKey}_v${currentVersion}`;
        localStorage.removeItem(discountKey);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDiscount, regionKey, currentVersion]);

  const clearDiscount = () => {
    setActiveDiscount(null);
    const discountKey = `active_wheel_discount_${regionKey}_v${currentVersion}`;
    localStorage.removeItem(discountKey);
  };

  return {
    showWheel,
    prizes,
    activeDiscount,
    spin,
    handleSpinResult,
    closeWheel,
    clearDiscount,
    loaded
  };
}
