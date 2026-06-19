import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Tag, ArrowRight, Zap, Crown, Shield, PartyPopper } from 'lucide-react';
import { PLANS, PlanId, LEMON_SQUEEZY_LINKS } from '../utils/GlobalGuard';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePromoEngine } from '../hooks/usePromoEngine';
import { useLuckyWheel } from '../hooks/useLuckyWheel';
import { WHEEL_CONFIG } from '../config/PromotionConfig';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

// Manual Pricing Map (Fixed prices, no exchange rate dependency)
const PRICING_MAP = {
  USD: {
    symbol: '$',
    plans: {
      1: { price: 10, period: 'mo', originalPrice: null },
      2: { price: 100, period: 'yr', originalPrice: 120 },
      3: { price: 15, period: 'mo', originalPrice: null },
      4: { price: 150, period: 'yr', originalPrice: 180 },
      5: { price: 20, period: 'mo', originalPrice: null },
      6: { price: 200, period: 'yr', originalPrice: 240 },
      7: { price: 35, period: 'mo', originalPrice: null },
      8: { price: 350, period: 'yr', originalPrice: 420 },
    }
  },
  EGP: {
    symbol: 'EGP',
    plans: {
      1: { price: 100, period: 'mo', originalPrice: null }, // Default monthly
      2: { price: 1000, period: 'yr', originalPrice: 1200 },
      3: { price: 150, period: 'mo', originalPrice: null }, // Default monthly
      4: { price: 1500, period: 'yr', originalPrice: 1800 },
      5: { price: 200, period: 'mo', originalPrice: null }, // Default monthly
      6: { price: 2000, period: 'yr', originalPrice: 2400 },
      7: { price: 350, period: 'mo', originalPrice: null }, // Default monthly
      8: { price: 3500, period: 'yr', originalPrice: 4200 },
    }
  }
};

