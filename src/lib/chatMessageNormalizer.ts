import type {
  ChatState,
  ExtractionInfo,
  Message,
  MessageMetadata,
  ProposalDecisionRecord,
  RedirectProposal,
  RedirectTarget,
} from '@/types/goals';

const toSafeText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
};

const isRecord = (value: unknown): value is Record<string, any> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

export const normalizeExtraction = (value: any): ExtractionInfo | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  if (typeof value.groupId !== 'string' || !value.groupId) return undefined;

  return {
    groupId: value.groupId,
    urls: Array.isArray(value.urls) ? value.urls.filter((u: unknown): u is string => typeof u === 'string') : [],
    streamUrl: typeof value.streamUrl === 'string' ? value.streamUrl : '',
  };
};

const CATEGORY_LABELS: Record<string, string> = {
  items: 'Items specialist',
  finances: 'Finance specialist',
  actions: 'Actions specialist',
};

const normalizeRedirectTarget = (value: unknown): RedirectTarget | null => {
  if (typeof value === 'string') {
    if (value === 'overview') return { type: 'overview' };

    const [kind, rawId] = value.split(':', 2);
    if (kind === 'category' && rawId && ['items', 'finances', 'actions'].includes(rawId)) {
      return { type: 'category', categoryId: rawId as 'items' | 'finances' | 'actions' };
    }
    if (kind === 'goal' && rawId) {
      return { type: 'goal', goalId: rawId };
    }

    return null;
  }

  if (!isRecord(value)) return null;

  if (value.type === 'overview') {
    return { type: 'overview' };
  }

  if (value.type === 'category' && typeof value.categoryId === 'string' && ['items', 'finances', 'actions'].includes(value.categoryId)) {
    return { type: 'category', categoryId: value.categoryId as 'items' | 'finances' | 'actions' };
  }

  if (value.type === 'goal' && typeof value.goalId === 'string' && value.goalId) {
    return { type: 'goal', goalId: value.goalId };
  }

  if (typeof value.categoryId === 'string' && ['items', 'finances', 'actions'].includes(value.categoryId)) {
    return { type: 'category', categoryId: value.categoryId as 'items' | 'finances' | 'actions' };
  }

  if (typeof value.goalId === 'string' && value.goalId) {
    return { type: 'goal', goalId: value.goalId };
  }

  if (value.redirectTarget) {
    return normalizeRedirectTarget(value.redirectTarget);
  }

  return null;
};

export const normalizeRedirectProposal = (value: unknown): RedirectProposal | undefined => {
  if (!isRecord(value)) return undefined;

  const target = normalizeRedirectTarget(value.target ?? value.redirectTarget ?? value.destination);
  if (!target) return undefined;

  const fallbackLabel =
    target.type === 'category'
      ? CATEGORY_LABELS[target.categoryId]
      : target.type === 'goal'
        ? 'Goal view'
        : 'Overview';

  const message = toSafeText(value.message || value.copy || value.text || fallbackLabel);
  const label = toSafeText(value.label || value.goalTitle || fallbackLabel);

  return {
    target,
    message,
    label,
  };
};

const normalizeProposalDecision = (value: unknown): ProposalDecisionRecord | undefined => {
  if (!isRecord(value)) return undefined;
  return { ...value };
};

const normalizeMessageMetadata = (value: unknown): MessageMetadata | undefined => {
  if (!isRecord(value)) return undefined;

  const metadata: MessageMetadata = { ...value };
  const redirectProposal = normalizeRedirectProposal(value.redirectProposal ?? value.redirect_target ?? value.redirectTarget);

  if (redirectProposal) {
    metadata.redirectProposal = redirectProposal;
  }

  const proposalDecision = normalizeProposalDecision(value.proposalDecision ?? value.decision);
  if (proposalDecision) {
    metadata.proposalDecision = proposalDecision;
  }

  if (Array.isArray(value.proposalHistory)) {
    metadata.proposalHistory = value.proposalHistory
      .filter((item: unknown): item is ProposalDecisionRecord => isRecord(item))
      .map((item) => ({ ...item }));
  } else if (Array.isArray(value.decisionHistory)) {
    metadata.proposalHistory = value.decisionHistory
      .filter((item: unknown): item is ProposalDecisionRecord => isRecord(item))
      .map((item) => ({ ...item }));
  }

  if (typeof value.proposalOutcome === 'string') {
    metadata.proposalOutcome = value.proposalOutcome as MessageMetadata['proposalOutcome'];
  }

  if (typeof value.redirectOutcome === 'string') {
    metadata.redirectOutcome = value.redirectOutcome as MessageMetadata['redirectOutcome'];
  }

  if (typeof value.goalPreview === 'string') {
    metadata.goalPreview = value.goalPreview;
  }

  if (typeof value.awaitingConfirmation === 'boolean') {
    metadata.awaitingConfirmation = value.awaitingConfirmation;
  }

  if (typeof value.proposalType === 'string') {
    metadata.proposalType = value.proposalType;
  }

  if (Array.isArray(value.commands)) {
    metadata.commands = value.commands;
  }

  const extraction = normalizeExtraction(value.extraction);
  if (extraction) {
    metadata.extraction = extraction;
  }

  return metadata;
};

export const normalizeChatMessage = (value: any): Message => {
  const metadata = normalizeMessageMetadata(value?.metadata);
  const sourceMetadata = metadata ?? undefined;

  return {
    id: typeof value?.id === 'string' ? value.id : String(value?.id ?? Date.now()),
    role: value?.role === 'user' ? 'user' : 'assistant',
    content: toSafeText(value?.content),
    timestamp: new Date(value?.createdAt || value?.timestamp || Date.now()),
    goalPreview: sourceMetadata?.goalPreview ?? value?.goalPreview,
    awaitingConfirmation: sourceMetadata?.awaitingConfirmation ?? value?.awaitingConfirmation,
    proposalType: sourceMetadata?.proposalType ?? value?.proposalType,
    commands: sourceMetadata?.commands ?? value?.commands,
    extraction: sourceMetadata?.extraction ?? normalizeExtraction(value?.extraction),
    redirectProposal:
      sourceMetadata?.redirectProposal ??
      normalizeRedirectProposal(value?.redirectProposal ?? value?.redirect_target ?? value?.redirectTarget),
    proposalDecision:
      sourceMetadata?.proposalDecision ??
      normalizeProposalDecision(value?.proposalDecision ?? value?.decision),
    proposalHistory:
      sourceMetadata?.proposalHistory ??
      (Array.isArray(value?.proposalHistory)
        ? value.proposalHistory.filter((item: unknown): item is ProposalDecisionRecord => isRecord(item)).map((item: ProposalDecisionRecord) => ({ ...item }))
        : undefined),
    proposalOutcome: sourceMetadata?.proposalOutcome ?? value?.proposalOutcome,
    redirectOutcome: sourceMetadata?.redirectOutcome ?? value?.redirectOutcome,
    metadata: sourceMetadata,
  };
};

export const normalizeChatState = (chat: any): ChatState => ({
  messages: Array.isArray(chat?.messages) ? chat.messages.map(normalizeChatMessage) : [],
  isLoading: typeof chat?.isLoading === 'boolean' ? chat.isLoading : false,
});
