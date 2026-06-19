import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { toolsConfig } from '../config/toolsConfig';
import { GlobalGuard, PlanId } from '../utils/GlobalGuard';

interface ToolGridProps {
  activeCategory: string;
  searchQuery: string;
  onToolSelect: (tool: any) => void;
}

export default function ToolGrid({ activeCategory, searchQuery, onToolSelect }: ToolGridProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const tools = toolsConfig.map(tool => {
    const descKey = tool.titleKey.replace('.title', '.desc');
    const keywordsKey = tool.titleKey.replace('.title', '.keywords');
    
    return {
      ...tool,
      title: t(tool.titleKey) as string,
      desc: t(descKey) !== descKey ? t(descKey) as string : '',
      keywords: t(keywordsKey) !== keywordsKey ? t(keywordsKey) as string : ''
    };
  });

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'popular' || tool.category === activeCategory;
    const searchLower = searchQuery.toLowerCase().trim();
    
    if (!searchLower) return matchesCategory;
    
    const matchesSearch = 
      (tool.title || '').toLowerCase().includes(searchLower) || 
      (tool.desc || '').toLowerCase().includes(searchLower) ||
      (tool.keywords || '').toLowerCase().includes(searchLower);
      
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (tool: any) => {
    const userId = user?.id || 'anonymous';
    const planId = (user?.planId as unknown as PlanId) || 0;
    
    // Check access before opening the tool (passing 0 for fileSizeMB as we don't have a file yet)
    const access = GlobalGuard.checkAccess(userId, planId, tool.usageType, 0);
    
    if (!access.allowed) {
      if (access.messageKey === 'ERR_NORMAL_LIMIT' || access.messageKey === 'ERR_AI_LIMIT') {
        alert(`You have reached your daily limit for this tool. Please upgrade to ${access.values?.nextPlanName || 'a premium plan'} to continue.`);
      } else {
        alert(`Access denied. Please upgrade to ${access.values?.nextPlanName || 'a premium plan'} to use this tool.`);
      }
      window.dispatchEvent(new CustomEvent('open-pricing'));
      return;
    }
    
    onToolSelect(tool);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 mb-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group relative bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {tool.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
