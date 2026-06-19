export interface RegionPromoConfig {
  showAnnouncement: boolean;
  showCountdown: boolean;
  targetGoal: number;
  campaignStartDate: string;
  discountCode?: string;
  message?: string;
  isWelcomeMessage?: boolean; // Flag to indicate this is a post-campaign message
  templates?: {
    launchOffer: string;
    occasionOffer: string;
    welcomeMessage: string;
  };
  activeTemplate?: 'launchOffer' | 'occasionOffer' | 'welcomeMessage';
}

export const PROMO_CONFIG: Record<'EG' | 'GLOBAL', RegionPromoConfig> = {
  EG: {
    showAnnouncement: false,
    showCountdown: false,
    targetGoal: 2000,
    campaignStartDate: '2026-03-18',
    message: 'بمناسبة شهر رمضان خصم 50% على كل الخطط لـ 2000 مشترك جديد!',
    isWelcomeMessage: false,
  },
  GLOBAL: {
    showAnnouncement: false,
    showCountdown: false,
    targetGoal: 4000,
    campaignStartDate: '2027-01-01',
    discountCode: 'LAUNCH70',
    activeTemplate: 'launchOffer',
    templates: {
      launchOffer: 'بمناسبة الاطلاق خصم 50% على كل الخطط لأول {{goal}} مشترك',
      occasionOffer: 'بمناسبة راس السنة الجديدة خصم 70% على كل الخطط ل{{goal}} مشترك جديد',
      welcomeMessage: 'شكراً لزيارتك لـ PDF King! لقد انتهى عرض الإطلاق مؤخراً، ولكننا نعدك بمفاجآت قادمة قريباً. استمتع بتجربة أدواتنا الآن!',
    },
  },
};

export interface WheelPrize {
  id: string;
  label: string;
  secretKey: string;
  yearKey: string;
  discountPercentage: number;
  probability: number; // 0-100
  color: string;
}

export interface LuckyWheelConfig {
  showLocalWheel: boolean;
  showGlobalWheel: boolean;
  localWheelVersion: number;
  globalWheelVersion: number;
  localPrizes: WheelPrize[];
  globalPrizes: WheelPrize[];
}

export const WHEEL_CONFIG: LuckyWheelConfig = {
  showLocalWheel: false,
  showGlobalWheel: false,
  localWheelVersion: 1,
  globalWheelVersion: 1,
  localPrizes: [
    { id: '1', label: 'خصم 10%', secretKey: 'RAMADAN_10', yearKey: '_2026', discountPercentage: 10, probability: 30, color: '#1a1f36' },
    { id: '2', label: 'خصم 20%', secretKey: 'RAMADAN_20', yearKey: '_2026', discountPercentage: 20, probability: 30, color: '#d4af37' },
    { id: '3', label: 'خصم 30%', secretKey: 'RAMADAN_30', yearKey: '_2026', discountPercentage: 30, probability: 20, color: '#f9d976' },
    { id: '4', label: 'خصم 50%', secretKey: 'RAMADAN_50', yearKey: '_2026', discountPercentage: 50, probability: 5, color: '#1a1f36' },
    { id: '5', label: 'جرب ثانياً', secretKey: 'TRY_AGAIN', yearKey: '_2026', discountPercentage: 0, probability: 15, color: '#d4af37' },
  ],
  globalPrizes: [
    { id: '1', label: '10% OFF', secretKey: 'GLOBAL_10', yearKey: '_2026', discountPercentage: 10, probability: 30, color: '#1a1f36' },
    { id: '2', label: '20% OFF', secretKey: 'GLOBAL_20', yearKey: '_2026', discountPercentage: 20, probability: 30, color: '#d4af37' },
    { id: '3', label: '30% OFF', secretKey: 'GLOBAL_30', yearKey: '_2026', discountPercentage: 30, probability: 20, color: '#f9d976' },
    { id: '4', label: '50% OFF', secretKey: 'GLOBAL_50', yearKey: '_2026', discountPercentage: 50, probability: 5, color: '#1a1f36' },
    { id: '5', label: 'Try Again', secretKey: 'TRY_AGAIN', yearKey: '_2026', discountPercentage: 0, probability: 15, color: '#d4af37' },
  ]
};
