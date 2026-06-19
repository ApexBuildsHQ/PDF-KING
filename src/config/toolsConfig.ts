import { FileText, Scissors, Image as ImageIcon, PenTool, Combine, SplitSquareHorizontal, ListOrdered, RotateCw, Crop, Minimize, FileOutput, RefreshCw, Sparkles, Video } from 'lucide-react';
import { FileType } from '../utils/GlobalGuard';

export interface ToolConfig {
  id: string;
  category: string;
  icon: any;
  titleKey: string;
  color: string;
  bg: string;
  usageType: FileType;
  engineComponent: string;
  adCategory?: string;
}

export const toolsConfig: ToolConfig[] = [
  {
    id: 'merge',
    category: 'organize',
    icon: Combine,
    titleKey: 'tools.merge.title',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    usageType: 'normal',
    engineComponent: 'OrganizeEngine',
    adCategory: 'popular'
  },
  {
    id: 'split',
    category: 'organize',
    icon: SplitSquareHorizontal,
    titleKey: 'tools.split.title',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    usageType: 'normal',
    engineComponent: 'OrganizeEngine'
  },
  {
    id: 'organize',
    category: 'organize',
    icon: ListOrdered,
    titleKey: 'tools.organize.title',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    usageType: 'normal',
    engineComponent: 'OrganizeEngine'
  },
  {
    id: 'rotate',
    category: 'organize',
    icon: RotateCw,
    titleKey: 'tools.rotate.title',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    usageType: 'normal',
    engineComponent: 'OrganizeEngine'
  },
  {
    id: 'crop',
    category: 'edit',
    icon: Crop,
    titleKey: 'tools.crop.title',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    usageType: 'normal',
    engineComponent: 'EditEngine'
  },
  {
    id: 'flatten',
    category: 'protect',
    icon: Minimize,
    titleKey: 'tools.flatten.title',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    usageType: 'normal',
    engineComponent: 'EditEngine'
  },
  {
    id: 'extract',
    category: 'organize',
    icon: FileOutput,
    titleKey: 'tools.extract.title',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    usageType: 'normal',
    engineComponent: 'OrganizeEngine'
  },
  {
    id: 'convert_pdf',
    category: 'convert',
    icon: RefreshCw,
    titleKey: 'tools.convert_pdf.title',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    usageType: 'normal',
    engineComponent: 'ConvertFromEngine'
  },
  {
    id: 'pdf_to_jpg',
    category: 'images',
    icon: ImageIcon,
    titleKey: 'tools.pdf_to_jpg.title',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    usageType: 'normal',
    engineComponent: 'ConvertFromEngine'
  },
  {
    id: 'jpg_to_pdf',
    category: 'images',
    icon: ImageIcon,
    titleKey: 'tools.jpg_to_pdf.title',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    usageType: 'normal',
    engineComponent: 'ConvertToEngine'
  },
  {
    id: 'ai_summarize',
    category: 'aiTools',
    icon: Sparkles,
    titleKey: 'tools.ai_summarize.title',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    usageType: 'ai',
    engineComponent: 'AIEngine'
  },
  {
    id: 'video_to_pdf',
    category: 'video',
    icon: Video,
    titleKey: 'tools.video_to_pdf.title',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    usageType: 'normal',
    engineComponent: 'ConvertToEngine'
  }
];
