'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { useVaults } from '../../hooks/useVaults';
import { usePendingApprovals } from '../../hooks/useApprovals';
import {
  useIncomingSessions,
  useOutgoingSessions,
} from '../../hooks/useSessions';
import {
  Shield,
  Key,
  CheckSquare,
  Users,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '../../lib/formatters';
import { SupportCard } from '../common/SupportCard';

export function DashboardSummary() {
  const { organization } = useAuth();
  const orgId = organization?.id || '';

  const { data: vaults } = useVaults(orgId);
  const { data: pendingApprovals } = usePendingApprovals(orgId);
  const { data: incomingSessions } = useIncomingSessions(orgId);
  const { data: outgoingSessions } = useOutgoingSessions(orgId);

  const activeSessions =
    (incomingSessions?.filter((s) => s.status === 'ACTIVE').length ?? 0) +
    (outgoingSessions?.filter((s) => s.status === 'ACTIVE').length ?? 0);

  const stats = [
    {
      label: 'Vaults',
      value: vaults?.items?.length ?? '—',
      icon: Key,
      href: '/vaults',
    },
    {
      label: 'Pending approvals',
      value: pendingApprovals?.length ?? '—',
      icon: CheckSquare,
      href: '/approvals',
    },
    {
      label: 'Active sessions',
      value: activeSessions,
      icon: Users,
      href: '/sessions',
    },
  ];

  const quickActions = [
    {
      label: 'Manage Vaults',
      description: 'Create and manage secure vaults',
      href: '/vaults',
      icon: Key,
    },
    {
      label: 'Sessions',
      description: 'Review active access sessions',
      href: '/sessions',
      icon: Users,
    },
    {
      label: 'Approvals',
      description: 'Review pending requests',
      href: '/approvals',
      icon: CheckSquare,
    },
    {
      label: 'Team',
      description: 'Manage members and access',
      href: '/settings/members',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-full bg-[#111111] text-[#eeeeee] font-sans">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-7 lg:px-8">

        {/* Header */}
        <header className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[#f2f2f2]">
              Dashboard
            </h1>


          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/extension"
              className="
                inline-flex h-9 items-center gap-2
                rounded-md
                bg-[#191919]
                px-4
                text-xs font-medium
                text-[#bdbdbd]
                transition-colors
                hover:bg-[#202020]
                hover:text-white
              "
            >
              Browser Extension
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/vaults"
              className="
                inline-flex h-9 items-center gap-2
                rounded-md
                bg-[#e8e8e8]
                px-4
                text-xs font-semibold
                text-[#111111]
                transition-colors
                hover:bg-white
              "
            >
              <Plus className="h-3.5 w-3.5" />
              New Vault
            </Link>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="
                  group
                  flex min-h-[96px]
                  items-center justify-between
                  bg-[#181818]
                  px-5 py-5
                  transition-colors
                  hover:bg-[#1d1d1d]
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-md
                      bg-[#202020]
                    "
                  >
                    <Icon className="h-4 w-4 text-[#888888]" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#777777]">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-[23px] font-semibold leading-none tracking-tight text-[#eeeeee]">
                      {stat.value}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className="
                    h-4 w-4
                    text-[#4f4f4f]
                    transition-colors
                    group-hover:text-[#999999]
                  "
                />
              </Link>
            );
          })}
        </section>

        {/* Main Content */}
        <main
          className="
            mt-7
            grid grid-cols-1
            gap-7
            xl:grid-cols-[minmax(0,1fr)_320px]
          "
        >
          {/* Recent Vaults */}
          <section className="overflow-hidden bg-[#171717]">
            <div className="flex items-center justify-between px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-[#e7e7e7]">
                  Recent Vaults
                </h2>

              </div>

              <Link
                href="/vaults"
                className="
                  flex items-center gap-1.5
                  text-xs font-medium
                  text-[#777777]
                  transition-colors
                  hover:text-[#dddddd]
                "
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Empty State */}
            {!vaults || vaults.items.length === 0 ? (
              <div
                className="
                  flex min-h-[280px]
                  flex-col items-center justify-center
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    mb-4
                    flex h-11 w-11
                    items-center justify-center
                    rounded-md
                    bg-[#202020]
                  "
                >
                  <Key className="h-4 w-4 text-[#666666]" />
                </div>

                <p className="text-sm font-medium text-[#dddddd]">
                  No vaults yet
                </p>

                <p className="mt-1.5 max-w-xs text-xs leading-5 text-[#666666]">
                  Create your first vault to start managing secure access.
                </p>

                <Link
                  href="/vaults"
                  className="
                    mt-4
                    text-xs font-medium
                    text-[#aaaaaa]
                    transition-colors
                    hover:text-white
                  "
                >
                  Create your first vault →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#141414]">
                      <th className="px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">
                        Vault
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">
                        Description
                      </th>

                      <th className="px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">
                        Created
                      </th>

                      <th className="px-5 py-3.5 text-right text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {vaults.items.slice(0, 6).map((vault) => (
                      <tr
                        key={vault.id}
                        className="
                          group
                          transition-colors
                          hover:bg-[#1c1c1c]
                        "
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/vaults/${vault.id}`}
                            className="flex items-center gap-3"
                          >
                            <div
                              className="
                                flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-md
                                bg-[#202020]
                              "
                            >
                              <Key
                                className="
                                  h-3.5 w-3.5
                                  text-[#777777]
                                  transition-colors
                                  group-hover:text-[#bbbbbb]
                                "
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  max-w-[230px]
                                  truncate
                                  text-sm
                                  font-medium
                                  text-[#dddddd]
                                  transition-colors
                                  group-hover:text-white
                                "
                              >
                                {vault.name}
                              </p>

                              <p className="mt-1 text-[10px] text-[#5f5f5f]">
                                Secure vault
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className="
                              block
                              max-w-[300px]
                              truncate
                              text-xs
                              text-[#777777]
                            "
                          >
                            {vault.description || 'No description'}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-xs text-[#777777]">
                            <Clock3 className="h-3.5 w-3.5 text-[#555555]" />
                            {formatDate(vault.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/vaults/${vault.id}`}
                            className="
                              inline-flex items-center gap-1.5
                              text-xs font-medium
                              text-[#777777]
                              transition-colors
                              hover:text-[#eeeeee]
                            "
                          >
                            Open
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Right Column */}
          <div className="space-y-7">

            {/* Quick Actions */}
            <section className="overflow-hidden bg-[#171717]">
              <div className="px-5 py-5">
                <h2 className="text-sm font-semibold text-[#e7e7e7]">
                  Quick Actions
                </h2>

                <p className="mt-1.5 text-xs text-[#686868]">
                  Common workspace actions
                </p>
              </div>

              <div>
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="
                        group
                        flex items-center gap-3
                        px-5 py-4
                        transition-colors
                        hover:bg-[#1c1c1c]
                      "
                    >
                      <div
                        className="
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-md
                          bg-[#202020]
                        "
                      >
                        <Icon
                          className="
                            h-3.5 w-3.5
                            text-[#777777]
                            transition-colors
                            group-hover:text-[#cccccc]
                          "
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-sm
                            font-medium
                            text-[#d5d5d5]
                            transition-colors
                            group-hover:text-white
                          "
                        >
                          {action.label}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#666666]">
                          {action.description}
                        </p>
                      </div>

                      <ChevronRight
                        className="
                          h-4 w-4
                          text-[#4d4d4d]
                          transition-colors
                          group-hover:text-[#999999]
                        "
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </main>

      </div>
    </div>
  );
}