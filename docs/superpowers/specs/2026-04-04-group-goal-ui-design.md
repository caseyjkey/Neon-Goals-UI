# Group Goal UI Design

Date: 2026-04-04
Status: Draft for review
Related backend spec: `../neon-goals-service/docs/superpowers/specs/2026-04-04-group-goal-agent-backend-design.md`

## Summary

This document covers frontend/UI responsibilities for promoting `GroupGoal` into the main conversational goal-topic workspace.

The backend/agent system is responsible for deciding structure and producing draft proposals. The UI is responsible for:

- rendering complex structure proposals clearly in chat
- supporting confirm/edit/cancel flows for multi-goal proposals
- rendering `GroupGoal` detail in `grid` and `list` modes
- rendering same-type stacks appropriately inside group views

## Goals

- Make `GroupGoal` feel like a first-class destination, not a simple folder/detail page.
- Keep proposal UI readable for complex multi-goal structures.
- Reuse existing overview patterns where possible.
- Avoid exposing internal confidence or scoring in the UI.

## Existing UI State

The UI already has:

- `GroupGoal` type support
- `GroupGoalCard`
- `GroupGoalDetail`
- overview grid/list patterns
- stacked item card rendering in overview
- proposal confirm/edit/cancel flows

Current gaps:

- `GroupGoalDetail` behaves like a simple list detail, not a richer group workspace
- stacks are only implemented as item-only overview cards
- proposal rendering is optimized for simple command previews, not structure proposals

## Proposal UI in Chat

### Recommendation

Complex proposals should be rendered as an indented outline rather than as raw commands or a graph-like visual editor.

The proposal should include:

- title
- indented structure
- type labels
- optional notes for uncertain areas
- existing action controls:
  - `Confirm`
  - `Edit`
  - `Cancel`

### Example

Here is the structure I'd create for `Upgrade My Car`:

- `Upgrade My Car` (`GroupGoal`)
  - `Supercharger Parts` (`Item Stack`)
    - `Pulley Kit` (`item`)
    - `Injectors` (`item`)
    - `Intercooler Piping` (`item`)
  - `Car Audio Parts` (`Item Stack`)
    - `Head Unit` (`item`)
    - `Amplifier` (`item`)
    - `Door Speakers` (`item`)
  - `Car Upgrade Budget` (`finance`)
  - `Install Supercharger` (`action`)
  - `Tune and Test` (`action`)

Notes:

- I grouped the audio parts separately from the supercharger parts. If you want, I can split or merge those item groupings before creating everything.

### UI rules

- Never show numeric or word-based confidence in the UI.
- Show uncertainty only as human-readable notes.
- Keep the message compact and scan-friendly.
- Use indentation to denote containment and grouping.
- Use labels like `GroupGoal`, `Item Stack`, `item`, `finance`, `action` to clarify role.

## Proposal Edit UX

The UI may expose editing affordances only if the backend supports them.

Desired edit affordances:

- rename root group
- remove child
- add missing child
- change child type
- move child between stack / standalone
- split one stack into two
- merge two stacks
- convert stacked children to standalone goals

Frontend requirement:

- Do not expose edit controls that the backend/agent tooling cannot execute reliably.

## Group Goal Detail View

### Required change

Add a `grid/list` toggle to `GroupGoalDetail`.

### Grid mode

- Render children using overview-style cards where possible.
- Allow same-type child stacks to render as stacked cards when appropriate.
- Preserve existing dedicated group chat as the conversational surface.

### List mode

- Do not render stacks as one collapsed stacked card.
- Instead, show the underlying child goals individually, similar to overview list behavior.

### Important stack rule

If a group would contain only one stack and no meaningful additional grouping benefit, it should generally render as direct children rather than as a stack-only structure.

Example:

- `Custom Longboard Build` likely renders as direct item children in the group, not one single item stack inside the group.

## Stack Rendering Rules

The UI should treat stacks as contextual grouped presentation of sibling goals.

Rules:

- stacks only make sense when there are at least two sibling goals in the cluster
- stacks should only group same-type goals
- list mode should expand stacks into the individual goals
- grid mode may render stacks as overview-style stacked cards

Future-friendly requirement:

- stacked-card rendering should eventually work for same-type goals beyond items, as long as all goals in the stack share a type

## Demo / Seed Data Expectations

The UI must not assume that a routed goal exists unless the backend confirms it.

Demo requirements for this feature:

- seeded demo routes must point to real backend-backed goals for the current user
- seeded demo group goals must have compatible child data and chat state
- demo examples should distinguish:
  - top-level `GroupGoal`
  - stacks inside a group

## Out of Scope

- displaying confidence scores
- building a graph editor
- redesigning the dedicated group chat surface
- introducing a new persistent generic goal type in the frontend model

## Recommendation

Ship the frontend around these principles:

- `GroupGoal` is the main goal-topic destination
- proposal UI uses an indented outline with notes
- `GroupGoalDetail` gains only a `grid/list` toggle plus stack-aware rendering
- stacks stay contextual and expand to individual goals in list mode
