# Store & Component Split Plan

## Overview

Split `useAppStore.ts` (2,163 lines) into domain-based stores and `GoalDetailView.tsx` (1,304 lines) into type-specific components, following the pattern established in the chat component split.

## New Store Structure

```
src/store/
├── index.ts              # Barrel exports
├── types.ts              # Shared types (ChatCommand, PendingCommandsState)
├── useAuthStore.ts       # User, settings, demo mode (~150 lines)
├── useViewStore.ts       # UI/navigation state (~150 lines)
├── useGoalsStore.ts      # Goals CRUD & data (~400 lines)
├── useChatStore.ts       # All chat state & actions (~800 lines)
└── useFinanceStore.ts    # Plaid accounts, syncing (~200 lines)
```

### Store Responsibilities

| Store | State | Key Actions |
|-------|-------|-------------|
| `useAuthStore` | user, settings, isDemoMode | login, logout, setUser, updateSettings, setDemoMode |
| `useViewStore` | viewMode, currentGoalId, navigationStack, sidebarOpen, activeCategory, isChatMinimized | setViewMode, selectGoal, drillIntoGoal, navigateBack, toggleSidebar |
| `useGoalsStore` | goals[], goalsVersion, isLoading, error | fetchGoals, addGoal, updateGoal, deleteGoal, archiveGoal, createSubgoal |
| `useChatStore` | creationChat, goalChats, overviewChat, categoryChats, pendingCommands, activeStreams | sendMessage, fetchChat, confirmPendingCommands, editMessage |
| `useFinanceStore` | plaidAccounts[], plaidAccountsVersion | fetchPlaidAccounts, syncPlaidAccount, removePlaidAccount |

## New Component Structure

```
src/components/goals/
├── GoalDetailView.tsx       # Main wrapper (~200 lines)
├── GoalBreadcrumb.tsx       # (already exists)
├── detail/
│   ├── ItemGoalDetail.tsx   # Item/scanner logic (~450 lines)
│   ├── FinanceGoalDetail.tsx # Finance tracking (~180 lines)
│   ├── ActionGoalDetail.tsx # Tasks/habits (~150 lines)
│   ├── GroupGoalDetail.tsx  # Nested goals (~150 lines)
│   └── SubgoalsSection.tsx  # Shared subgoal renderer (~100 lines)
```

## Implementation Phases

### Phase 0: Setup Playwright (~30 min)
- [ ] Install Playwright: `bun add -d @playwright/test`
- [ ] Create `playwright.config.ts`
- [ ] Create test utilities in `e2e/helpers/`

### Phase 1: Write E2E Tests for Current Behavior (~1 hr)
- [ ] `e2e/auth.spec.ts` - Login, logout, demo mode
- [ ] `e2e/goals.spec.ts` - CRUD, navigation, subgoals
- [ ] `e2e/chat.spec.ts` - Message sending, streaming, commands
- [ ] `e2e/navigation.spec.ts` - Sidebar, breadcrumbs, drill-down
- [ ] Run tests to establish baseline

### Phase 2: Extract Types (~15 min)
- [ ] Create `src/store/types.ts`
- [ ] Move `ChatCommand`, `PendingCommandsState` interfaces
- [ ] Update imports in existing files
- [ ] Run E2E tests

### Phase 3: Create Store Slices (No Component Changes)

First create the store slices without changing any components. The stores should:
1. Read from localStorage to stay in sync with useAppStore
2. NOT persist on their own (useAppStore handles persistence)
3. Be ready for components to import later

#### 3a: useAuthStore (COMPLETED)
- [x] Created `useAuthStore.ts` - reads from localStorage, doesn't persist on its own
- [x] Created `src/store/index.ts` barrel exports
- [x] All 31 E2E tests passing
- [x] Components still use `useAppStore` (backward compatible)

#### 3b: Migrate Components (one at a time)
For each domain store:
1. Update components to import from new store
2. Run tests
3. Commit

This approach maintains backward compatibility and incremental progress.

#### 3b: useViewStore (~30 min)
- [ ] Create `useViewStore.ts` with UI state
- [ ] Move view actions (navigation, sidebar, category)
- [ ] Update component imports
- [ ] Run E2E tests
- [ ] Commit

#### 3c: useGoalsStore (~1 hr)
- [ ] Create `useGoalsStore.ts` with goals state
- [ ] Move goal CRUD actions, subgoal actions
- [ ] Update component imports
- [ ] Run E2E tests
- [ ] Commit

#### 3d: useFinanceStore (~30 min)
- [ ] Create `useFinanceStore.ts` with Plaid state
- [ ] Move finance/plaid actions
- [ ] Update component imports
- [ ] Run E2E tests
- [ ] Commit

#### 3e: useChatStore (~1.5 hrs)
- [ ] Create `useChatStore.ts` with all chat state
- [ ] Move chat actions (creation, goal, overview, category)
- [ ] Move streaming management, pending commands
- [ ] Update component imports
- [ ] Run E2E tests
- [ ] Commit

### Phase 4: Split GoalDetailView (~1 hr)
- [ ] Create `src/components/goals/detail/` directory
- [ ] Extract `GroupGoalDetail.tsx` (smallest) → Run tests → Commit
- [ ] Extract `ActionGoalDetail.tsx` → Run tests → Commit
- [ ] Extract `FinanceGoalDetail.tsx` → Run tests → Commit
- [ ] Extract `ItemGoalDetail.tsx` (largest) → Run tests → Commit
- [ ] Extract `SubgoalsSection.tsx` → Run tests → Commit

### Phase 5: Cleanup (~15 min)
- [ ] Remove old `useAppStore.ts`
- [ ] Add barrel exports to `src/store/index.ts`
- [ ] Run full E2E suite
- [ ] Final commit

## Test Commands

```bash
bun test:e2e              # Run all E2E tests
bun test:e2e -- --ui      # Run with Playwright UI
```
