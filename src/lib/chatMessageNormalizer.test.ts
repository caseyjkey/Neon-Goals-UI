import { describe, expect, it } from 'vitest';

import { normalizeChatMessage, normalizeChatState } from './chatMessageNormalizer';

describe('normalizeChatMessage', () => {
  it('preserves timestamp and proposal metadata from backend messages', () => {
    const rawMessage = {
      id: 'msg-1',
      role: 'assistant',
      content: 'Switching you to the items specialist.',
      createdAt: '2026-03-22T18:30:00.000Z',
      metadata: {
        redirectProposal: {
          target: { type: 'category' as const, categoryId: 'items' as const },
          message: 'The Items specialist can compare the listings with you.',
          label: 'Items specialist',
        },
        proposalDecision: {
          decision: 'accepted',
          decidedAt: '2026-03-22T18:31:00.000Z',
        },
        proposalHistory: [
          { decision: 'proposed', at: '2026-03-22T18:30:00.000Z' },
          { decision: 'accepted', at: '2026-03-22T18:31:00.000Z' },
        ],
      },
    };

    const normalized = normalizeChatMessage(rawMessage);

    expect(normalized.timestamp).toBeInstanceOf(Date);
    expect(normalized.timestamp.toISOString()).toBe('2026-03-22T18:30:00.000Z');
    expect(normalized.redirectProposal).toEqual(rawMessage.metadata.redirectProposal);
    expect(normalized.proposalDecision).toEqual(rawMessage.metadata.proposalDecision);
    expect(normalized.proposalHistory).toEqual(rawMessage.metadata.proposalHistory);
  });
});

describe('normalizeChatState', () => {
  it('normalizes every message in the chat history', () => {
    const state = normalizeChatState({
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'REDIRECT_TO_OVERVIEW: {"message":"Overview."}',
          createdAt: '2026-03-22T18:30:00.000Z',
        },
      ],
      isLoading: true,
    });

    expect(state.isLoading).toBe(true);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].timestamp).toBeInstanceOf(Date);
  });
});
