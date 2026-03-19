# TODO - Neon Goals UI

---

## Agent Redirect & Handoff UI

### High Priority — ✅ Complete

- [x] Implement redirect command parser
- [x] Create Redirect Card component (inline in chat)
- [x] Update Chat View to handle redirects
- [x] Implement toast notification system (post-navigation)

### Medium Priority

- [x] Add breadcrumb navigation (GoalBreadcrumb integrated in GoalDetailView)
- [ ] Unsaved draft warnings
- [x] Loading states during redirect (spinner + disabled buttons in RedirectCard)
- [ ] Manual navigation fallback

### Low Priority

- [ ] Redirect analytics

---

## Agent Message Components

### High Priority — ✅ Complete

- [x] Agent Message wrapper component (ChatPanel MessageBubble handles command parsing, proposals, redirects, extractions)
- [x] Proposal Button components (Confirm/Edit/Cancel + Accept/Decline with expand-on-hover)
- [x] Streaming text display
  - [x] Wire streaming APIs (chatStream) into useChatStore for overview, category, and goal chats
  - [x] Replace Send button with Stop button while agent is responding (ChatPanel, SpecialistChatPanel, OverviewChatPage)
  - [x] Render streamed text progressively as chunks arrive (store updates message content incrementally)
  - [x] Fallback to non-streaming chat() on stream error

---

## Chat UX Improvements

### Medium Priority

- [x] Message actions (hover menu on each message)
  - [x] Copy message text to clipboard
  - [x] Like/dislike buttons for feedback
  - [ ] Quote/reply to message
  - [ ] Report incorrect response
  - [ ] Delete own messages

- [ ] Quick actions in chat header (toolbar at top of chat)
- [ ] Input enhancements (suggested questions, slash commands)

---

## Error Handling & Edge Cases

### High Priority

- [ ] Fix swipe-in-scanner logout bug (Demo Mode)

### Medium Priority

- [ ] Network error handling (retry logic)
- [ ] Agent timeout handling
- [ ] Concurrent request handling
- [ ] Goal deletion after redirect (404 graceful handling)

---

## Performance

### Low Priority

- [ ] Chat message virtualization
- [ ] Optimistic UI updates
- [ ] Caching strategies

---

## Documentation

- [ ] Update AGENTS.md with redirect UI patterns
- [ ] Create component storybook

---

## Amazon Cart & Vehicle Upgrades UI

### High Priority

- [ ] Amazon Cart import flow
- [ ] Price change visualization for item goals
  - [ ] Show price as green text if price has decreased from previous scrape
    - `general` for mixed items
    - Other categories as needed
  - [ ] Select which items to import (checkboxes)

- [ ] Vehicle tinting goal creation
  - [ ] "Vehicle Upgrade" goal type using existing `ItemCategory.vehicle`
  - [ ] "Vehicle Parts" goal type using `ItemCategory.vehicle_parts`
  - [ ] Tinting quote input (presets: $70 full, $400 rear, $150 single)
  - [ ] Custom amount option (user enters own quote)
  - [ ] **Use generic `searchFilters` JSON metadata for tinting preferences:**
    ```typescript
    {
      "searchFilters": {
        "windowType": "full_car" | "rear_windows" | "single_windows" | "custom",
        "budget": 70 | 400 | 150  // Optional custom amount
      }
    }
    ```

- [ ] Item grouping UI
  - [ ] Create/edit ItemGroup modal (name, description)
  - [ ] Assign items to groups during Amazon import
  - [ ] Group cards on goal detail page
  - [ ] Drag-and-drop to reorder groups

### Medium Priority

- [ ] Amazon product details integration
  - [ ] Link to Amazon product page from item goal
  - [ ] Show ASIN in goal details
  - [ ] Track current price from Amazon API (if available)

- [ ] Price alert settings
  - [ ] Enable/disable price tracking for Amazon items
  - [ ] Set alert threshold (e.g., drop by $10)
  - [ ] Notification preference (toast, push, email)

- [ ] Tinting progress tracker
  - [ ] Visual progress bar for tinting budget ($0 to $70 for full car)
  - [ ] Save tinting quotes for comparison
  - [ ] Mark completed when full tinting done
  - [ ] **Use `searchFilters` metadata for budget tracking:**
    ```typescript
    {
      "searchFilters": {
        "budget": 70 | 400 | 150  // Preset amounts
        "customBudget": 150  // User-entered custom amount
      }
    }
    ```

### Low Priority

- [ ] Chrome extension connection (if built)
  - [ ] Detect if extension is installed
  - [ ] Pairing flow (scan QR code, enter code)
  - [ ] Status indicator showing extension connected
  - [ ] Auto-import cart when extension detects "Buy Later" page

- [ ] Amazon cart sync (real-time)
  - [ ] WebSocket or polling for cart updates
  - [ ] Live cart item count badge
  - [ ] Quick-add to goals from extension
