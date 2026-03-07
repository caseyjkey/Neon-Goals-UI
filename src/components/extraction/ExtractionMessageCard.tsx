import React, { useEffect, useRef } from 'react';
import { useExtraction } from '@/hooks/useExtraction';
import { ExtractionProgressUI } from './ExtractionProgress';
import type { ExtractionResult } from '@/services/extractionService';
import type { ExtractionInfo } from '@/types/goals';

interface ExtractionMessageCardProps {
  extraction: ExtractionInfo;
  onComplete?: (groupId: string, results: ExtractionResult[]) => void;
}

export const ExtractionMessageCard: React.FC<ExtractionMessageCardProps> = ({
  extraction,
  onComplete,
}) => {
  const hook = useExtraction();
  const completeFired = useRef(false);

  // Connect to SSE stream on mount (or when groupId changes)
  useEffect(() => {
    hook.startExtraction(extraction.groupId, extraction.urls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraction.groupId]);

  // Fire onComplete once when extraction finishes live (not for historical reloads)
  useEffect(() => {
    if (hook.isComplete && hook.results.length > 0 && !completeFired.current && !hook.wasAlreadyComplete) {
      completeFired.current = true;
      onComplete?.(extraction.groupId, hook.results);
    }
  }, [hook.isComplete, hook.wasAlreadyComplete, hook.results, extraction.groupId, onComplete]);

  return (
    <div className="mt-2">
      <ExtractionProgressUI
        urls={extraction.urls}
        progress={hook.progress}
        results={hook.results}
        isComplete={hook.isComplete}
        isCreatingGoals={hook.isCreatingGoals}
      />
    </div>
  );
};

export default ExtractionMessageCard;
