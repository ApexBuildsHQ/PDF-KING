import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Hero({ searchQuery, setSearchQuery }: HeroProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
        {t('hero.title')}
      </h1>
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl">
        {t('hero.subtitle')}
      </p>

      {/* Search Bar */}
      <div className="w-full max-w-2xl relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-all"
          placeholder={t('search.placeholder')}
        />
      </div>
    </section>
  );
}
