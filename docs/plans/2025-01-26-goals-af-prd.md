# Goals-AF: Product Requirements Document

**Date:** 2025-01-26
**Status:** MVP - Frontend Focus
**Version:** 1.0

## Executive Summary

Goals-AF is a web application that consolidates personal goals across three categories: Items (products to purchase), Finances (financial targets), and Actions (learning/skill achievement). The app features agentic chat that interviews users to create goals, uses browser-use to find products at the best prices, and provides expert agent personas for each goal type.

**MVP Priority:** Build complete frontend UI/UX with mobile-first design, 80s Miami Vice neon aesthetic, and all components ready for future backend integration.

## Core Value Proposition

- **Goal Consolidation:** One dashboard to track all personal goals across categories
- **Agentic Discovery:** Conversational interface for goal creation with specialized expert personas
- **Smart Shopping:** Agent finds exact products at the best prices with comparisons
- **Financial Visibility:** Track net worth across multiple institutions with goal progress
- **Action Accountability:** Coach-driven task management for learning and achievement

## User Personas

**Primary:** Personal goal-setter who wants to:
- Save money by finding the best prices on desired items
- Track progress toward financial milestones
- Stay accountable on learning and skill-building goals
- Use AI as a personal advisor/coach

## Key Features (MVP)

### 1. Goal Categories

| Category | Description | Agent Persona |
|----------|-------------|---------------|
| **Items** | Products to purchase (vape, truck, etc.) | Product expert/specialist for that item type |
| **Finances** | Financial targets and account tracking | Professional wealth advisor + personal finance coach |
| **Actions** | Learning, skills, projects (Stanford AI course, launch GitHubly) | Personal coach/advisor |

### 2. Dashboard Layout

**Split-View Architecture:**
- Left sidebar: Category navigation, goal list (list view), user settings
- Main content area: Goal display (list or card grid), goal detail view
- Persistent chat: Goal creation conversation (replaced by goal-specific chat when viewing details)

**View Toggle:** List View vs Card View selector
- List View: Vertical stack in sidebar → clicking goal opens sidebar chat + details
- Card View: Grid in main area → clicking goal opens modal with details + chat

### 3. Persistent Goal Creation Chat

**Features:**
- Always-visible on main dashboard (right panel or floating widget)
- Starts with generic agent to discover goal category
- Transitions to appropriate persona once category identified
- Agent asks clarifying questions to refine goal details
- Validates and confirms goal before creation
- For Item Goals: Immediately initiates browser-use search and reports options

**Goal Creation Flow:**
1. User opens chat
2. Agent: "What type of goal are you looking to create? Item, Finance, or Action?"
3. User describes goal
4. Agent interviews for details (requirements, budget, timeline, preferences)
5. Agent confirms goal summary
6. Goal created and appears in dashboard

### 4. Goal Detail View

**Item Goals Detail:**
- Left panel: Full-width image carousel, product specs, pros/cons comparison, seller info, pricing history, "Purchase Now" button
- Right panel: Agent chat for refining search ("Too expensive," "Prefer different brand," etc.)

**Finance Goals Detail:**
- Left panel: Account details, balance history chart, contributions/withdrawals, target progress
- Right panel: Wealth advisor agent for questions ("How am I tracking?" "Adjust contribution?")

**Action Goals Detail:**
- Left panel: Full task list with checkboxes, add/edit tasks, completion tracking
- Right panel: Personal coach agent for motivation, strategy, task breakdown

**Navigation:**
- Clicking any goal replaces main view with split detail panel
- Close via X button (top right) or ESC key
- Returns to main dashboard

### 5. Financial Summary Widget

**Components:**
- Total net worth across all linked accounts
- Goal progress summary (e.g., "3 of 5 financial goals on track")
- Quick sync button to refresh all accounts

### 6. User Onboarding & Settings

**Dev Mode (LocalStorage):**
- No account creation required
- Welcome screen with app intro
- Demo goal examples for each category
- "Start Chatting" button to create first goal

