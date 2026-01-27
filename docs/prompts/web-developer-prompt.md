# Web Developer Prompt - Goals-AF Frontend

## Context

You are building the frontend for **Goals-AF**, a goal consolidation app with three goal categories: Items (products to purchase), Finances (financial targets), and Actions (learning/skill achievement).

**MVP Priority:** Build complete frontend UI/UX with mobile-first design, 80s Miami Vice neon aesthetic, and all components ready for future backend integration.

**Tech Stack:**
- Framework: React / Next.js
- State Management: Zustand
- Styling: Tailwind CSS + custom CSS for glassmorphism/glow effects
- Testing: Jest/Vitest (unit), Chromatic/Percy (visual regression), RSpec/Capybara (E2E)
- Auth: GitHub OAuth (production), LocalStorage (dev mode)

## Application Structure

### Layout Architecture

The app uses a **split-view layout** with the following structure:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo | List/Card Toggle | Hamburger (mobile) | Profile │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   Sidebar    │              Main Content Area                  │
│              │                                                  │
│   [Nav]      │     ┌─────────────────────────────────────┐    │
│   [List]     │     │                                     │    │
│   [Goals]    │     │       Goal Cards / Goal Grid        │    │
│   [Settings] │     │                                     │    │
│              │     │    (List View in sidebar,            │    │
│              │     │     Card View in main area)         │    │
│              │     │                                     │    │
│              │     └─────────────────────────────────────┘    │
│              │                                                  │
├──────────────┴──────────────────────────────────────────────────┤
│ Persistent Chat Panel (goal creation) - replaces with goal chat  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Navigation Patterns:**
1. **List View:** Goals shown in sidebar, clicking opens sidebar chat + details
2. **Card View:** Goals shown as grid in main area, clicking opens modal
3. **Goal Detail:** Replaces main view with split panel (details left, goal-specific chat right)
4. **Close Detail:** X button (top right) or ESC key returns to main dashboard

### Color Palette (80s Miami Vice Neon)

| Usage | Color | Hex |
|-------|-------|-----|
| Background 1 (Main) | Midnight navy | #0a0e1a |
| Background 2 (Cards/Panels) | Rich purple | #1a1025 |
| Primary accent 1 | Electric cyan | #00f0ff |
| Primary accent 2 | Magenta | #ff00ff |
| Primary accent 3 | Neon pink | #ff0080 |
| Secondary accent 1 | Lime green | #00ff80 |
| Secondary accent 2 | Goldenrod | #ffd700 |
| Text headings | Pure white | #ffffff |
| Text body | Light gray | #c0c5d0 |

**Typography:**
- Headings: Bold, geometric sans-serif (Montserrat or Space Grotesk)
- Body: Clean sans-serif (Inter or Roboto)

## Core Components to Build

### 1. Sidebar Component

**Features:**
- Category tabs: Items | Finances | Actions
- Goals list (when in List View)
- User profile / Settings access
- Collapsible on mobile (hamburger menu trigger)

**Required Props:**
```typescript
interface SidebarProps {
  categories: GoalCategory[];
  activeCategory: GoalCategory;
  setCategory: (category: GoalCategory) => void;
  goals: Goal[];
  viewMode: 'list' | 'card';
  user: User;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}
```

### 2. Goal Card Component (for each goal type)

**ItemGoalCard:**
- Product image (thumbnail)
- Product name
- Current best price
- Status badge (In Stock, Price Drop, Pending Search)
- "Purchase" button linking to retailer
- Delete/archive buttons
- Hover: neon glow effect

```typescript
interface ItemGoalCardProps {
  goal: ItemGoal;
  onViewDetail: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onArchive: (goalId: string) => void;
}
```

**FinanceGoalCard:**
- Institution icon/logo
- Account name
- Current balance/value
- Target goal
- Progress bar
- "Sync" button
- Mini sparkline showing recent trend
- Hover: neon glow effect

```typescript
interface FinanceGoalCardProps {
  goal: FinanceGoal;
  onViewDetail: (goalId: string) => void;
  onSync: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}
```

**ActionGoalCard:**
- Title
- Description
- Completion percentage
- Task count indicator
- "View Tasks" / "Expand" indicator
- Hover: neon glow effect

