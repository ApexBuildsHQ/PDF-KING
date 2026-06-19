import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface GeoData {
  countryCode: string;
  currency: 'USD' | 'EGP';
  loaded: boolean;
  error: boolean;
}

const COUNTRY_TO_LANG: Record<string, string> = {
  // Arabic
  EG: 'ar', SA: 'ar', AE: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar', SY: 'ar', IQ: 'ar', YE: 'ar', SD: 'ar', LY: 'ar',
  // French
  FR: 'fr', BE: 'fr', CA: 'fr', SN: 'fr', CI: 'fr', CM: 'fr', MA: 'fr', DZ: 'fr', TN: 'fr',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  // Bengali
  BD: 'bn',
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Urdu
  PK: 'ur',
  // Indonesian
  ID: 'id',
  // German
  DE: 'de', AT: 'de', CH: 'de',
  // Japanese
  JP: 'ja',
  // Nigerian Pidgin
  NG: 'pcm',
  // Hindi (default for India)
  IN: 'hi',
  // Vietnamese
  VN: 'vi',
  // Turkish
  TR: 'tr',
  // Korean
  KR: 'ko',
  // Persian
  IR: 'fa', AF: 'fa',
  // Swahili
  TZ: 'sw', KE: 'sw', UG: 'sw',
  // Italian
  IT: 'it',
  // Amharic
  ET: 'am',
  // Thai
  TH: 'th',
  // Default to English for US, GB, AU, NZ, IE, ZA, etc.
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
};

export function useGeolocation() {
  const { i18n } = useTranslation();
  const [geoData, setGeoData] = useState<GeoData>({
    countryCode: '',
    currency: 'USD',
    loaded: false,
    error: false,
  });

  useEffect(() => {
    const detectGeo = async () => {
      try {
        const cachedGeo = localStorage.getItem('geoData');
        
        if (cachedGeo) {
          const parsed = JSON.parse(cachedGeo);
          setGeoData({ ...parsed, loaded: true, error: false });
          return;
        }

        let countryCode = '';

        // 1. Try to get from headers (Vercel / Cloudflare)
        try {
          const res = await fetch(window.location.href, { method: 'HEAD' });
          countryCode = res.headers.get('x-vercel-ip-country') || res.headers.get('cf-ipcountry') || '';
        } catch (e) {
          console.warn('Failed to fetch headers', e);
        }

        // 2. Fallback to APIs
        if (!countryCode) {
          try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('Failed to fetch geo data');
            const data = await response.json();
            countryCode = data.country_code;
          } catch (error) {
            console.warn('Primary geo API failed, trying fallback 1...', error);
            try {
              const response2 = await fetch('https://api.country.is/');
              if (!response2.ok) throw new Error('Failed to fetch geo data 2');
              const data2 = await response2.json();
              countryCode = data2.country;
            } catch (error2) {
              console.warn('Fallback 1 failed, trying fallback 2...', error2);
              try {
                const response3 = await fetch('https://ipwho.is/');
                if (!response3.ok) throw new Error('Failed to fetch geo data 3');
                const data3 = await response3.json();
                countryCode = data3.country_code;
              } catch (error3) {
                console.error('All geolocation APIs failed', error3);
                countryCode = 'EG'; // Ultimate fallback to Arabic region
              }
            }
          }
        }
        
        const currency = (countryCode === 'EG' ? 'EGP' : 'USD') as 'EGP' | 'USD';
        const detectedLang = COUNTRY_TO_LANG[countryCode] || 'ar';
        
        // Force language on first visit based on geo
        i18n.changeLanguage(detectedLang);

        const newGeoData = {
          countryCode,
          currency,
        };

        localStorage.setItem('geoData', JSON.stringify(newGeoData));
        setGeoData({ ...newGeoData, loaded: true, error: false });
      } catch (error) {
        console.error('Geolocation detection error:', error);
        setGeoData(prev => ({ ...prev, currency: 'USD', loaded: true, error: true }));
      }
    };

    detectGeo();
  }, [i18n]);

  return geoData;
}