**Production (GitHub OAuth → Google OAuth):**
- "Sign in with GitHub" button
- Profile synced and stored
- Existing goals loaded from backend
- Tutorial overlay (dismissible)

**Settings Panel:**
- Account: OAuth status, sign out
- Profile: Display name, avatar
- Theme: Neon variations (Cyberpunk, Synthwave, Miami Vice)
- Financial accounts: Manage linked accounts, manual sync
- Chat preferences: AI model, persona customization
- Data export: Download all goals/conversations

## Design System

### 80s Miami Vice / Retro Neon Aesthetic

**Color Palette:**
| Usage | Color | Hex |
|-------|-------|-----|
| Background 1 | Midnight navy | #0a0e1a |
| Background 2 | Rich purple | #1a1025 |
| Primary accent 1 | Electric cyan | #00f0ff |
| Primary accent 2 | Magenta | #ff00ff |
| Primary accent 3 | Neon pink | #ff0080 |
| Secondary accent 1 | Lime green | #00ff80 |
| Secondary accent 2 | Goldenrod | #ffd700 |
| Text headings | Pure white | #ffffff |
| Text body | Light gray | #c0c5d0 |

**Typography:**
- Headings: Bold, geometric sans-serif (Montserrat, Space Grotesk)
- Body: Clean sans-serif (Inter, Roboto)

**UI Elements:**
- Buttons: Gradient backgrounds (cyan-magenta, magenta-pink), 8px rounded corners, glowing border on hover
- Cards: Glassmorphism, dark semi-transparent backgrounds, neon border on active state
- Progress bars: Gradient fills with glowing endpoints
- Modals: Backdrop blur with neon border outline
- Icons: Thin-line or filled, color-matched to accents

**Animations:**
- Subtle neon glow pulses on active elements
- Smooth transitions (200-300ms)
- Micro-interactions on hover (scale up, glow intensifies)
- Loading states: 80s-style geometric shapes or scanlines

## Technical Architecture

### Frontend Stack

| Component | Technology |
|-----------|------------|
| Framework | React / Next.js |
| State Management | Zustand |
| Styling | Tailwind CSS + custom CSS |
| Testing | Jest/Vitest (unit), Chromatic/Percy (visual regression), RSpec/Capybara (E2E) |
| Authentication | GitHub OAuth → Google OAuth |
| Dev Mode | LocalStorage for data persistence |

### Backend Services (Future Implementation)

| Service | Purpose |
|---------|---------|
| Agent Service | LLM integration, persona management, conversation context |
| Browser-Use Service | Web scraping, product search, price comparison |
| Finance Aggregation Service | Account linking, Plaid/Square integration, data sync |
| Goal Management Service | CRUD, progress tracking, task management |
| Database | PostgreSQL (structured), optional vector DB (conversation context) |

### State Management (Zustand)

**Global State:**
- Current view (list/card/detail)
- Selected goal
- Chat messages
- Goal data
- User profile
- Settings

### API Communication

- REST or GraphQL for frontend-backend communication
- JWT-based authentication
- WebSocket support for real-time agent responses (future)

## Mobile-First Responsiveness

### Mobile (375px+)
- Sidebar hidden behind hamburger menu
- Toggle switch in header for List/Card view
- Chat accessible via FAB or bottom navigation
- Goal details: Full screen with chat below or via tab
- Card grid: 1 column (stacked)
- Touch targets: Minimum 44px
- Swipe gestures for quick actions

### Tablet (768px+)
- Collapsible sidebar
- 2-column card grid
- Chat panel available

### Desktop (1920px+)
- Full split-view: sidebar + content + chat panel
- List view in sidebar, cards in main area, chat always visible on right
- Multi-select (Shift/Ctrl) for batch actions
- Drag-and-drop for goal reordering

## Power User Features

**Keyboard Shortcuts:**
- `ESC` - Close detail view
- `N` - New goal
- `L` / `C` - Toggle list/card view
- `/` - Focus chat input
- `?` - Show keyboard shortcuts

