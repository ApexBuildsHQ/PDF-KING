import React, { useState, useEffect, useRef, useCallback } from 'react';
import BaseEngine from './BaseEngine';
import { Trash2, File as FileIcon } from 'lucide-react';
import FileUploadArea from './FileUploadArea';
import { renderPdfPageToBlobUrl } from '../utils/pdfRenderUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MemoizedFileCard = React.memo(React.forwardRef(({ 
  file, 
  thumbnail, 
  pageRange, 
  index,
  isDragging,
  isOverlay,
  onRemove,
  onRangeChange,
  ...props
}: any, ref: any) => {
  return (
    <div 
      ref={ref}
      {...props}
      className={`bg-white dark:bg-gray-800 p-3 rounded-xl border ${
        isOverlay 
          ? 'border-red-500 shadow-2xl scale-105 cursor-grabbing z-50' 
          : isDragging 
            ? 'opacity-0' // Hide the original item while dragging to show only the overlay
            : 'border-gray-200 dark:border-gray-700 shadow-sm cursor-grab hover:border-red-300 dark:hover:border-red-600'
      } flex flex-col h-[240px] transition-all duration-300 ease-in-out`}
      style={{ 
        ...props.style,
        userSelect: isOverlay || isDragging ? 'none' : 'auto',
        touchAction: 'none' // Prevent scrolling while dragging on mobile
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300 pointer-events-none" title={file.name} dir="ltr">
            {file.name}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(index); }} 
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 relative z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Thumbnail */}
      <div className="w-full flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 pointer-events-none select-none">
        {thumbnail && thumbnail !== 'error' ? (
          <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-contain pointer-events-none" draggable={false} />
        ) : thumbnail === 'error' ? (
          <div className="text-xs text-red-500 flex flex-col items-center">
            <FileIcon className="w-6 h-6 mb-1 opacity-50" />
            Error
          </div>
        ) : (
          <div className="text-xs text-gray-400 flex flex-col items-center">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            Loading...
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="mt-auto h-8 relative z-10" onPointerDown={(e) => e.stopPropagation()}>
        <input
          type="text"
          placeholder="e.g. 1-3, 5"
          className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          value={pageRange || ''}
          onChange={(e) => onRangeChange(index, e.target.value)}
        />
      </div>
    </div>
  );
}));

function SortableItem({ id, file, thumbnail, pageRange, index, onRemove, onRangeChange }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'all 0.3s ease',
  };

  return (
    <MemoizedFileCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      file={file}
      thumbnail={thumbnail}
      pageRange={pageRange}
      index={index}
      isDragging={isDragging}
      onRemove={onRemove}
      onRangeChange={onRangeChange}
    />
  );
}

interface MergeFilesUIProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  tool: any;
  pageRanges: string[];
  setPageRanges: React.Dispatch<React.SetStateAction<string[]>>;
}

