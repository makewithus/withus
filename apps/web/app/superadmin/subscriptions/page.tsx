'use client';

import React from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

function ComingSoonCard({
  icon: Icon,
  title,
  subtitle,
  badge = 'Coming Soon',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="bg-[#181818] p-5 transition-colors hover:bg-[#1d1d1d]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#242424] text-[#8a8a8a]">
          <Icon className="h-4 w-4" />
        </div>

        <span className="shrink-0 bg-[#3a2f18] px-2.5 py-1 text-[10px] font-medium text-[#d5a83d]">
          {badge}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-[#eeeeee]">{title}</p>
        {subtitle && (
          <p className="mt-1.5 text-xs leading-5 text-[#6f6f6f]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ComingSoonChart({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#181818] p-5 transition-colors hover:bg-[#1d1d1d]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#242424] text-[#8a8a8a]">
          <TrendingUp className="h-4 w-4" />
        </div>

        <span className="shrink-0 bg-[#3a2f18] px-2.5 py-1 text-[10px] font-medium text-[#d5a83d]">
          Coming Soon
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-[#eeeeee]">{title}</p>
        <p className="mt-1.5 max-w-lg text-xs leading-5 text-[#6f6f6f]">
          {description}
        </p>
      </div>

      <div className="mt-6 h-16 bg-[#141414] px-3 py-4">
        <div className="flex h-full items-end gap-1 opacity-40">
          {[30, 44, 36, 52, 46, 62, 54, 70, 64, 78, 68, 84].map(
            (height, index) => (
              <div
                key={index}
                className="flex-1 bg-[#555555]"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-[#242424] text-[#999999]">
              <CreditCard className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Subscriptions & Revenue
            </h2>
          </div>
          <p className="mt-2 text-sm text-[#777777]">
            Plans, billing, revenue analytics, and churn monitoring.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#181818] px-4 py-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b28b35]" />
        <div>
          <p className="text-sm font-medium text-[#dddddd]">
            Billing integration required
          </p>
          <p className="mt-1 text-xs leading-5 text-[#777777]">
            Subscription and revenue data will appear here once the payment
            gateway and subscription infrastructure are connected.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#eeeeee]">Plans Overview</h3>
          <span className="text-xs text-[#555555]">4 metrics</span>
        </div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-4">
          <ComingSoonCard
            icon={Users}
            title="Free Organisations"
            subtitle="Organisations on the Free plan"
          />
          <ComingSoonCard
            icon={Users}
            title="Pro Organisations"
            subtitle="Organisations on the Pro plan"
          />
          <ComingSoonCard
            icon={DollarSign}
            title="MRR"
            subtitle="Monthly recurring revenue"
          />
          <ComingSoonCard
            icon={DollarSign}
            title="ARR"
            subtitle="Annual recurring revenue"
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">
          Customer Activity
        </h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-4">
          <ComingSoonCard
            icon={TrendingUp}
            title="New Subscriptions"
            subtitle="New paid customers this period"
          />
          <ComingSoonCard
            icon={RefreshCw}
            title="Upgrades"
            subtitle="Free → Pro upgrades this period"
          />
          <ComingSoonCard
            icon={TrendingDown}
            title="Downgrades"
            subtitle="Pro → Free downgrades"
          />
          <ComingSoonCard
            icon={AlertCircle}
            title="Cancellations"
            subtitle="Subscription cancellations"
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">
          Revenue Metrics
        </h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-4">
          <ComingSoonCard
            icon={TrendingDown}
            title="Churn Rate"
            subtitle="Customers lost this period"
          />
          <ComingSoonCard
            icon={DollarSign}
            title="ARPO"
            subtitle="Average revenue per organisation"
          />
          <ComingSoonCard
            icon={TrendingUp}
            title="Net Revenue Retention"
            subtitle="Revenue retained after churn"
          />
          <ComingSoonCard
            icon={RefreshCw}
            title="Lifetime Value"
            subtitle="Estimated customer LTV"
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">
          Revenue Analytics
        </h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <ComingSoonChart
            title="MRR Growth"
            description="Monthly recurring revenue trend over time."
          />
          <ComingSoonChart
            title="Free → Pro Conversion"
            description="Conversion rate from Free to Pro over time."
          />
          <ComingSoonChart
            title="Organisation Churn"
            description="Churn rate and churned organisations over time."
          />
          <ComingSoonChart
            title="Subscription Timeline"
            description="Subscriptions, upgrades, downgrades, and cancellations."
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Customers</h3>

        <div className="bg-[#181818] px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#242424] text-[#888888]">
              <CreditCard className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium text-[#eeeeee]">
                Customer Billing Table
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#6f6f6f]">
                Organisation plan status, renewal dates, payment status, and
                billing history will appear after billing integration.
              </p>
            </div>

            <span className="ml-auto shrink-0 bg-[#3a2f18] px-2.5 py-1 text-[10px] font-medium text-[#d5a83d]">
              Billing Required
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}