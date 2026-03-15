# Message Feedback And DSPy Data Requirements

## Goal

Add message-level feedback collection to Neon Goals UI so assistant responses can later be used to improve DSPy programs, command generation quality, redirect quality, and prompt content.

This plan focuses on frontend requirements and the expected data the UI should send to the backend. It does not require the backend feedback API to exist yet, but it defines the contract the UI should be built around.

## Why This Exists

The service already persists assistant message metadata for proposal UI state. We want to extend the frontend so each assistant message can capture:

- direct user sentiment (`like`, `dislike`)
- error categories (`wrong_command`, `wrong_redirect`, `not_helpful`, `too_verbose`)
- optional freeform corrections
- proposal outcomes
- redirect outcomes

These signals should later feed DSPy dataset generation and GEPA evaluation.

## Existing Assumptions

- Assistant messages already have stable message IDs.
- Proposal UI state is already stored in assistant message metadata in the service.
- Proposal cards and redirect cards are already rendered by the frontend.
- Redirect cards already expose a navigation action.

## Frontend Requirements

### 1. Assistant Message Menu

Every assistant message bubble should have an overflow/menu button.

Show the menu on:

- hover on desktop
- long press or tap on mobile

Only assistant messages should show this menu.

### 2. Feedback Menu Options

The message menu should include:

- `Like`
- `Dislike`
- `Wrong command`
- `Wrong redirect`
- `Not helpful`
- `Too verbose`
- `Custom feedback`

These options should be available even when the message has no proposal or redirect card.

### 3. Custom Feedback Modal

Selecting `Custom feedback` should open a modal, sheet, or inline panel with:

- `Comment` textarea
- `Suggested better reply` textarea
- `Expected command` input or textarea

All fields are optional except at least one must be non-empty before submit.

### 4. Proposal Outcome Capture

If an assistant message contains a proposal card, the frontend should record one of these outcomes for that message:

- `accepted`
- `declined`
- `edited_before_accept`
- `ignored`

Implementation notes:

- `accepted` should be recorded when the user confirms or accepts the proposal.
- `declined` should be recorded when the user cancels or declines the proposal.
- `edited_before_accept` should be recorded when the user edits proposal fields and then confirms.
- `ignored` should be derived when the proposal remains unresolved and the thread moves on, or from an explicit dismissal if the UI supports one later.

These can be stored as message metadata attributes in the frontend state and also sent to the backend as feedback events. They do not need a separate UI menu item if the proposal card actions already exist.

### 5. Redirect Outcome Capture

If an assistant message contains a redirect card, the frontend should record one of these outcomes for that message:

- `followed`
- `dismissed`

Implementation notes:

- `followed` should be recorded when the user activates the redirect navigation action.
- `dismissed` can be recorded if the UI supports a dismiss/stay action.
- If there is no explicit dismiss action yet, this can start as a metadata-only field that is unset unless the user follows the redirect.

These can also be stored as message metadata attributes in frontend state and sent to the backend as feedback events.

### 6. Optimistic UI Behavior

After a feedback action:

- reflect the choice immediately in local UI state
- avoid duplicate submissions for the same exact action
- allow updating a previous feedback choice

If a later backend API call fails, keep the UI state but mark it as unsynced if needed.

### 7. Message Detail State

The frontend message model should be able to hold:

- `feedback`
- `proposalOutcome`
- `redirectOutcome`
- `feedbackSyncedAt`
- `feedbackPending`

This can live in message metadata or adjacent client state. The important part is preserving the association with the assistant message ID.

## Expected Backend Payload

The frontend should be prepared to send a payload shaped like:

```json
{
  "messageId": "msg_123",
  "chatId": "chat_123",
  "feedbackType": "dislike",
  "reasonTag": "wrong_command",
  "freeformText": "It should have updated filters instead of suggesting a new goal.",
  "suggestedReply": "I can update the Sierra search filters to only show Denali Ultimate models under $100000. Does this look right?",
  "expectedCommand": "UPDATE_FILTERS",
  "proposalOutcome": "edited_before_accept",
  "redirectOutcome": null,
  "createdAt": "2026-03-09T00:00:00.000Z"
}
```

### Field Notes

- `messageId`: required
- `chatId`: required
- `feedbackType`: optional if only recording proposal or redirect outcome
- `reasonTag`: optional classification for dislike or correction flows
- `freeformText`: optional user comment
- `suggestedReply`: optional replacement response text
- `expectedCommand`: optional expected command type or command text
- `proposalOutcome`: optional outcome for proposal-bearing assistant messages
- `redirectOutcome`: optional outcome for redirect-bearing assistant messages
- `createdAt`: client timestamp is acceptable until server timestamps are added

## Suggested Value Enums

### `feedbackType`

- `like`
- `dislike`
- `custom`

### `reasonTag`

- `wrong_command`
- `wrong_redirect`
- `not_helpful`
- `too_verbose`
- `incorrect`
- `other`

### `proposalOutcome`

- `accepted`
- `declined`
- `edited_before_accept`
- `ignored`

### `redirectOutcome`

- `followed`
- `dismissed`

## Analytics / DSPy Notes

These signals are intended to become training and evaluation inputs for later DSPy work:

- likes and dislikes are weak but useful preference signals
- proposal outcomes are strong command-quality signals
- redirect outcomes are strong routing-quality signals
- suggested replies are high-value supervision data
- expected commands are high-value command-generation labels

This means the UI should preserve exact assistant message IDs and not treat feedback as chat-level only.

## Recommended Implementation Order

1. Add assistant message menu UI.
2. Add proposal outcome capture from existing proposal card actions.
3. Add redirect outcome capture from existing redirect card action.
4. Add custom feedback modal.
5. Add client-side message metadata fields for feedback state.
6. Connect to backend feedback endpoint once available.

## Relation To DSPy Roadmap

This frontend work supports later DSPy/GEPA phases, but Phase 1 and Phase 5 can proceed independently:

- Phase 1: convert current prompt surface into DSPy signatures/programs while keeping Nest as runtime
- Phase 5: make Nest consume versioned prompt/program artifacts cleanly

The feedback UI defined here is mainly for the later evaluation and optimization phases.
