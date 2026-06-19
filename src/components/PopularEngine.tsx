import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function PopularEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['merge', 'compress_pdf', 'pdf_to_word'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
