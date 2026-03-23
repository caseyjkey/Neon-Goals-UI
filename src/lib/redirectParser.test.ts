import { describe, expect, it } from 'vitest';

import { parseRedirectCommand, resolveMessageRedirect } from './redirectParser';

describe('resolveMessageRedirect', () => {
  it('prefers explicit redirectProposal metadata over legacy command text', () => {
    const redirectProposal = {
      target: { type: 'category' as const, categoryId: 'items' as const },
      message: 'The Items specialist can compare the listings with you.',
      label: 'Items specialist',
    };

    const resolved = resolveMessageRedirect({
      content: 'REDIRECT_TO_OVERVIEW: {"message":"Legacy fallback should be ignored."}',
      redirectProposal,
    });

    expect(resolved).toEqual(redirectProposal);
  });

  it('falls back to parsing redirect commands from message text', () => {
    const parsed = resolveMessageRedirect({
      content: 'REDIRECT_TO_OVERVIEW: {"message":"Overview is the best place to compare priorities."}',
    });

    expect(parsed).toEqual({
      target: { type: 'overview' },
      message: 'Overview is the best place to compare priorities.',
      label: 'Overview',
    });
  });
});

describe('parseRedirectCommand', () => {
  it('parses legacy redirect command text', () => {
    expect(
      parseRedirectCommand('REDIRECT_TO_CATEGORY: {"categoryId":"finances","message":"Use Finance."}'),
    ).toEqual({
      target: { type: 'category', categoryId: 'finances' },
      message: 'Use Finance.',
      label: 'Finance specialist',
    });
  });
});
