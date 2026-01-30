# Demo Mode Design

**Date:** 2025-01-29
**Status:** Approved
**Author:** Design Session

## Overview

Implement a secure Demo Mode that works entirely offline without backend calls. This allows the other developer to build and test UI features without needing the full backend stack, while preventing unauthorized API access.

## Requirements

1. **Offline Functionality**: Demo Mode must not make any network requests
2. **Security**: Agent chat must not hit backend in demo mode
3. **Realistic Testing**: Simulated delays and streaming to test UI indicators
4. **Complete Coverage**: All backend scenarios mocked (suggestions, subgoals, commands)
5. **Reuse Existing Data**: Leverage `mockGoals.ts` and `candidateMockData.ts`

## Architecture

### State Management

Add to `AppState` in `useAppStore.ts`:

```typescript
interface AppState {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}
```

Initial state: `isDemoMode: false`

Set on demo login:
```typescript
const handleDemoLogin = async () => {
  const localDemoUser = { id: 'demo-user', name: 'Demo User', email: 'demo@example.com' };
  setUser(localDemoUser);
  get().setDemoMode(true);  // Enable mock routing
  mockGoals.forEach(goal => addGoal(goal as any));
  navigate('/');
};
```

### Service Routing Pattern

All API calls check `isDemoMode` first:

```typescript
sendCreationMessage: async (content) => {
  if (get().isDemoMode) {
    return mockOverviewChatService.chat(content);
  }
  return aiOverviewChatService.chat(content);
}

sendGoalMessage: async (goalId, content) => {
  if (get().isDemoMode) {
    return mockGoalChatService.chat(goalId, content);
  }
  return aiGoalChatService.chat(goalId, content);
}
```

### Mock Chat Service

**File:** `src/services/mockChatService.ts`

**Delay Configuration:**
- Typing delay per chunk: 50-150ms
- Initial response delay: 500-1500ms
- Total response time: < 2 seconds

**Streaming Simulation:**
```typescript
async *chatStream(message: string) {
  await delay(500 + Math.random() * 1000); // Initial thinking
  const response = matchResponse(message);
  const chunks = response.content.split(/(?<=\s)/); // Split by words

  for (const chunk of chunks) {
    await delay(50 + Math.random() * 100);
    yield { content: chunk, done: false };
  }

  yield { content: '', done: true };
  return response; // For command execution
}
```

## Response Scenarios

### 1. Initial Greeting
Trigger: First message or empty input
Response: "What would you like to work on today? I can help you with:\n\n- **Items** - Products you want to purchase\n- **Finances** - Money goals and tracking\n- **Actions** - Skills to learn or habits to build"

### 2. Break Down Request
Keywords: `['break down', 'subgoal', 'smaller', 'steps', 'milestone']`
Response: Suggests 3-4 subgoals with details
Commands: 3-4 CREATE_SUBGOAL commands using `mockGoals` data

### 3. Add Specific Subgoal
Keywords: `['create', 'add', 'subgoal', 'new goal']`
Response: "I'll create that subgoal for you."
Commands: 1 CREATE_SUBGOAL command

### 4. Progress Update
Keywords: `['update', 'progress', 'complete', 'finished']`
Response: Progress acknowledgment
Commands: UPDATE_PROGRESS command

### 5. Price/Shopping Comparison
Keywords: `['compare', 'where to buy', 'best price', 'cheapest', 'amazon', 'ebay']`
Response: Product comparison using `candidateMockData.ts`
Commands: None

### 6. Goal Type Suggestion
Keywords: `['item', 'finance', 'action', 'buy', 'save', 'learn']`
Response: Suggests appropriate goal type with explanation
Commands: Optional CREATE_SUBGOAL

### 7. General Advice
Keywords: (fallback for any input)
Response: Pre-canned motivational/productivity tips
Commands: None

## Command Execution

Mock commands reuse existing mock data:

```typescript
import { mockGoals } from '@/data/mockGoals';

const getMockSubgoal = (index: number) => ({
  type: 'action',
  title: mockGoals[index % mockGoals.length].title,
  description: mockGoals[index % mockGoals.length].description,
  tasks: mockGoals[index % mockGoals.length].tasks?.slice(0, 3) || [],
  // ... other fields
});

// Example command response
{
  content: "Perfect! I've broken this down into 4 manageable steps.",
  commands: [
    { type: 'CREATE_SUBGOAL', data: getMockSubgoal(0) },
    { type: 'CREATE_SUBGOAL', data: getMockSubgoal(1) },
    { type: 'CREATE_SUBGOAL', data: getMockSubgoal(2) },
    { type: 'CREATE_SUBGOAL', data: getMockSubgoal(3) },
  ]
}
```

## Error Handling

Mock service never throws - always returns safe defaults:

```typescript
async chat(message: string): Promise<ChatResponse> {
  try {
    return matchResponse(message) || defaultResponse;
  } catch (error) {
    return {
      content: "I'm here to help! What would you like to work on?",
      commands: []
    };
  }
}
```

Edge cases:
- Empty input → greeting
- Unknown input → generic help
- Commands without data → use first mock goal
- Streaming error → complete immediately

## Security Guarantees

When `isDemoMode = true`:
- No `fetch()` calls
- No `XMLHttpRequest` calls
- No backend API interactions
- All data from local imports
- Flag checked before every service call

## Files to Create/Modify

**Create:**
- `src/services/mockChatService.ts`

**Modify:**
- `src/store/useAppStore.ts` - Add `isDemoMode` flag, routing logic
- `src/pages/Login.tsx` - Set `isDemoMode` on demo login

**Reuse (no changes):**
- `src/data/mockGoals.ts` - Subgoal data source
- `src/data/candidateMockData.ts` - Product comparison data

## Testing Checklist

- [ ] Demo login sets `isDemoMode = true`
- [ ] Overview chat uses mock responses
- [ ] Goal chat uses mock responses
- [ ] Streaming works with delays
- [ ] CREATE_SUBGOAL commands execute
- [ ] UPDATE_PROGRESS commands execute
- [ ] No network requests in DevTools Network tab
- [ ] `isDemoMode` persists across refresh
- [ ] All 7 response scenarios work
- [ ] Candidate data displays for item goals

## Implementation Order

1. Add `isDemoMode` state to useAppStore
2. Create `mockChatService.ts` with all scenarios
3. Update `sendCreationMessage` routing
4. Update `sendGoalMessage` routing
5. Update `Login.tsx` to set flag
6. Test all scenarios
7. Verify no network calls in DevTools
