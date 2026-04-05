# Goal Topic / Group Goal Discussion TODO

Date: 2026-04-04

Status: brainstorming notes, not final spec

## Product Direction

- Use `GroupGoal` as the conversational "goal topic" object.
- Keep stacked item cards; do not eliminate them.
- Group goals should support shared conversation plus mixed-type child goals.
- Chat should be able to suggest either:
  - individual goals
  - a group goal containing multiple child goals
- User should be able to decline grouping and create individual goals instead.

## Group Goal Detail View

- Build a dedicated, first-class group goal detail experience.
- Current group goal detail is too close to a simple list.
- Add view controls for `grid` and `list` inside group goal detail.
- Reuse the overview-style card/grid treatment where appropriate.
- Support stacked cards within group detail when children are same-type bundles.

## Stacked Cards

- Expand stacked card concept beyond item goals.
- A stacked card can group goals only when all children inside that stack are the same goal type.
- Preserve stacked item cards for item-build/comparison workflows.
- Define when a same-type stack should be shown as:
  - multiple separate cards
  - one stacked card
  - children inside a group goal

## Agent / Chat Behavior

- Verify agent command/tool support for:
  - creating `GroupGoal`
  - creating mixed-type child goals under a group
  - creating nested groups when needed
- Add proposal flow where agent can infer a multi-part goal and suggest:
  - "create as grouped topic"
  - "create as separate goals"
- Goal-topic chat should live in group goal detail and operate on shared context.

## Demo Mode / Seed Data

- Fix seeded demo data so goal routes have the supporting related objects required by UI.
- Investigate why seeded demo goal pages can land on goal IDs whose chat/history backing objects do not exist.
- Align demo routes, seeded goals, seeded chats, and supporting records.

## Security / Account Isolation

- Fix cross-account financial data leak immediately.
- Audit persisted client stores for user-scoped data surviving identity switches.
- Audit finance/projection/manual-finance fetch paths for stale or wrong-user hydration after login changes.
- Define hard reset behavior when switching between real account and demo account.

## Financial Projections in Demo

- Clarify whether demo projections come from:
  - seeded demo-user linked accounts
  - seeded synthetic projection data
  - manually seeded financial accounts/cashflows
- Ensure reset behavior preserves demo integrity without leaking non-demo user data.
