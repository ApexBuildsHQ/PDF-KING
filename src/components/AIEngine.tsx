import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function AIEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['ai_summarize', 'ai_chat', 'ai_translate', 'ai_extract'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
