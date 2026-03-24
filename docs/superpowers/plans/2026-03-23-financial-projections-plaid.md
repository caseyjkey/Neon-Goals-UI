# Financial Projections Plaid Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the financial overview projection UI with real Plaid-backed net worth and cashflow analysis using cached transactions first and balance fallback when transactions are unavailable.

**Architecture:** Move projection computation into the backend `ProjectionsService`, scoped per authenticated user. The service will read active Plaid accounts, analyze cached `PlaidTransaction` rows for recurring income and expenses, and fall back to balance-only estimates when transaction history is missing or sparse. The controller will pass the user ID into overview queries so projections remain account-specific.

**Tech Stack:** NestJS, Prisma, Plaid data already stored in Postgres, Bun test.

---

### Task 1: Add projections analysis tests

**Files:**
- Create: `src/modules/projections/projections.service.test.ts`
- Create: `src/modules/projections/projections.controller.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('builds projections from cached transactions and balance snapshots', () => {
  // assertions for recurring income/expense detection and projected trajectory
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/modules/projections/projections.service.test.ts src/modules/projections/projections.controller.test.ts`
Expected: FAIL because the service is still a placeholder and the controller does not pass a user id to overview.

- [ ] **Step 3: Write minimal implementation**

Implement the smallest backend analysis logic to satisfy the assertions.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/modules/projections/projections.service.test.ts src/modules/projections/projections.controller.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/projections/projections.service.test.ts src/modules/projections/projections.controller.test.ts
git commit -m "test: cover plaid-backed projections"
```

### Task 2: Implement Plaid-backed projection service

**Files:**
- Modify: `src/modules/projections/projections.service.ts`
- Modify: `src/modules/projections/projections.controller.ts`
- Modify: `src/modules/projections/projections.module.ts`

- [ ] **Step 1: Write the failing test**

Use the Task 1 tests as the spec for the service behavior.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/modules/projections/projections.service.test.ts src/modules/projections/projections.controller.test.ts`

- [ ] **Step 3: Write minimal implementation**

Add Prisma access, account classification, cached-transaction analysis, balance fallback, and user-scoped overview routing.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/modules/projections/projections.service.test.ts src/modules/projections/projections.controller.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/modules/projections/projections.service.ts src/modules/projections/projections.controller.ts src/modules/projections/projections.module.ts
git commit -m "feat: back projections with plaid data"
```
