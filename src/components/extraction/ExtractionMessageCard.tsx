import React, { useEffect, useRef } from 'react';
import { useExtraction } from '@/hooks/useExtraction';
import { ExtractionProgressUI } from './ExtractionProgress';
import type { ExtractionResult } from '@/services/extractionService';
import type { ExtractionInfo } from '@/types/goals';

interface ExtractionMessageCardProps {
  extraction: ExtractionInfo;
  enableLiveTracking?: boolean;
  onComplete?: (groupId: string, results: ExtractionResult[]) => void;
}

export const ExtractionMessageCard: React.FC<ExtractionMessageCardProps> = ({
  extraction,
  enableLiveTracking = false,
  onComplete,
}) => {
  const hook = useExtraction();
  const completeFired = useRef(false);
  const safeUrls = Array.isArray(extraction?.urls) ? extraction.urls : [];
  const safeGroupId = typeof extraction?.groupId === 'string' ? extraction.groupId : '';

  // Connect to SSE stream on mount (or when groupId changes)
  useEffect(() => {
    if (!enableLiveTracking) return;
    if (!safeGroupId) return;
    hook.startExtraction(safeGroupId, safeUrls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableLiveTracking, safeGroupId]);

  // Fire onComplete once when extraction finishes live (not for historical reloads)
  useEffect(() => {
    if (hook.isComplete && hook.results.length > 0 && !completeFired.current && !hook.wasAlreadyComplete && safeGroupId) {
      completeFired.current = true;
      onComplete?.(safeGroupId, hook.results);
    }
  }, [hook.isComplete, hook.wasAlreadyComplete, hook.results, safeGroupId, onComplete]);

  if (!enableLiveTracking) {
    return (
      <div className="mt-2 px-3 py-2 rounded-lg border border-border/50 bg-muted/30 text-xs text-muted-foreground">
        Extraction recorded in history ({safeUrls.length} URL{safeUrls.length === 1 ? '' : 's'})
      </div>
    );
  }

  return (
    <div className="mt-2">
      {hook.error && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {hook.error}
        </div>
      )}
      <ExtractionProgressUI
        urls={safeUrls}
        progress={hook.progress}
        results={hook.results}
        isComplete={hook.isComplete}
        isCreatingGoals={hook.isCreatingGoals}
      />
    </div>
  );
};

export default ExtractionMessageCard;