function MergeFilesUI({ files, setFiles, tool, pageRanges, setPageRanges }: MergeFilesUIProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const thumbnailCache = useRef<Record<string, string>>({});
  const processingQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  const [fileIds, setFileIds] = useState<string[]>([]);

  useEffect(() => {
    setFileIds(prev => {
      if (prev.length === files.length) return prev;
      const newIds = [...prev];
      while (newIds.length < files.length) {
        newIds.push(Math.random().toString(36).substring(2, 9));
      }
      if (newIds.length > files.length) {
        newIds.length = files.length;
      }
      return newIds;
    });
  }, [files.length]);

  useEffect(() => {
    setPageRanges(prev => {
      if (prev.length === files.length) return prev;
      const newRanges = [...prev];
      while (newRanges.length < files.length) {
        newRanges.push('');
      }
      if (newRanges.length > files.length) {
        newRanges.length = files.length;
      }
      return newRanges;
    });
  }, [files.length, setPageRanges]);

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingQueue.current) return;
      isProcessingQueue.current = true;

      while (processingQueue.current.length > 0) {
        const fileId = processingQueue.current[0];
        const index = fileIds.indexOf(fileId);
        const file = files[index];
        
        if (file && !thumbnailCache.current[fileId]) {
          try {
            const blobUrl = await renderPdfPageToBlobUrl(file, 1, 0.3);
            thumbnailCache.current[fileId] = blobUrl;
            setThumbnails(prev => ({ ...prev, [fileId]: blobUrl }));
          } catch (error) {
            console.error('Failed to generate thumbnail', error);
            thumbnailCache.current[fileId] = 'error';
            setThumbnails(prev => ({ ...prev, [fileId]: 'error' }));
          }
        }
        processingQueue.current.shift();
      }

      isProcessingQueue.current = false;
    };

    const newFileIds = fileIds.filter(id => !thumbnailCache.current[id] && !processingQueue.current.includes(id));
    if (newFileIds.length > 0) {
      processingQueue.current.push(...newFileIds);
      processQueue();
    }
  }, [files, fileIds]);

  useEffect(() => {
    return () => {
      Object.values(thumbnailCache.current).forEach(url => {
        if (url && url !== 'error') {
          URL.revokeObjectURL(url);
        }
      });
      thumbnailCache.current = {};
      processingQueue.current = [];
    };
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPageRanges(prev => prev.filter((_, i) => i !== index));
    setFileIds(prev => {
      const removedId = prev[index];
      if (removedId) {
        const url = thumbnailCache.current[removedId];
        if (url && url !== 'error') {
          URL.revokeObjectURL(url);
        }
        delete thumbnailCache.current[removedId];
        setThumbnails(t => {
          const next = { ...t };
          delete next[removedId];
          return next;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [setFiles, setPageRanges]);

  const handleRangeChange = useCallback((index: number, value: string) => {
    setPageRanges(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, [setPageRanges]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before dragging starts, allowing clicks on inputs/buttons
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fileIds.indexOf(active.id);
      const newIndex = fileIds.indexOf(over.id);

      setFileIds((items) => arrayMove(items, oldIndex, newIndex));
      setFiles((items) => arrayMove(items, oldIndex, newIndex));
      setPageRanges((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeIndex = activeId ? fileIds.indexOf(activeId) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 content-start min-h-[300px] px-[25px]"
      >
        <SortableContext
          items={fileIds}
          strategy={rectSortingStrategy}
        >
          {files.map((file, index) => {
            const fileId = fileIds[index];
            if (!fileId) return null;
            return (
              <SortableItem
                key={fileId}
                id={fileId}
                file={file}
                thumbnail={thumbnails[fileId]}
                pageRange={pageRanges[index]}
                index={index}
                onRemove={handleRemove}
                onRangeChange={handleRangeChange}
              />
            );
          })}
        </SortableContext>

        <div className="h-[240px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center p-2 hover:border-red-400 dark:hover:border-red-500 transition-colors bg-white dark:bg-gray-800/50">
          <FileUploadArea 
            tool={tool} 
            onFilesAccepted={(newFiles) => setFiles(prev => [...prev, ...newFiles])} 
            multiple={true} 
            accept=".pdf"
            compact={true}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeId && activeIndex !== -1 ? (
          <MemoizedFileCard
            file={files[activeIndex]}
            thumbnail={thumbnails[activeId]}
            pageRange={pageRanges[activeIndex]}
            index={activeIndex}
            isOverlay={true}
            onRemove={() => {}}
            onRangeChange={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function OrganizeEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['organize', 'delete_pages', 'rotate', 'split', 'extract', 'merge'];
  const [pageRanges, setPageRanges] = useState<string[]>([]);
  
  const renderFiles = (files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>, isProcessing: boolean, progress: number, tool: any) => {
    return <MergeFilesUI files={files} setFiles={setFiles} tool={tool} pageRanges={pageRanges} setPageRanges={setPageRanges} />;
  };

  const getOptions = () => {
    return { pageRanges };
  };

  return <BaseEngine 
    tool={tool} 
    onBack={onBack} 
    allowedTools={allowedTools} 
    renderFiles={tool.id === 'merge' ? renderFiles : undefined} 
    getOptions={tool.id === 'merge' ? getOptions : undefined}
  />;
}
