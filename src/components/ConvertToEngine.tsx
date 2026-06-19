import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function ConvertToEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['word_to_pdf', 'jpg_to_pdf', 'png_to_pdf', 'excel_to_pdf', 'powerpoint_to_pdf', 'video_to_pdf'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
