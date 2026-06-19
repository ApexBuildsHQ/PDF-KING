import React from 'react';
import BaseEngine from './BaseEngine';

interface EngineProps {
  tool: any;
  onBack: () => void;
}

export default function ConvertFromEngine({ tool, onBack }: EngineProps) {
  const allowedTools = ['pdf_to_word', 'pdf_to_excel', 'pdf_to_powerpoint', 'pdf_to_jpg', 'pdf_to_png'];
  return <BaseEngine tool={tool} onBack={onBack} allowedTools={allowedTools} />;
}