export default function Pricing() {
  const { t } = useTranslation();
  const [isYearly, setIsYearly] = useState(true);
  const { countryCode, currency: geoCurrency, loaded } = useGeolocation();
  const { isPromoActive, discountCode: promoDiscountCode } = usePromoEngine();
  const { activeDiscount, clearDiscount } = useLuckyWheel();
  const { user, setShowAuthModal, setAuthMessage } = useAuth();
  const [currency, setCurrency] = useState<'USD' | 'EGP'>('USD');
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subscribedPlanId, setSubscribedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) {
      setCurrency(geoCurrency);
    }
  }, [geoCurrency, loaded]);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'guest_user';
    const eventSource = new EventSource(`/api/events/stream?userId=${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PAYMENT_SUCCESS') {
          // 1. Stop countdown and burn coupon locally
          clearDiscount();
          
          // 2. Show success modal
          setSubscribedPlanId(data.planId);
          setShowSuccessModal(true);
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [clearDiscount]);

  const handleSubscriptionFlow = (planId: number) => {
    if (!user) {
      setAuthMessage('auth.login_required_alert');
      setShowAuthModal(true);
      return;
    }
    handleSubscribe(planId);
  };

  const handleSubscribe = (planId: number) => {
    // Mock user ID for now, replace with actual user ID from auth context
    const userId = user?.id || 'guest_user';

    // Determine which discount code to use
    let finalDiscountCode = '';
    let wheelVersion = '';
    if (activeDiscount) {
      finalDiscountCode = `${activeDiscount.prize.secretKey}${activeDiscount.prize.yearKey}`;
      wheelVersion = countryCode === 'EG' ? String(WHEEL_CONFIG.localWheelVersion) : String(WHEEL_CONFIG.globalWheelVersion);
    } else if (isPromoActive && promoDiscountCode) {
      finalDiscountCode = promoDiscountCode;
    }

    if (countryCode === 'EG') {
      // Fawaterk API Logic
      console.log(`Initiating Fawaterk payment for plan ${planId}`);
      alert(`Fawaterk payment system activated for plan ID: ${planId}\nDiscount Code: ${finalDiscountCode || 'None'}\nWheel Version: ${wheelVersion}`);
    } else {
      // Lemon Squeezy Logic
      const checkoutUrl = LEMON_SQUEEZY_LINKS[`ID_${planId}`];
      if (checkoutUrl && checkoutUrl !== 'LINK_HERE') {
        // Append user ID as custom_data to the URL
        const url = new URL(checkoutUrl);
        url.searchParams.append('checkout[custom][user_id]', userId);
        
        // Append discount code if active
        if (finalDiscountCode) {
          url.searchParams.append('checkout[discount_code]', finalDiscountCode);
          if (wheelVersion) {
            url.searchParams.append('checkout[custom][coupon_code]', finalDiscountCode);
            url.searchParams.append('checkout[custom][wheel_version]', wheelVersion);
          }
        }
        
        window.location.href = url.toString();
      } else {
        console.log(`Lemon Squeezy URL not configured for plan ID_${planId}`);
        alert(`Lemon Squeezy checkout for plan ID: ${planId}\nDiscount Code: ${finalDiscountCode || 'None'}`);
      }
    }
  };

  const handleApplyCoupon = () => {
    if (!user) {
      setAuthMessage('auth.login_required_alert');
      setShowAuthModal(true);
      return;
    }
    if (!coupon.trim()) {
      setCouponError(t('pricing.enterCode'));
    } else {
      setCouponError(t('pricing.invalidCode'));
    }
  };

  const basePlans = [
    { name: 'FREE', monthlyId: 0, yearlyId: 0, descKey: 'pricing.desc_free' },
    { name: 'PRO', monthlyId: 1, yearlyId: 2, descKey: 'pricing.desc_pro' },
    { name: 'KING', monthlyId: 3, yearlyId: 4, descKey: 'pricing.desc_king' },
    { name: 'ULTRA', monthlyId: 5, yearlyId: 6, descKey: 'pricing.desc_ultra' },
    { name: 'COMPANY', monthlyId: 7, yearlyId: 8, descKey: 'pricing.desc_company' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-yellow-500/30"
            >
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                {t('pricing.successTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {t('pricing.successMessage')}
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.href = '/tools'; // Redirect to tools
                }}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <PartyPopper className="w-5 h-5" />
                {t('pricing.exploreTools')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {t('pricing.subtitle')}
        </p>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
          {t('pricing.monthly')}
        </span>
        <button 
          onClick={() => setIsYearly(!isYearly)}
          className="relative h-8 w-16 rounded-full bg-yellow-500 transition-colors focus:outline-none shadow-inner overflow-hidden"
        >
          <span 
            className={`absolute top-1 ltr:left-1 rtl:right-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm ${isYearly ? 'ltr:translate-x-8 rtl:-translate-x-8' : 'translate-x-0'}`} 
          />
        </button>
        <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
          {t('pricing.yearly')} <span className="text-red-500 font-bold mx-1">({t('pricing.save', { percent: 17, defaultValue: 'Save 17%' })})</span>
        </span>
      </div>

      {/* Coupon Input */}
      <div className="max-w-md mx-auto mb-16">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value); setCouponError(''); }}
              placeholder={t('pricing.couponPlaceholder')}
              className="block w-full ltr:pl-10 rtl:pr-10 ltr:pr-3 rtl:pl-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleApplyCoupon}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            {t('pricing.apply')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1">
            <X className="w-3 h-3" /> {couponError}
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {basePlans.map((bp) => {
          const planId = isYearly ? bp.yearlyId : bp.monthlyId;
          const plan = PLANS[planId as PlanId];
          const pricing = planId === 0 ? null : PRICING_MAP[currency].plans[planId as keyof typeof PRICING_MAP['USD']['plans']];
          const isHighlighted = bp.name === 'PRO' || bp.name === 'KING';

          let displayPrice = pricing ? pricing.price : null;
          let displayOriginalPrice = pricing ? pricing.originalPrice : null;
          let activeDiscountPercent = 0;

          // Apply Lucky Wheel Discount first (overrides promo)
          if (activeDiscount && pricing) {
            activeDiscountPercent = activeDiscount.prize.discountPercentage;
            if (activeDiscountPercent > 0) {
              displayOriginalPrice = isYearly ? pricing.originalPrice : pricing.price;
              const basePrice = isYearly ? (pricing.originalPrice || pricing.price) : pricing.price;
              displayPrice = Math.floor(basePrice * (1 - activeDiscountPercent / 100));
            }
          } else if (isPromoActive && pricing) {
            // Apply Promo Engine Discount
            displayPrice = pricing.price;
            displayOriginalPrice = pricing.originalPrice;
          }

          return (
            <div 
              key={bp.name} 
              className={`relative flex flex-col bg-white dark:bg-[#1e293b] rounded-3xl border ${isHighlighted ? 'border-yellow-500 shadow-xl shadow-yellow-500/10' : 'border-gray-200 dark:border-gray-700 shadow-sm'} p-6 overflow-hidden transition-all hover:-translate-y-1`}
            >
              {isYearly && planId !== 0 && !activeDiscountPercent && isPromoActive && (
                <div className="absolute top-0 ltr:right-0 rtl:left-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 ltr:rounded-bl-xl rtl:rounded-br-xl uppercase tracking-wider">
                  {t('pricing.save', { percent: 17, defaultValue: 'Save 17%' })}
                </div>
              )}
              {activeDiscountPercent > 0 && planId !== 0 && (
                <div className="absolute top-0 ltr:right-0 rtl:left-0 bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 ltr:rounded-bl-xl rtl:rounded-br-xl uppercase tracking-wider">
                  {t('pricing.save', { percent: activeDiscountPercent, defaultValue: `Save ${activeDiscountPercent}%` })}
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{bp.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 h-10">{t(bp.descKey)}</p>
              
              <div className="mb-8 h-24 flex flex-col justify-center">
                {planId === 0 ? (
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">{bp.name}</div>
                ) : (
                  <>
                    {displayOriginalPrice && (
                      <div className="text-sm text-gray-400 line-through mb-1 font-medium" dir="ltr">
                        {PRICING_MAP[currency].symbol} {displayOriginalPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1" dir="ltr">
                      <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">{PRICING_MAP[currency].symbol}</span>
                      <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{displayPrice?.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">/{pricing?.period}</div>
                  </>
                )}
              </div>

              <div className="flex-grow space-y-5 mb-8">
                <FeatureItem 
                  icon={<Check className="w-5 h-5 text-yellow-500" />} 
                  text={<span dangerouslySetInnerHTML={{ __html: t('pricing.maxFileSize', { size: plan.maxFileSizeMB, defaultValue: `<strong class="text-gray-900 dark:text-white">${plan.maxFileSizeMB}MB</strong> Max File Size` }) }} />} 
                />
                <FeatureItem 
                  icon={<Zap className="w-5 h-5 text-yellow-500" />} 
                  text={<span dangerouslySetInnerHTML={{ __html: t('pricing.normalOps', { amount: plan.dailyNormalFiles === Infinity ? t('pricing.unlimited') : plan.dailyNormalFiles, defaultValue: `<strong class="text-gray-900 dark:text-white">${plan.dailyNormalFiles === Infinity ? t('pricing.unlimited') : plan.dailyNormalFiles}</strong> Normal Operations/day` as string }) }} />} 
                />
                <FeatureItem 
                  icon={<Crown className="w-5 h-5 text-yellow-500" />} 
                  text={<span dangerouslySetInnerHTML={{ __html: t('pricing.aiOps', { amount: plan.dailyAiFiles === Infinity ? t('pricing.unlimited') : plan.dailyAiFiles, defaultValue: `<strong class="text-gray-900 dark:text-white">${plan.dailyAiFiles === Infinity ? t('pricing.unlimited') : plan.dailyAiFiles}</strong> AI Operations/day` as string }) }} />} 
                />
                
                {plan.hasWatermark ? (
                  <FeatureItem 
                    icon={<X className="w-5 h-5 text-gray-400" />} 
                    text={<span className="text-gray-500">{t('pricing.watermarkApplied')}</span>} 
                  />
                ) : (
                  <FeatureItem 
                    icon={<Shield className="w-5 h-5 text-yellow-500" />} 
                    text={<span className="text-gray-900 dark:text-white font-medium">{t('pricing.noWatermark')}</span>} 
                  />
                )}

                {plan.hasAds ? (
                  <FeatureItem 
                    icon={<X className="w-5 h-5 text-gray-400" />} 
                    text={<span className="text-gray-500">{t('pricing.adsApplied')}</span>} 
                  />
                ) : (
                  <FeatureItem 
                    icon={<Shield className="w-5 h-5 text-yellow-500" />} 
                    text={<span className="text-gray-900 dark:text-white font-medium">{t('pricing.noAds')}</span>} 
                  />
                )}
              </div>

              {planId === 0 ? (
                <button className="w-full py-3.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold cursor-not-allowed">
                  {t('pricing.currentPlan')}
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscriptionFlow(planId)}
                  className="w-full py-3.5 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {t('pricing.subscribeNow')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
      <div className="flex-shrink-0">{icon}</div>
      <div>{text}</div>
    </div>
  );
}
