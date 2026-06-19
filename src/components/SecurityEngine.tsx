import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function SecurityEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['protect_pdf', 'unlock_pdf', 'add_watermark'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