**Chat Features:**
- Message history search
- Copy/paste conversation
- Export goal details (JSON, PDF)
- Keyboard-driven chat (Enter to send, Shift+Enter for new line)

**Bulk Actions:**
- Multi-select goals for archive/delete
- Batch category changes

## Error Handling

| Scenario | Handling |
|----------|----------|
| Agent unresponsive | "Agent unavailable - try again later" with retry |
| API rate limits | Warning display + automatic throttling |
| Browser-use failure | Fallback to search API + user notification |
| No items found | Agent asks to adjust criteria |
| Account credential error | Re-authenticate prompt |
| Institution maintenance | "Temporarily unavailable - retry in 1 hour" |
| Partial sync | Show success/failure per account |
| Unclear goal | Agent asks follow-up questions |
| Duplicate goal | "Already exists - update existing or create new?" |
| Offline | Cache last-loaded data, show "Reconnecting" |
| Slow loading | 80s-style skeleton screens |
| Sync conflicts | Prompt to resolve (local/remote/merge) |

## Testing Strategy

### Unit Tests (Jest/Vitest)
- GoalCard, GoalDetail, ChatPanel components
- State management slices
- Utility functions

### Integration Tests
- Goal creation flow
- View toggling (list/card)
- Detail navigation (open/close/ESC)
- Action goal task management

### Visual Regression (Chromatic/Percy)
- Component library consistency
- 80s neon aesthetic maintenance
- Responsive design verification

### E2E Tests (RSpec/Capybara)
- Create Item goal via agent chat
- Switch between List and Card views
- Open goal detail, interact with agent, close via ESC
- Add Action goal with tasks, mark complete
- View financial summary widget

### Performance
- Lighthouse audit (target 90+ scores)
- Bundle size monitoring
- Image optimization for thumbnails
- Lazy loading for card grids

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all features
- Screen reader support
- Color contrast verification

## Success Metrics (Post-Launch)

| Metric | Target |
|--------|--------|
| Goal completion rate | 60% |
| User retention (30-day) | 50% |
| Average session time | 10+ minutes |
| Agent satisfaction rating | 4.0/5.0 |
| Mobile usage percentage | 40% |

## Out of Scope (MVP)

- PWA functionality
- Offline mode
- Customizable widgets (beyond financial summary)
- Social features (sharing goals, leaderboards)
- Gamification elements
- Third-party integrations beyond financial aggregation
- AI model fine-tuning

## Dependencies & Constraints

**External Services:**
- LLM provider (OpenAI, Anthropic, etc.)
- Financial institution APIs (future)
- OAuth providers (GitHub, Google)
- Browser-use libraries

**Browser Support:**
- Chrome/Edge: Latest 2 versions
- Safari: Latest 2 versions
- Firefox: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Implementation Phases

### Phase 1: MVP Frontend (Current)
- Complete UI/UX for all three goal categories
- Mobile-first responsive design
- 80s neon aesthetic implementation
- LocalStorage data persistence
- Mock agent responses

### Phase 2: Backend Integration
- Agent Service implementation
- Browser-Use Service for Item Goals
- Goal Management Service
- Database setup and API endpoints

### Phase 3: Finance Integration
- Account linking (manual scrape initially)
- Financial aggregation service
- Plaid/Square integration

### Phase 4: Advanced Features
- Goal-specific chat refinement
- Enhanced persona customization
- Export and reporting features

## Glossary

| Term | Definition |
|------|------------|
| Browser-Use | Automated web browsing for product discovery and price comparison |
| Glassmorphism | UI design pattern with frosted glass effect and transparency |
| PWA | Progressive Web Application |
| OAuth | Open authorization protocol for third-party login |
| Persona | Agent personality and expertise tailored to goal category |
| Split-View | Layout with sidebar navigation + main content + chat panel |
| Zustand | Lightweight state management library for React |

---

**Document Owner:** Goals-AF Team
**Last Updated:** 2025-01-26
**Next Review:** Post-MVP frontend completion
