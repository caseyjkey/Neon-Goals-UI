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

**Prefer Zustand store subscriptions over `useMemo` for reactivity.**

```typescript
// ❌ Avoid: useMemo with version hack
const { goals, goalsVersion } = useAppStore();
const goal = useMemo(() => goals.find(g => g.id === id), [goals, id, goalsVersion]);

// ✅ Prefer: Direct store subscription (only re-renders when this specific data changes)
const goal = useAppStore(state => state.goals.find(g => g.id === id));
```

Benefits:
- Automatic reactivity without manual version tracking
- More efficient - only re-renders when the specific subscribed data changes
- Cleaner, more idiomatic Zustand pattern
