# Neon Goals UI: Subscriptions PRD + Frontend Design Doc

**Date:** 2026-03-09  
**Owner:** Product + Frontend  
**Status:** Draft for implementation  
**Stack:** React + Zustand + Stripe (Checkout + Customer Portal)

## 1. Executive Summary

Add a subscription system that monetizes clear value in Neon Goals while preserving product trust. Users should see premium value indicators throughout the app, encounter upgrade prompts exactly when a premium action is needed, and always have an obvious way to continue on the free plan.

Premium value to monetize:
- Higher AI message limits
- Access to stronger AI models
- Priority scrape queue for item goals
- Email + SMS alerts for item updates
- API access for agents (OpenClaw integration)

## 2. Product Goals

1. Increase paid conversion without damaging free-user engagement.
2. Make premium value obvious in context (not only on a pricing page).
3. Keep upgrade UX "high-end" and low-friction (fast checkout, polished language, no dead ends).
4. Support self-serve billing lifecycle: subscribe, manage, cancel, reactivate.
5. Provide frontend architecture that cleanly maps to backend entitlements.

## 3. Non-Goals (Phase 1)

- Annual invoicing / enterprise procurement flow
- Multi-seat team billing
- Promo/referral engine
- In-app usage top-ups
- Regional tax customization UI (handled by Stripe defaults)

## 4. Plan Structure (Recommended)

## 4.1 Plans

| Feature | Free | Pro | Power |
|---|---:|---:|---:|
| Monthly AI messages | 100 | 1,000 | 5,000 |
| Model access | Standard only | Standard + Advanced | All (including fastest/premium) |
| Scraping priority | Normal queue | Priority queue | Highest priority queue |
| Item alerts (email) | 0 | 20 active alerts | 100 active alerts |
| Item alerts (SMS) | 0 | 10 active alerts | 50 active alerts |
| API / OpenClaw access | No | Read + limited write | Full API quota |
| Support SLA | Community | Priority | Priority + fastest response |

Notes:
- Replace quotas with final numbers from pricing strategy.
- If only one paid tier is desired, keep `Pro` and drop `Power` while preserving feature-gate architecture.

## 4.2 Entitlement Keys (backend contract)

Frontend should consume normalized entitlements, not infer from plan names.

```ts
export type Entitlements = {
  monthlyMessageLimit: number;
  modelsAllowed: string[];
  scrapePriority: 'normal' | 'priority' | 'highest';
  maxEmailAlerts: number;
  maxSmsAlerts: number;
  apiAccess: boolean;
  openClawAccess: boolean;
};
```

## 5. Core UX Principles

1. Contextual, not aggressive: prompt only when value is immediately relevant.
2. Obvious escape hatch: every paywall modal includes `Continue on Free` (secondary action).
3. Transparent limits: show usage meters before users hit walls.
4. Premium preview: visually distinguish premium capabilities with lock badges + clear benefit text.
5. Trust-first billing: clear trial/price terms, easy cancel, no dark patterns.

## 6. User Experience Design

## 6.1 Surfaces to Add

1. Billing page (`/settings/billing`)
2. Pricing modal (reusable)
3. Contextual upgrade nudges in:
- Chat composer
- Model selector
- Scrape action area
- Alert creation UI
- API/OpenClaw settings area
4. Usage widgets:
- Message counter in chat header/composer
- Alert quota meter in goal settings

## 6.2 Upgrade Prompt Types

1. Soft prompt (informational)
- Trigger: user at 70% and 90% usage
- UI: inline banner with `Upgrade` + dismiss

2. Hard gate (limit reached or premium-only action)
- Trigger examples:
  - user sends message beyond free limit
  - user selects premium model on Free
  - user enables SMS alert on Free
  - user requests API key on Free
- UI: modal sheet with plan comparison and two explicit actions:
  - Primary: `Upgrade`
  - Secondary: `Continue on Free`

3. Success-backed upsell
- Trigger: user gets high-value result (e.g., price drop found)
- UI: subtle CTA, no blocking