```typescript
interface ActionGoalCardProps {
  goal: ActionGoal;
  onViewDetail: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}
```

### 3. Goal Detail View Component

**Layout:** Split panel - details left, goal-specific agent chat right

**ItemGoalDetail:**
- Left Panel:
  - Full-width image carousel
  - Product specs
  - Pros/cons comparison (if multiple options)
  - Seller info
  - Pricing history
  - Prominent "Purchase Now" button (links to retailer)
- Right Panel: Agent chat for search refinement

**FinanceGoalDetail:**
- Left Panel:
  - Account details
  - Balance history chart
  - Contributions/withdrawals
  - Target progress
- Right Panel: Wealth advisor agent chat

**ActionGoalDetail:**
- Left Panel:
  - Full task list with checkboxes
  - Add/edit tasks
  - Completion tracking
- Right Panel: Personal coach agent chat

```typescript
interface GoalDetailViewProps {
  goal: Goal;
  onClose: () => void;
  onUpdate: (goal: Goal) => void;
}
```

### 4. Chat Panel Component (Two modes)

**Mode 1: Persistent Goal Creation Chat (Main Dashboard)**
- Always visible on right side or as floating widget
- Generic agent that discovers goal category
- Transitions to persona once category identified
- Creates new goal after confirmation

**Mode 2: Goal-Specific Agent Chat (Detail View)**
- Replaces persistent chat when viewing a goal
- Persona-specific for each goal type:
  - Items: Product expert/specialist
  - Finances: Wealth advisor + personal finance coach
  - Actions: Personal coach/advisor

```typescript
interface ChatPanelProps {
  mode: 'goal-creation' | 'goal-specific';
  goal?: Goal; // Only for goal-specific mode
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClose?: () => void; // For goal-specific mode
}
```

### 5. Financial Summary Widget

**Components:**
- Total net worth across all linked accounts
- Goal progress summary (e.g., "3 of 5 financial goals on track")
- Quick sync button

```typescript
interface FinancialSummaryProps {
  totalNetWorth: number;
  goalsOnTrack: number;
  totalFinancialGoals: number;
  onSyncAll: () => void;
}
```

### 6. Settings Panel

**Sections:**
- Account: OAuth status, sign out
- Profile: Display name, avatar
- Theme: Neon variations (Cyberpunk, Synthwave, Miami Vice)
- Financial accounts: Manage linked accounts, manual sync
- Chat preferences: AI model, persona customization
- Data export: Download all goals/conversations

```typescript
interface SettingsPanelProps {
  user: User;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onSignOut: () => void;
  onExportData: () => void;
}
```

### 7. View Toggle Component

**Function:** Switch between List View and Card View

```typescript
interface ViewToggleProps {
  currentMode: 'list' | 'card';
  onToggle: (mode: 'list' | 'card') => void;
}
```

## Responsive Design Requirements

### Mobile (375px and up)
- Sidebar hidden behind hamburger menu
- Toggle switch in header for List/Card view
- Chat accessible via FAB (Floating Action Button) or bottom navigation
- Goal details: Full screen with chat below or via tab
- Card grid: 1 column (stacked vertically)
- Touch targets: Minimum 44px
- Swipe gestures for quick actions (delete, archive, mark complete)

### Tablet (768px and up)
- Collapsible sidebar (can remain open)
- 2-column card grid
- Chat panel available

### Desktop (1920px and up)
- Full split-view: sidebar + content + chat panel
- List view in sidebar, cards in main area, chat always visible on right
- 4+ column card grid
- Multi-select: Hold Shift/Ctrl to select multiple goals
- Drag-and-drop: Reorder goals
- Keyboard shortcuts: ESC, N, L, C, /, ?

## State Management (Zustand)

**Required Global State:**

```typescript
interface AppState {
  // Current view state
  viewMode: 'list' | 'card';
  currentGoalId: string | null;
  sidebarOpen: boolean;

  // Data
  goals: Goal[];
  user: User | null;
  settings: Settings;

  // Chat state
  creationChat: ChatState;
  goalChat: Record<string, ChatState>;

  // Actions
  setViewMode: (mode: 'list' | 'card') => void;
  selectGoal: (id: string) => void;
  closeGoal: () => void;
  toggleSidebar: () => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  sendChatMessage: (mode: 'creation' | 'goal', content: string, goalId?: string) => void;
}
```

