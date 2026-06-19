import { useState, useEffect } from 'react';
import { PROMO_CONFIG, RegionPromoConfig } from '../config/PromotionConfig';
import { useGeolocation } from './useGeolocation';
import { useTranslation } from 'react-i18next';

export function usePromoEngine() {
  const { countryCode, loaded } = useGeolocation();
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState(0);

  // Determine region config
  const regionKey = countryCode === 'EG' ? 'EG' : 'GLOBAL';
  const config: RegionPromoConfig = PROMO_CONFIG[regionKey];

  // Mock fetching subscribers from DB based on campaignStartDate
  useEffect(() => {
    if (!loaded) return;
    
    // In a real app, this would be an API call fetching count since config.campaignStartDate
    // For now, we mock it using localStorage to persist a fake count
    const storageKey = `promo_subs_${regionKey}_${config.campaignStartDate}`;
    let currentSubs = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    // Initialize with a random number close to the goal for testing, if not set
    if (currentSubs === 0) {
      currentSubs = Math.floor(config.targetGoal * 0.85); // 85% of goal
      localStorage.setItem(storageKey, currentSubs.toString());
    }

    setSubscribers(currentSubs);

    // Simulate new subscribers over time
    const interval = setInterval(() => {
      setSubscribers(prev => {
        const next = prev + Math.floor(Math.random() * 3);
        localStorage.setItem(storageKey, next.toString());
        return next;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [loaded, regionKey, config.campaignStartDate, config.targetGoal]);

  const isGoalReached = subscribers >= config.targetGoal;
  
  // Autonomous Logic:
  // If goal reached, countdown and discounts are disabled automatically.
  const isPromoActive = !isGoalReached;
  const showCountdown = isPromoActive && config.showCountdown;
  
  // Announcement Logic:
  // If promo is active, show it if config.showAnnouncement is true.
  // If promo is inactive (goal reached), ONLY show it if it's explicitly a welcome message.
  let showAnnouncement = false;
  if (isPromoActive) {
    showAnnouncement = config.showAnnouncement;
  } else {
    // Goal reached. Only show if developer manually configured a post-campaign message.
    if (regionKey === 'GLOBAL' && config.activeTemplate === 'welcomeMessage') {
      showAnnouncement = config.showAnnouncement;
    } else if (regionKey === 'EG' && config.isWelcomeMessage) {
      showAnnouncement = config.showAnnouncement;
    }
  }

  // Determine message
  let message = '';
  if (regionKey === 'EG') {
    message = config.message || '';
  } else {
    // Global templates from i18n
    if (config.activeTemplate) {
      const templateMap: Record<string, string> = {
        launchOffer: 'promo.promo_launch',
        occasionOffer: 'promo.occasion_launch',
        welcomeMessage: 'promo.welcome_back'
      };
      const translationKey = templateMap[config.activeTemplate];
      if (translationKey) {
        message = t(translationKey, { goal: config.targetGoal });
      }
    }
  }

  return {
    isPromoActive,
    showAnnouncement,
    showCountdown,
    message,
    discountCode: isPromoActive ? config.discountCode : undefined,
    subscribers,
    targetGoal: config.targetGoal,
    subscribersLeft: Math.max(0, config.targetGoal - subscribers),
    loaded
  };
}
