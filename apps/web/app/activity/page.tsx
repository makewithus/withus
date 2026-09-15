'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { usePresence } from '../../hooks/usePresence';
import { useOrgMembers } from '../../hooks/useOrganization';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/auth/permissions';
import { 
  Activity, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Globe, 
  CircleDot, 
  ArrowUpDown,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PresenceRecord } from '../../lib/api/presence';

// Presence is considered active within this window (mirrors backend: 90 seconds)
const ACTIVE_WINDOW_MS = 90_000;
const ITEMS_PER_PAGE = 10;

/** Format seconds → "8 sec ago", "1 min ago", "2 hr ago" */
function timeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} hr ago`;
}

interface GroupedMember {
  userId: string;
  name: string;
  email: string;
  platforms: (PresenceRecord & { status: 'ACTIVE' | 'RECENTLY_ACTIVE' | 'OFFLINE'; lastSeenMs: number })[];
  isActive: boolean;
  mostRecentLastSeenAt: number;
}

export default function ActivityPage() {
  const { organization } = useAuth();
  const router = useRouter();
  const orgId = organization?.id ?? null;
  const isAdmin =
    hasPermission(organization?.role, 'PRESENCE_READ');

  // ─── Real-time tick ─────────────────────────────────────────────────────────
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Non-admin members get bounced — presence is admin/owner only
  useEffect(() => {
    if (organization && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [organization, isAdmin, router]);

  // Fetch all organization members to show members without presence history
  const { data: orgMembers, isLoading: isLoadingMembers } = useOrgMembers(orgId || '');
  const { presenceMap, isLoading: isLoadingPresence } = usePresence(orgId, isAdmin);

  // ─── UI & Filter States ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'lastActive' | 'name' | 'platforms'>('lastActive');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  // Reset pagination when search/filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedStatus, sortBy]);

  // Toggle expanded users
  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Collect unique platforms for the filter dropdown
  const allUniquePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    presenceMap.forEach(records => {
      records.forEach(r => platforms.add(r.platform));
    });
    return Array.from(platforms).sort();
  }, [presenceMap]);

  // Combine Org Members & Presence data
  const computedMembers = useMemo(() => {
    if (!orgMembers) return [];

    return orgMembers.map(member => {
      const userId = member.user.id;
      const records = presenceMap.get(userId) || [];

      // Map presence records to their individual statuses and relative times
      const platforms = records.map(r => {
        const lastSeenMs = now - new Date(r.lastSeenAt).getTime();
        let status: 'ACTIVE' | 'RECENTLY_ACTIVE' | 'OFFLINE' = 'OFFLINE';
        if (lastSeenMs <= 45_000) {
          status = 'ACTIVE';
        } else if (lastSeenMs <= 90_000) {
          status = 'RECENTLY_ACTIVE';
        }

        return {
          ...r,
          lastSeenMs,
          status
        };
      }).sort((a, b) => a.lastSeenMs - b.lastSeenMs);

      // User is active if they have at least one active/recently active platform
      const isActive = platforms.some(p => p.status === 'ACTIVE' || p.status === 'RECENTLY_ACTIVE');

      const mostRecentLastSeenAt = platforms.length > 0
        ? Math.max(...platforms.map(p => new Date(p.lastSeenAt).getTime()))
        : 0;

      return {
        userId,
        name: member.user.fullName || 'Unknown User',
        email: member.user.email,
        platforms,
        isActive,
        mostRecentLastSeenAt
      };
    });
  }, [orgMembers, presenceMap, now]);

  // Filter members based on Search Query, Platform, and Status
  const filteredMembers = useMemo(() => {
    return computedMembers
      .map(member => {
        let filteredPlatforms = [...member.platforms];

        // 1. Filter by platform name
        if (selectedPlatform !== 'All') {
          filteredPlatforms = filteredPlatforms.filter(p => p.platform === selectedPlatform);
        }

        // 2. Filter by status
        if (selectedStatus !== 'All') {
          filteredPlatforms = filteredPlatforms.filter(p => {
            if (selectedStatus === 'Active') return p.status === 'ACTIVE';
            if (selectedStatus === 'Recently Active') return p.status === 'RECENTLY_ACTIVE';
            if (selectedStatus === 'Offline') return p.status === 'OFFLINE';
            return true;
          });
        }

        return {
          ...member,
          platforms: filteredPlatforms
        };
      })
      .filter(member => {
        // 3. Search query matching name/email
        const matchesSearch =
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // If a platform filter is active, only show the user if they actually have matching platforms.
        if (selectedPlatform !== 'All' && member.platforms.length === 0) {
          return false;
        }

        // If a status filter is active
        if (selectedStatus !== 'All') {
          if (selectedStatus === 'Offline' && selectedPlatform === 'All' && member.platforms.length === 0 && !member.isActive) {
            return true;
          }
          if (member.platforms.length === 0) {
            return false;
          }
        }

        return true;
      });
  }, [computedMembers, searchQuery, selectedPlatform, selectedStatus]);

  // Sort filtered list
  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
    sorted.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'platforms') {
        return b.platforms.length - a.platforms.length;
      }
      // default: lastActive
      return b.mostRecentLastSeenAt - a.mostRecentLastSeenAt;
    });
    return sorted;
  }, [filteredMembers, sortBy]);

  // Paginate sorted list
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedMembers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / ITEMS_PER_PAGE));

  // Compute overall dashboard stats
  const stats = useMemo(() => {
    const totalMembers = orgMembers?.length ?? 0;
    const currentlyActive = computedMembers.filter(m => m.isActive).length;

    // Distinct platforms currently active across all members
    const activePlatformsSet = new Set<string>();
    computedMembers.forEach(m => {
      m.platforms.forEach(p => {
        if (p.status === 'ACTIVE' || p.status === 'RECENTLY_ACTIVE') {
          activePlatformsSet.add(p.platform);
        }
      });
    });

    const fullyOffline = totalMembers - currentlyActive;

    return {
      totalMembers,
      currentlyActive,
      activePlatforms: activePlatformsSet.size,
      fullyOffline
    };
  }, [orgMembers, computedMembers]);

  // Automatically expand active users on mount/load
  useEffect(() => {
    if (computedMembers.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      computedMembers.forEach(m => {
        if (m.isActive) {
          initialExpanded[m.userId] = true;
        }
      });
      setExpandedUsers(prev => ({ ...initialExpanded, ...prev }));
    }
  }, [computedMembers.length]);

  const isLoading = isLoadingMembers || isLoadingPresence;

    if (!isAdmin) return null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Activity
          </h1>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />

            <input
              type="text"
              placeholder="Search member name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md bg-[#181818] pl-9 pr-3 text-sm text-[#eeeeee] placeholder:text-[#666666] focus:outline-none"
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-9 rounded-md bg-[#181818] px-3 text-sm text-[#aaaaaa] focus:outline-none"
          >
            <option value="All">All Platforms</option>
            {allUniquePlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-md bg-[#181818] px-3 text-sm text-[#aaaaaa] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Recently Active">Recently Active</option>
            <option value="Offline">Offline</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'lastActive' | 'name' | 'platforms')
            }
            className="h-9 rounded-md bg-[#181818] px-3 text-sm text-[#aaaaaa] focus:outline-none"
          >
            <option value="lastActive">Sort: Last Active</option>
            <option value="name">Sort: Name</option>
            <option value="platforms">Sort: Platforms Count</option>
          </select>
        </div>

        {/* Members */}
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-[#181818]"
              />
            ))}
          </div>
        ) : sortedMembers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-7 w-7 text-[#555555]" />
            <p className="text-sm font-medium text-[#aaaaaa]">
              No matching activity found
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {paginatedMembers.map((member) => {
              const isExpanded = !!expandedUsers[member.userId];
              const initials =
                member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U';

              return (
                <div
                  key={member.userId}
                  className="overflow-hidden bg-[#181818]"
                >
                  {/* Member */}
                  <div
                    onClick={() => toggleExpand(member.userId)}
                    className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-[#1e1e1e]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#242424] text-[11px] font-semibold text-[#aaaaaa]">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#eeeeee]">
                          {member.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#666666]">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-xs text-[#777777]">
                        {member.isActive ? 'Currently Active' : 'Offline'}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#666666]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#666666]" />
                      )}
                    </div>
                  </div>

                  {/* Platforms */}
                  {isExpanded && (
                    <div className="bg-[#141414]">
                      {member.platforms.map((record) => (
                        <div
                          key={record.platform}
                          className="flex items-center justify-between px-5 py-3 pl-16 transition-colors hover:bg-[#191919]"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                record.status === 'ACTIVE'
                                  ? 'bg-[#eeeeee]'
                                  : record.status === 'RECENTLY_ACTIVE'
                                    ? 'bg-[#999999]'
                                    : 'bg-[#444444]'
                              }`}
                            />

                            <span className="text-sm text-[#bbbbbb]">
                              {record.platform}
                            </span>

                            <span className="text-xs text-[#666666]">
                              {record.status === 'ACTIVE'
                                ? 'Active'
                                : record.status === 'RECENTLY_ACTIVE'
                                  ? 'Recently active'
                                  : 'Offline'}
                            </span>
                          </div>

                          <span className="text-xs text-[#666666]">
                            Last seen {timeAgo(Math.max(0, record.lastSeenMs))}
                          </span>
                        </div>
                      ))}

                      {member.platforms.length === 0 && (
                        <div className="px-5 py-4 pl-16 text-xs text-[#666666]">
                          No activity recorded for this member.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-[#666666]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                sortedMembers.length
              )}{' '}
              of {sortedMembers.length} members
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181818] text-[#777777] hover:bg-[#202020] hover:text-[#eeeeee] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 text-xs text-[#777777]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181818] text-[#777777] hover:bg-[#202020] hover:text-[#eeeeee] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )}