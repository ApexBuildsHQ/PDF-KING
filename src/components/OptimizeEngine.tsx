import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function OptimizeEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['compress_pdf', 'repair_pdf'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
