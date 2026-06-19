import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function EditEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['add_text', 'add_image', 'erase_content', 'add_signature', 'crop', 'flatten'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