## 6.3 High-End UI Guidance

- Clean pricing cards with strong hierarchy and short copy
- Sticky value panel in modal: "What you unlock today"
- Animated usage meter transitions (150-250ms)
- Premium badges near locked controls (`Pro`, `Power`)
- Keep max 1 blocking modal per session per context unless user re-triggers locked action

## 6.4 Escape Hatch Rules

- Every blocking upsell has a visible `Continue on Free` action.
- Free fallback behavior must be explicit:
  - Premium model attempt -> auto-switch to allowed free model with toast
  - Priority scrape attempt -> run normal scrape queue
  - Alert attempt over quota -> allow save without alert
  - API key attempt -> hide key generation, continue app usage normally

## 6.5 Integration Into Current App (Exact Placement)

Current shell behavior:
- `src/App.tsx` routes: `/`, `/settings`, `/goals/:goalId`
- `src/components/chat/ChatSidebar.tsx` + `src/components/chat/ChatPanel.tsx` is persistent chat UI for both overview and goal view
- `src/pages/Settings.tsx` is a single-page settings hub

Recommended implementation in this codebase:
1. Keep `/settings` as the main route and add internal settings tabs (`profile`, `appearance`, `chat`, `notifications`, `billing`, `developer`).
2. Deep-link settings tabs with query param: `/settings?tab=billing` and `/settings?tab=developer`.
3. Add a lightweight modal route state for contextual upgrades (`UpgradeModal` rendered globally from `MainLayout` in `src/App.tsx`).
4. Keep free-path continuity by returning user to the same context after checkout:
- Chat limit gate -> return to same chat mode + restore draft input
- Goal detail gate -> return to same goal URL
- Settings/API gate -> return to same settings tab

## 7. Critical User Flows

## 7.1 Flow A: Message Limit Reached

1. User sends message.
2. Frontend checks usage snapshot.
3. If over limit, block send and open pricing modal.
4. User chooses:
- Upgrade -> Stripe Checkout -> return -> refresh entitlements -> resend draft message option.
- Continue on Free -> keep draft, suggest retry on next cycle date.

## 7.2 Flow B: Premium Model Selection

1. User opens model picker and clicks premium model.
2. If not entitled, show locked state + upgrade modal.
3. Continue on Free auto-selects best allowed model.

## 7.3 Flow C: Enable Alerts

1. User toggles email/SMS alert in item goal.
2. If within quota and entitled, save setting.
3. If not entitled/quota exceeded, show modal with value: "Get instant alerts".
4. Continue on Free leaves toggle off and preserves other goal edits.

## 7.4 Flow D: API/OpenClaw Access

1. User visits Developer/API area.
2. If `apiAccess=false`, show locked panel with feature preview + upgrade CTA.
3. Continue on Free keeps read-only docs access.

## 8. Stripe Integration Design

## 8.1 Stripe Products/Prices

Create Stripe products per plan (monthly required, annual optional):
- `neon_pro_monthly`
- `neon_power_monthly`

Optional trial:
- 7-day trial for new customers only (server-enforced).

## 8.2 Required Backend Endpoints (for frontend integration)

- `GET /billing/entitlements` -> current entitlements + usage
- `POST /billing/checkout-session` -> returns Stripe Checkout URL
- `POST /billing/customer-portal-session` -> returns Stripe Portal URL
- `GET /billing/subscription` -> plan + renewal/cancel state
- `GET /billing/usage` -> detailed counters (messages, alerts, api calls)

Frontend should never call Stripe secret APIs directly.

## 8.3 Webhook-Driven Source of Truth

Backend updates subscription state from Stripe webhooks:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Frontend behavior:
- Poll/refetch entitlements after checkout return
- Show pending state if webhook not yet applied

## 9. Frontend Architecture

## 9.1 Zustand Store Additions

