import { useTranslation } from 'react-i18next';
import { Rocket, FolderOpen, RefreshCw, Shield, Edit3, Image as ImageIcon, Sparkles, Video } from 'lucide-react';

interface CategoryScrollerProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategoryScroller({ activeCategory, setActiveCategory }: CategoryScrollerProps) {
  const { t } = useTranslation();

  const categories = [
    { id: 'popular', icon: Rocket, label: t('categories.popular'), color: 'text-red-500' },
    { id: 'organize', icon: FolderOpen, label: t('categories.organize'), color: 'text-yellow-500' },
    { id: 'convert', icon: RefreshCw, label: t('categories.convert'), color: 'text-blue-500' },
    { id: 'protect', icon: Shield, label: t('categories.protect'), color: 'text-green-500' },
    { id: 'edit', icon: Edit3, label: t('categories.edit'), color: 'text-purple-500' },
    { id: 'images', icon: ImageIcon, label: t('categories.images'), color: 'text-orange-500' },
    { id: 'aiTools', icon: Sparkles, label: t('categories.aiTools'), color: 'text-indigo-500' },
    { id: 'video', icon: Video, label: t('categories.video'), color: 'text-pink-500' },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 px-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212]">
      <div className="flex items-center justify-start md:justify-center gap-3 min-w-max mx-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-[#1e1e1e] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-[#2c2c2c]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-current' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