## UI Effects & Styling

### Buttons
- Gradient backgrounds: cyan-to-magenta or magenta-to-pink
- Rounded corners: 8px
- Glowing border effect on hover
- Smooth transition: 200-300ms

### Cards
- Glassmorphism effect with subtle gradients
- Dark semi-transparent backgrounds (rgba(10, 14, 26, 0.8))
- Neon border on active/hover state
- Subtle shadow

### Progress Bars
- Gradient fills with glowing endpoints
- Smooth animation on value change

### Modals
- Backdrop blur effect
- Neon border outline
- Smooth fade-in/scale-up animation
- Close button in top-right corner

### Loading States
- 80s-style geometric shapes or scanlines
- Skeleton screens with gradient shimmer

### Micro-interactions
- Hover: Scale up slightly (1.02x), glow intensifies
- Click: Subtle press effect
- Focus: Neon glow outline

## Mock Data Structure (Dev Mode)

```typescript
type GoalType = 'item' | 'finance' | 'action';

interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
}

interface ItemGoal extends Goal {
  type: 'item';
  productImage: string;
  bestPrice: number;
  currency: string;
  retailerUrl: string;
  retailerName: string;
  statusBadge: 'in-stock' | 'price-drop' | 'pending-search';
  searchResults?: ProductSearchResult[];
}

interface FinanceGoal extends Goal {
  type: 'finance';
  institutionIcon: string;
  accountName: string;
  currentBalance: number;
  targetBalance: number;
  currency: string;
  progressHistory: number[];
  lastSync: Date;
}

interface ActionGoal extends Goal {
  type: 'action';
  completionPercentage: number;
  tasks: ActionTask[];
}

interface ActionTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
```

## Testing Requirements

### Unit Tests (Jest/Vitest)
- All components should have unit tests
- Test user interactions (click, hover, keyboard)
- Test state management slices

### Visual Regression (Chromatic/Percy)
- Each component in multiple states (default, hover, active, disabled)
- Responsive breakpoints tested
- Theme variations tested

### E2E Tests (RSpec/Capybara)
- Critical user flows:
  - Create Item goal via agent chat
  - Toggle between List and Card views
  - Open goal detail, interact with agent, close via ESC
  - Add Action goal with tasks, mark complete
  - View financial summary widget

## Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard accessible
- ARIA labels on icons and buttons
- Focus indicators with neon glow
- Color contrast ratios verified
- Screen reader support

## Deliverables

1. Complete Next.js project structure
2. All components listed above
3. Zustand store configuration
4. Tailwind CSS configuration with custom 80s neon theme
5. Responsive layout working across all breakpoints
6. Mock data for dev mode (LocalStorage persistence)
7. Visual regression tests setup (Chromatic/Percy)
8. E2E tests setup (RSpec/Capybara)
9. Documentation on how to add backend integration later

## Implementation Order

1. **Setup:** Next.js, Tailwind, Zustand, testing frameworks
2. **Design System:** Color palette, typography, UI components library
3. **Core Layout:** Sidebar, Header, Main Content Area
4. **Goal Cards:** ItemGoalCard, FinanceGoalCard, ActionGoalCard
5. **Chat Panel:** Goal creation mode
6. **Goal Detail View:** Split panel implementation
7. **Financial Summary Widget**
8. **Settings Panel**
9. **Responsive Polish:** Mobile, tablet, desktop
10. **Testing:** Unit, visual regression, E2E

## Additional Notes

- Start with dev mode (LocalStorage) - OAuth can be added later
- Use mock agent responses for now - real backend integration comes later
- Focus on the 80s neon aesthetic - it's a key differentiator
- Make everything mobile-first
- Keep the UI clean and modern despite the retro aesthetic
- All animations should be smooth and subtle, not jarring

---

This prompt provides everything needed to build the Goals-AF frontend. Refer to the full PRD at `docs/plans/2025-01-26-goals-af-prd.md` for additional context and details.