```ts
type BillingState = {
  entitlements: Entitlements | null;
  usage: {
    messagesUsed: number;
    monthlyMessageLimit: number;
    emailAlertsUsed: number;
    smsAlertsUsed: number;
  } | null;
  subscription: {
    plan: 'free' | 'pro' | 'power';
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'free';
    renewsAt?: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  fetchBilling: () => Promise<void>;
  createCheckoutSession: (targetPlan: 'pro' | 'power', context?: string) => Promise<string>;
  openCustomerPortal: () => Promise<string>;
};
```

Use direct subscriptions in components (per existing project guidance).

## 9.2 Route + Component Map

- `src/App.tsx`
- Keep existing `/settings` route; no new top-level billing route required for v1.
- Add global `UpgradeModalHost` in `MainLayout` so any feature can open contextual paywall.
- `src/pages/Settings.tsx`
- Add Billing section/tab with `BillingPlanCards`, `CurrentPlanCard`, `UsageMeter`, `ManageBillingButton`.
- Add Developer/API section/tab with `ApiAccessGate` and OpenClaw copy.
- `src/components/chat/ChatPanel.tsx`
- Add message usage chip above input (`messagesUsed / monthlyMessageLimit`).
- On submit, run entitlement gate before `sendGoalMessage` / `sendOverviewMessage` / `sendCategoryMessage`.
- If blocked: open `UpgradeModal` with context `chat_limit_reached`; keep input draft.
- `src/components/goals/detail/ItemGoalDetail.tsx`
- Add Alerts card (email + SMS toggles + quota text).
- Gate SMS and over-quota alert creation with upgrade modal.
- `src/components/goals/ScrapeStatusCard.tsx`
- Gate priority scrape action and show lock badge when not entitled.
- Fallback to normal scrape queue if user chooses `Continue on Free`.
- `src/components/layout/Sidebar.tsx` and `src/components/auth/AccountDropdown.tsx`
- Add navigation entry to `/settings?tab=billing`.
- Existing sidebar footer `Settings` button should navigate (currently visual-only).
- New components:
- `src/components/billing/UpgradeModal.tsx`
- `src/components/billing/BillingPlanCards.tsx`
- `src/components/billing/UsageMeter.tsx`
- `src/components/billing/FeatureLockBadge.tsx`
- `src/components/billing/ApiAccessGate.tsx`

## 9.3 Store + Service Integration

- New store: `src/store/useBillingStore.ts`
- Holds `entitlements`, `usage`, `subscription`, `upgradeModalState`
- Exposes `openUpgrade(context)`, `closeUpgrade()`, `createCheckoutSession(plan, context)`, `openCustomerPortal()`
- New service: `src/services/billingService.ts`
- Wraps `apiClient` calls to `/billing/*` endpoints
- Hydration points:
- Call `fetchBilling()` after login in `src/App.tsx` alongside `fetchGoals()`
- Refetch billing after Stripe return (`?checkout=success`) and after feature-confirm actions

## 9.4 Behavior Matrix By Existing Component

| Location | Trigger | UI Behavior | Escape Hatch Behavior |
|---|---|---|---|
| `ChatPanel` send | message limit reached | block send + open `UpgradeModal` | keep draft, show reset date |
| `ChatPanel` model select (Settings chat model + future in-chat selector) | premium model on free plan | lock tooltip + upsell modal | auto-switch to allowed model |
| `ScrapeStatusCard` refresh/priority action | priority requested on free | show `Pro` badge + upsell modal | continue with normal queue |
| `ItemGoalDetail` alerts card | SMS/email alert over entitlement | disable toggle + upsell modal | save goal without alert |
| `Settings` developer tab | API key generation | locked API panel + upsell | docs remain readable, no key created |

## 9.5 Feature Gate Utility

```ts
export function canUseFeature(entitlements: Entitlements, feature: 'premium_model' | 'priority_scrape' | 'sms_alerts' | 'api_access') {
  // centralized entitlement checks
}
```

All gates should call one shared utility to prevent inconsistent logic.

