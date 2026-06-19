import i18n from '../i18n';

export const KING_ADS_CONFIG: Record<string, string> = {
  popular: 'https://monetag-link-popular.example.com',
  organize: 'https://monetag-link-organize.example.com',
  convert: 'https://monetag-link-convert.example.com',
  protect: 'https://monetag-link-protect.example.com',
  edit: 'https://monetag-link-edit.example.com',
  images: 'https://monetag-link-images.example.com',
  aiTools: 'https://monetag-link-aiTools.example.com',
  video: 'https://monetag-link-video.example.com',
  default: 'https://monetag-link-default.example.com'
};

export const handleDownloadClick = (category: string = 'default', onDownload: () => void) => {
  const now = Date.now();
  const timerKey = `pdf_king_ad_timer_${category}`;
  const cooldownUntil = localStorage.getItem(timerKey);

  if (cooldownUntil && now < parseInt(cooldownUntil, 10)) {
    // If in cooldown: just download
    console.log(i18n.t('ads.download_starting', 'Download starting...'));
    onDownload();
  } else {
    // If NOT in cooldown: open Monetag link in a new tab
    const adUrl = KING_ADS_CONFIG[category] || KING_ADS_CONFIG.default;
    
    // Try to open the ad in a new tab
    const newWindow = window.open(adUrl, '_blank');
    
    // If popup blocker blocked it, we still want to download
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('Popup blocked. Proceeding with download.');
    }

    // Proceed with download in the current window
    onDownload();

    // Update timers
    // 1. Current category: 10 minutes (600,000 ms)
    localStorage.setItem(timerKey, (now + 10 * 60 * 1000).toString());

    // 2. All other categories: 3 minutes (180,000 ms)
    Object.keys(KING_ADS_CONFIG).forEach((cat) => {
      if (cat !== category) {
        const otherTimerKey = `pdf_king_ad_timer_${cat}`;
        const currentOtherCooldown = localStorage.getItem(otherTimerKey);
        const newOtherCooldown = now + 3 * 60 * 1000;
        
        // Only set if it doesn't already have a longer cooldown
        if (!currentOtherCooldown || parseInt(currentOtherCooldown, 10) < newOtherCooldown) {
          localStorage.setItem(otherTimerKey, newOtherCooldown.toString());
        }
      }
    });
  }
};
