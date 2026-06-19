import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Settings, LogIn, User, Crown, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { user, setShowAuthModal, setAuthMessage, logout } = useAuth();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (!savedMode && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangDropdown(false);
    // Update document direction and language attributes
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(lng);
  };

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'pcm', name: 'Nigerian Pidgin', flag: '🇳🇬' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'wuu', name: '吴语', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
    { code: 'jv', name: 'Basa Jawa', flag: '🇮🇩' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      {/* Logo Area */}
      <div className="flex items-center gap-2 cursor-pointer">
        <Crown className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-gray-900 dark:text-white">PDF</span>
          <span className="text-yellow-500">King</span>
        </div>
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors text-gray-700 dark:text-gray-300"
          title={t('header.theme_toggle')}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors text-gray-700 dark:text-gray-300"
            title={t('header.settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {showLangDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowLangDropdown(false)}
              ></div>
              <div 
                className="absolute top-full mt-2 w-56 max-h-[70vh] overflow-y-auto bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-2 no-scrollbar"
                style={{ [i18n.dir() === 'rtl' ? 'left' : 'right']: 0 }}
              >
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors ${
                      i18n.language.startsWith(lang.code) ? 'text-yellow-500 font-medium bg-yellow-50/50 dark:bg-yellow-900/10' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Login / Profile */}
        {user ? (
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium">{user.name.split(' ')[0]}</span>
            </button>
            <div className="absolute top-full mt-2 w-48 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden" style={{ [i18n.dir() === 'rtl' ? 'left' : 'right']: 0 }}>
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  {t('header.logout')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthMessage('');
              setShowAuthModal(true);
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors text-gray-700 dark:text-gray-300"
            title={t('header.login')}
          >
            <LogIn className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