## 10. Copy Strategy (Professional, Value-Forward)

Examples:
- "You have 8 messages left this month on Free."
- "Upgrade to Pro for 1,000 monthly messages and priority scraping."
- "Continue on Free" (always visible secondary action)
- "Unlock instant email and text alerts for price drops and listing changes."

Avoid:
- Fear-based or manipulative urgency
- Hiding cancellation terms

## 11. Analytics and Experimentation

Track events:
- `upgrade_prompt_viewed` (context)
- `upgrade_clicked` (context, plan)
- `upgrade_dismissed` (context)
- `checkout_started`
- `checkout_completed`
- `continue_free_clicked`
- `feature_locked_action_attempted`

Primary KPIs:
- Free -> Paid conversion rate
- Prompt-to-checkout conversion by context
- Paid retention (30-day)
- Impact on free-user session length and churn

## 12. Error and Edge Cases

- Stripe checkout canceled -> return with non-blocking toast
- Payment failed -> show billing warning banner + portal CTA
- Entitlements fetch fails -> fail open for read actions; fail closed only on premium execution paths
- Offline mode -> cache last known entitlements with "may be outdated" notice

## 13. Security and Compliance

- JWT-authenticated billing endpoints only
- No card data touches frontend servers (Stripe hosted checkout)
- SMS consent text for alert opt-in (TCPA/region-specific language from legal)
- Audit log entry when API keys are created/revoked

## 14. Rollout Plan

1. Phase 1: UI scaffolding + fake entitlements in dev mode
2. Phase 2: Stripe checkout + portal integration
3. Phase 3: Hard gates for message/model/alerts/API
4. Phase 4: Analytics + A/B tests for prompt timing/copy
5. Phase 5: polish pass (motion, loading, edge states)

## 15. Frontend Acceptance Criteria

1. User can view current plan, usage meters, renewal status, and manage billing.
2. Premium-gated actions show contextual upgrade prompts with visible `Continue on Free`.
3. Checkout and return flow updates entitlements without manual refresh.
4. Locked features are consistently badged and explained.
5. Free fallbacks work for each blocked action.
6. Events are emitted for all upsell and checkout milestones.
7. Mobile and desktop layouts are production-ready and visually consistent.

## 16. Open Questions for Product/Backend

1. Final pricing and quota numbers per plan?
2. Trial strategy: none vs 7-day vs limited-feature trial?
3. Should annual pricing launch in v1?
4. SMS provider and cost controls (hard monthly cap)?
5. API quota model (requests/minute, monthly units, or both)?

## 17. Implementation Starter Checklist (Frontend)

1. Add billing store (`entitlements`, `usage`, `subscription`).
2. Add billing settings route and plan cards.
3. Build reusable `UpgradeModal` with `Continue on Free` secondary action.
4. Integrate gate checks into chat, model picker, scrape actions, alerts UI, API panel.
5. Wire checkout + portal redirects.
6. Add analytics instrumentation.
7. QA on free-path continuity and post-checkout entitlement refresh.

---

## Appendix A: Minimal API Response Shapes

```json
{
  "plan": "free",
  "subscriptionStatus": "free",
  "entitlements": {
    "monthlyMessageLimit": 100,
    "modelsAllowed": ["gpt-standard"],
    "scrapePriority": "normal",
    "maxEmailAlerts": 0,
    "maxSmsAlerts": 0,
    "apiAccess": false,
    "openClawAccess": false
  },
  "usage": {
    "messagesUsed": 64,
    "emailAlertsUsed": 0,
    "smsAlertsUsed": 0,
    "currentPeriodEnd": "2026-04-01T00:00:00.000Z"
  }
}
```

## Appendix B: Upgrade Context Enum

```ts
type UpgradeContext =
  | 'chat_limit_reached'
  | 'premium_model_selected'
  | 'priority_scrape_requested'
  | 'email_alert_requested'
  | 'sms_alert_requested'
  | 'api_access_requested'
  | 'billing_page_cta';
```
