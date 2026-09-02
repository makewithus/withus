/**
 * WITHUS Subscription & Pricing — Type Definitions
 *
 * These types define the subscription state model.
 * They are intentionally isolated from RBAC permissions.
 *
 * Subscription entitlement ≠ RBAC permission.
 * Do NOT use these types to gate organization actions or modify permissions.ts.
 *
 * Phase 1: Foundation types only. No payment processing.
 * Phase 2: Attach to payment provider implementation.
 */

// ─── Plan Tiers ──────────────────────────────────────────────────────────────

export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS';

export type BillingCycle = 'MONTHLY' | 'ANNUAL';

// ─── Subscription Status ─────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'FREE'       // On free plan (no payment required)
  | 'ACTIVE'     // Paid plan, active
  | 'PENDING'    // Payment initiated, not confirmed
  | 'CANCELLED'  // Cancelled, active until end of period
  | 'EXPIRED'    // Past end date, downgraded to FREE
  | 'PAST_DUE';  // Payment failed, grace period

// ─── Feature Entitlement ─────────────────────────────────────────────────────

/**
 * Feature entitlements per plan.
 * These represent product feature availability — separate from RBAC permissions.
 */
export interface PlanFeatures {
  platformLimit: number;            // Max platforms accessible
  userLimit: number;                // Included users (base)
  adminLimit: number | null;        // Max admins (null = unlimited)
  platformCooldownDays: number;     // Days before platform change allowed (Free plan)
  otpFetching: boolean;             // Gmail OTP extraction
  moduleBasedControl: boolean;      // Module-level UI restrictions
  auditHistory: 'BASIC' | 'FULL' | 'ADVANCED';
  integrationHealthMonitoring: boolean;
  prioritySupport: boolean;
}

// ─── Billing Calculation ─────────────────────────────────────────────────────

export interface BillingCalculation {
  plan: PlanTier;
  billingCycle: BillingCycle;
  activeUsers: number;
  basePrice: number;
  extraUsers: number;
  extraUserRate: number | null;     // null = not yet defined (Business annual)
  extraUsersCharge: number | null;  // null if rate undefined
  totalAmount: number | null;       // null if any component undefined
  currency: 'INR';
}

// ─── Organization Subscription State ────────────────────────────────────────

/**
 * Represents the current subscription state for an organization.
 *
 * Phase 1: Stored in Organization.settings JSON field (temporary).
 * Phase 2: Will migrate to dedicated Subscription DB model without
 *           changing pricing calculations or UI.
 */
export interface OrganizationSubscription {
  plan: PlanTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  activeUsers: number;
  // Payment provider fields (Phase 2 — not used in Phase 1)
  paymentProviderId?: string;       // e.g. Razorpay subscription ID or HDFC reference
  externalSubscriptionId?: string;
  currentPeriodStart?: string;      // ISO date
  currentPeriodEnd?: string;        // ISO date
}

// ─── Payment Provider Interface (Gateway-Independent) ───────────────────────

/**
 * Abstract interface that any payment provider (HDFC, Razorpay, etc.) must implement.
 * Payment gateway is NOT finalized. Do NOT implement this interface yet.
 * Define the boundary only so gateway can be plugged in without rewriting billing logic.
 */
export interface IPaymentProvider {
  readonly name: string;

  /**
   * Create a new subscription for an organization.
   * Returns an external subscription ID from the provider.
   */
  createSubscription(params: {
    orgId: string;
    plan: PlanTier;
    billingCycle: BillingCycle;
    amount: number;
    currency: 'INR';
  }): Promise<{ subscriptionId: string; checkoutUrl?: string }>;

  /**
   * Cancel an existing subscription.
   */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /**
   * Get the current status of a subscription from the provider.
   */
  getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus>;

  /**
   * Update the subscription amount (e.g. when users are added/removed).
   */
  updateSubscriptionAmount(
    subscriptionId: string,
    newAmount: number,
  ): Promise<void>;
}
