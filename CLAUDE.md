# Project Instructions

## Memory System

### Short-Term Memory (Daily Context)

At the start of each session:

1. Check for a markdown file with today's date in `thoughts/` (e.g., `thoughts/2025-02-19.md`)
2. If it exists, read it as context for what's being worked on
3. If no file for today but a previous day's file exists:
   - Summarize the previous day's short-term memory
   - Append the summary to `thoughts/MEMORY.md`
   - Create today's file
4. As you work, add notes to today's file:
   - What has been done
   - Root causes found
   - Features implemented
   - Purpose/context
   - Progress and plans made/completed

Keep notes **succinct and high-level**. Implementation details go in plan files.

### Long-Term Memory

`thoughts/MEMORY.md` stores persistent context. Daily summaries are appended here when rolling over to a new day.

### Plan Files

For multi-step tasks, create plans in `thoughts/plans/`:
- Make steps parallelizable when possible
- Use subagents to complete parallel steps
- Reference plan files from daily notes

---

## Development Notes

### State Management

Domain-based Zustand stores in `src/store/`:

| Store | Purpose |
|-------|---------|
| `useAuthStore` | User, settings, demo mode, login/logout |
| `useViewStore` | Navigation, sidebar, active category, view mode |
| `useGoalsStore` | Goals CRUD, subgoals, goal data |
| `useChatStore` | All chat state, streaming, pending commands |
| `useFinanceStore` | Plaid accounts, finance goal syncing |

**Usage:**

```typescript
// Import specific store
import { useGoalsStore } from '@/store/useGoalsStore';

// Subscribe to specific data (re-renders only when this changes)
const goal = useGoalsStore(state => state.goals.find(g => g.id === id));

// Access actions
const { updateGoal, deleteGoal } = useGoalsStore();

// Cross-store access (in actions, not components)
const goals = useGoalsStore.getState().goals;
```

**Shared types:** `src/store/types.ts` - ChatCommand, PendingCommandsState, etc.

**Barrel exports:** `src/store/index.ts` for convenient multi-store imports.
