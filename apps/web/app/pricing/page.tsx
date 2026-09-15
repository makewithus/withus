'use client';

import React, { useState } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { useAuth } from '../../lib/auth/AuthContext';
import { useOrgMembers } from '../../hooks/useOrganization';
import {
  Check,
  X,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield,
  Zap,
  Building2,
} from 'lucide-react';
import {
  PRICING_CONFIG,
  PLAN_FEATURES,
  TOTAL_PLATFORM_COUNT,
  CURRENCY_SYMBOL,
  ANNUAL_SAVINGS_LABEL,
} from '../../lib/subscription/pricing.config';
import {
  getBillingCalculation,
  formatINR,
  formatMonthly,
  formatAnnual,
} from '../../lib/subscription/billing';
import type { BillingCycle, PlanTier } from '../../lib/subscription/types';

// ─── Feature Matrix Value Renderer ───────────────────────────────────────────

type FeatureValue = boolean | string | number | null;

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-[#eeeeee]" />;
  }

  if (value === false) {
    return <X className="mx-auto h-4 w-4 text-[#444444]" />;
  }

  return (
    <span className="text-sm font-medium text-[#aaaaaa]">
      {String(value ?? '—')}
    </span>
  );
}

// ─── Main Pricing Page Component ──────────────────────────────────────────────

export default function PricingPage() {
  const { organization } = useAuth();
  const orgId = organization?.id ?? '';
  const { data: membersData } = useOrgMembers(orgId);

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(true);

  // Active users = members where removedAt IS NULL (admins included)
  const activeUsers: number = Array.isArray(membersData)
    ? membersData.filter((m: any) => !m.removedAt).length
    : 1;

  // Current plan — Phase 1: always FREE (no billing backend yet)
  const currentPlan: PlanTier = 'FREE';

  // Pre-compute billing calculations for all plans
  const billing = {
    FREE: getBillingCalculation('FREE', billingCycle, activeUsers),
    PRO: getBillingCalculation('PRO', billingCycle, activeUsers),
    BUSINESS: getBillingCalculation('BUSINESS', billingCycle, activeUsers),
  };

  // ─── Categorized Feature Matrix ─────────────────────────────────────────────

  const featureSections: Array<{
    category: string;
    rows: Array<{
      label: string;
      free: FeatureValue;
      pro: FeatureValue;
      business: FeatureValue;
    }>;
  }> = [
    {
      category: 'Capacity & Pricing',
      rows: [
        {
          label: 'Included Base Users',
          free: `${PRICING_CONFIG.FREE.baseUsers} users`,
          pro: `${PRICING_CONFIG.PRO.baseUsers} users`,
          business: `${PRICING_CONFIG.BUSINESS.baseUsers} users`,
        },
        {
          label: 'Supported Platform Accounts',
          free: `2 of ${TOTAL_PLATFORM_COUNT} platforms`,
          pro: `All ${TOTAL_PLATFORM_COUNT} platforms`,
          business: `All ${TOTAL_PLATFORM_COUNT} platforms`,
        },
        {
          label: 'Extra User Billing Rate',
          free: 'Not allowed',
          pro: `${CURRENCY_SYMBOL}${PRICING_CONFIG.PRO.extraUserMonthly}/user/mo`,
          business: `${CURRENCY_SYMBOL}${PRICING_CONFIG.BUSINESS.extraUserMonthly}/user/mo`,
        },
        {
          label: 'Max Admin Slots Allowed',
          free: `${PLAN_FEATURES.FREE.adminLimit} admin`,
          pro: `${PLAN_FEATURES.PRO.adminLimit} admins`,
          business: 'Unlimited',
        },
      ],
    },
    {
      category: 'Core Security & Automation',
      rows: [
        {
          label: 'Automated OTP Retrieval (Gmail)',
          free: false,
          pro: true,
          business: true,
        },
        {
          label: 'Granular Module-Based Access Control',
          free: false,
          pro: false,
          business: true,
        },
        {
          label: 'Platform Integration Health Checks',
          free: false,
          pro: true,
          business: true,
        },
        {
          label: 'Audit Trail & Event Logging',
          free: 'Basic (Recent)',
          pro: 'Full History',
          business: 'Advanced & Exportable',
        },
      ],
    },
    {
      category: 'Governance & Operations',
      rows: [
        {
          label: 'Platform Selection Change Cooldown',
          free: `${PLAN_FEATURES.FREE.platformCooldownDays} Days`,
          pro: 'Instant (0 Days)',
          business: 'Instant (0 Days)',
        },
        {
          label: 'Dedicated Priority Support',
          free: false,
          pro: true,
          business: true,
        },
      ],
    },
  ];

  // ─── Plan Cards Metadata ───────────────────────────────────────────────────

  const plans: Array<{
    id: PlanTier;
    name: string;
    icon: React.ReactNode;
    tagline: string;
    highlighted: boolean;
    badgeText?: string;
  }> = [
    {
      id: 'FREE',
      name: 'Free',
      icon: <Shield className="w-5 h-5" />,
      tagline: 'Essential access delegation for small teams',
      highlighted: false,
    },
    {
      id: 'PRO',
      name: 'Pro',
      icon: <Zap className="w-5 h-5" />,
      tagline: 'Advanced automation & scaling team access',
      highlighted: true,
      badgeText: 'MOST POPULAR',
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      icon: <Building2 className="w-5 h-5" />,
      tagline: 'Complete module control & priority ops',
      highlighted: false,
    },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
                Subscription & Pricing
              </h1>
              <p className="mt-1 text-sm text-[#777777]">
                Plans and billing for your organization.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-[#555555]">Active members</p>
              <p className="mt-0.5 text-sm font-medium text-[#eeeeee]">
                {activeUsers}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-[#aaaaaa]">Billing cycle</span>

            <div className="flex bg-[#181818] p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 text-sm transition-colors ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#2a2a2a] text-[#eeeeee]'
                    : 'text-[#666666] hover:text-[#aaaaaa]'
                }`}
                id="billing-cycle-monthly"
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-[#2a2a2a] text-[#eeeeee]'
                    : 'text-[#666666] hover:text-[#aaaaaa]'
                }`}
                id="billing-cycle-annual"
              >
                Annual
                <span className="text-xs text-[#888888]">
                  {ANNUAL_SAVINGS_LABEL}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
            {plans.map((plan) => {
              const calc = billing[plan.id];
              const isCurrent = plan.id === currentPlan;

              return (
                <div
                  key={plan.id}
                  className="flex flex-col bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  id={`plan-card-${plan.id.toLowerCase()}`}
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#eeeeee]">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-[#777777]">
                          {plan.tagline}
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="shrink-0 text-xs font-medium text-[#aaaaaa]">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mt-6">
                      {calc.totalAmount === null ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-semibold tracking-tight text-[#eeeeee]">
                              {formatINR(calc.basePrice)}
                            </span>
                            <span className="text-sm text-[#666666]">
                              /{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-[#666666]">
                            Annual extra-user rate pending confirmation
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-semibold tracking-tight text-[#eeeeee]">
                              {formatINR(calc.totalAmount)}
                            </span>
                            <span className="text-sm text-[#666666]">
                              /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                            </span>
                          </div>

                          {plan.id !== 'FREE' && (
                            <p className="mt-2 text-xs text-[#666666]">
                              Base {billingCycle === 'MONTHLY'
                                ? formatMonthly(calc.basePrice)
                                : formatAnnual(calc.basePrice)}
                              {' · '}
                              {PRICING_CONFIG[plan.id].baseUsers} users included
                            </p>
                          )}
                        </div>
                      )}

                      {calc.extraUsers > 0 && (
                        <div className="mt-4 bg-[#111111] px-3 py-2.5">
                          <div className="flex items-center justify-between text-xs text-[#aaaaaa]">
                            <span>Extra users ({calc.extraUsers})</span>
                            <span>
                              +{calc.extraUsersCharge !== null
                                ? formatINR(calc.extraUsersCharge)
                                : 'TBD'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-4 text-[#555555]">
                            {calc.extraUsers} user{calc.extraUsers > 1 ? 's' : ''} above the{' '}
                            {PRICING_CONFIG[plan.id].baseUsers}-user base
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-7">
                      <p className="mb-3 text-xs font-medium text-[#666666]">
                        Included
                      </p>

                      <ul className="space-y-2.5 text-sm text-[#aaaaaa]">
                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                          <span>
                            {PRICING_CONFIG[plan.id].baseUsers} active users
                          </span>
                        </li>

                        <li className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                          <span>
                            {plan.id === 'FREE'
                              ? `Select ${PLAN_FEATURES.FREE.platformLimit} of ${TOTAL_PLATFORM_COUNT} platforms`
                              : `All ${TOTAL_PLATFORM_COUNT} supported platforms`}
                          </span>
                        </li>

                        {plan.id !== 'FREE' && (
                          <li className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                            <span>
                              Extra seats @ {CURRENCY_SYMBOL}
                              {PRICING_CONFIG[plan.id as 'PRO' | 'BUSINESS'].extraUserMonthly}/user/mo
                            </span>
                          </li>
                        )}

                        {PLAN_FEATURES[plan.id].otpFetching && (
                          <li className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                            <span>Automated Gmail OTP extraction</span>
                          </li>
                        )}

                        {PLAN_FEATURES[plan.id].moduleBasedControl && (
                          <li className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                            <span>Module-level element redaction</span>
                          </li>
                        )}

                        {PLAN_FEATURES[plan.id].prioritySupport && (
                          <li className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dddddd]" />
                            <span>Priority operations support</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-auto pt-7">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full bg-[#242424] px-4 py-2.5 text-sm font-medium text-[#777777] cursor-not-allowed"
                          id={`cta-current-${plan.id.toLowerCase()}`}
                        >
                          Active subscription
                        </button>
                      ) : plan.id === 'FREE' ? (
                        <button
                          disabled
                          className="w-full bg-[#242424] px-4 py-2.5 text-sm font-medium text-[#666666] cursor-not-allowed"
                          id={`cta-downgrade-${plan.id.toLowerCase()}`}
                        >
                          Included base tier
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex w-full items-center justify-center gap-2 bg-[#eeeeee] px-4 py-2.5 text-sm font-medium text-[#111111] cursor-not-allowed"
                          id={`cta-upgrade-${plan.id.toLowerCase()}`}
                          title="Payment Gateway Integration Pending"
                        >
                          <Clock className="h-4 w-4" />
                          Upgrade to {plan.name}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#181818] px-5 py-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />
              <div>
                <h4 className="text-sm font-medium text-[#dddddd]">
                  Payment gateway pending
                </h4>
                <p className="mt-1 text-sm leading-5 text-[#666666]">
                  Subscriptions are currently running in evaluation mode. Automated
                  upgrades will be available once the banking gateway integration is authorized.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#181818]">
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#1d1d1d]"
              onClick={() => setShowFeatureMatrix(v => !v)}
              id="feature-matrix-toggle"
            >
              <span className="text-sm font-medium text-[#dddddd]">
                Feature comparison
              </span>
              {showFeatureMatrix ? (
                <ChevronUp className="h-4 w-4 text-[#777777]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#777777]" />
              )}
            </button>

            {showFeatureMatrix && (
              <div className="overflow-x-auto">
                <table
                  className="w-full min-w-[700px] border-collapse text-left"
                  id="feature-comparison-table"
                >
                  <thead>
                    <tr className="bg-[#202020]">
                      <th className="w-5/12 px-5 py-3.5 text-sm font-medium text-[#aaaaaa]">
                        Capability
                      </th>
                      <th className="w-2/12 px-4 py-3.5 text-center text-sm font-medium text-[#777777]">
                        Free
                      </th>
                      <th className="w-2/12 bg-[#292929] px-4 py-3.5 text-center text-sm font-medium text-[#eeeeee]">
                        Pro
                      </th>
                      <th className="w-3/12 px-4 py-3.5 text-center text-sm font-medium text-[#777777]">
                        Business
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureSections.map((section) => (
                      <React.Fragment key={section.category}>
                        <tr>
                          <td
                            colSpan={4}
                            className="bg-[#111111] px-5 pt-6 pb-2 text-xs font-medium text-[#777777]"
                          >
                            {section.category}
                          </td>
                        </tr>

                        {section.rows.map((row) => (
                          <tr
                            key={row.label}
                            className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                          >
                            <td className="px-5 py-3.5 text-sm text-[#aaaaaa]">
                              {row.label}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <FeatureCell value={row.free} />
                            </td>
                            <td className="bg-[#1d1d1d] px-4 py-3.5 text-center">
                              <FeatureCell value={row.pro} />
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <FeatureCell value={row.business} />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
            <div className="bg-[#181818] p-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#777777]" />
                <h4 className="text-sm font-medium text-[#dddddd]">
                  Free tier platform selection
                </h4>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#666666]">
                Free accounts can select any{' '}
                <span className="text-[#aaaaaa]">
                  2 of {TOTAL_PLATFORM_COUNT} supported platforms
                </span>
                . A selected platform can be replaced after the{' '}
                <span className="text-[#aaaaaa]">
                  {PLAN_FEATURES.FREE.platformCooldownDays}-day waiting period
                </span>
                .
              </p>
            </div>

            <div className="bg-[#181818] p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#777777]" />
                <h4 className="text-sm font-medium text-[#dddddd]">
                  Seat calculation
                </h4>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#666666]">
                Subscription totals adjust as active organization members are added
                or removed. Admins and owners count towards the active seat total.
              </p>
            </div>
          </div>

        </div>
    </DashboardShell>
  );
}
