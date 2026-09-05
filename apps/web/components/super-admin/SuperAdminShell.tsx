'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AuthSession } from '../../lib/auth/session';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  LayoutDashboard, Users, Building2, Zap, Shield,
  LogOut, Menu, Sun, Moon, Monitor, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from 'next-themes';

const CustomAsterisk = ({ className }: { className?: string; strokeWidth?: number }) => (
  <svg
    viewBox="0 0 128 128"
    fill="none"
    className={className}
  >
    <rect x="2" y="2" width="124" height="124" rx="26" fill="#09090b" stroke="#27272a" strokeWidth="4" />
    <g stroke="#ffffff" strokeWidth="10" strokeLinecap="round">
      <line x1="64" y1="28" x2="64" y2="100" />
      <line x1="28" y1="64" x2="100" y2="64" />
      <line x1="44" y1="44" x2="84" y2="84" />
      <line x1="44" y1="84" x2="84" y2="44" />
    </g>
  </svg>
);

const navItems = [
  { name: 'Overview', href: '/superadmin', icon: LayoutDashboard, exact: true },
  { name: 'Users', href: '/superadmin/users', icon: Users },
  { name: 'Organizations', href: '/superadmin/organizations', icon: Building2 },
  { name: 'Sessions', href: '/superadmin/sessions', icon: Zap },
  { name: 'Security / Audit', href: '/superadmin/audit', icon: Shield },
];

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshContext } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sa_sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sa_sidebar_collapsed', String(next));
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleLogout = async () => {
    try {
      const { apiClient } = await import('../../lib/api/client');
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore
    } finally {
      AuthSession.clear();
      refreshContext();
      router.push('/login');
    }
  };

  const activeItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-screen bg-premium-bg font-premium overflow-hidden">
      {/* Sidebar */}
      <div
        className={clsx(
          'bg-[#f4f4f6] dark:bg-[#121214] border-r border-premium flex flex-col transition-all duration-150',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Header / Logo */}
        <div
          className={clsx(
            'h-14 flex items-center border-b border-premium bg-[#f4f4f6] dark:bg-[#121214] pt-1.5',
            isCollapsed ? 'justify-center px-0' : 'pl-6 pr-4'
          )}
        >
          {isCollapsed ? (
            <CustomAsterisk className="w-6 h-6 text-premium-main flex-shrink-0 select-none" strokeWidth={10} />
          ) : (
            <div className="flex items-center gap-1.5 select-none pl-0.5">
              <span className="font-bold text-[17px] tracking-tight text-premium-main">WithUs</span>
              <CustomAsterisk className="w-5 h-5 text-premium-main flex-shrink-0" strokeWidth={10} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={clsx(
                    'relative flex items-center py-2.5 text-[11px] font-bold transition-all duration-150',
                    isCollapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-[var(--accent-lime)] text-[var(--accent-lime-text)] shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      !isCollapsed && 'mr-3',
                      isActive ? 'text-[var(--accent-lime-text)]' : 'text-zinc-400'
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  {!isCollapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-70 text-[var(--accent-lime-text)]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-premium flex flex-col gap-1">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Logout' : undefined}
            className={clsx(
              'flex items-center justify-center py-2.5 text-[11px] font-bold transition-all duration-150 text-zinc-500 hover:text-red-600 hover:bg-red-50/50 border border-transparent hover:border-red-100 dark:hover:bg-red-950/20 dark:hover:border-red-900/50',
              isCollapsed ? 'w-10 h-10 mx-auto' : 'px-3 w-full'
            )}
          >
            <LogOut className={clsx('w-3.5 h-3.5 flex-shrink-0', !isCollapsed && 'mr-2')} />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-premium-bg border-b border-premium flex items-center px-8 shadow-none gap-4 justify-between pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold text-premium-main">
              {activeItem?.name || 'Platform Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300">
              Platform Super Admin
            </span>

            {mounted && (
              <button
                onClick={cycleTheme}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                title={`Active Theme: ${theme || 'system'} (Click to cycle)`}
              >
                {theme === 'light' && <Sun className="w-4 h-4" />}
                {theme === 'dark' && <Moon className="w-4 h-4" />}
                {theme === 'system' && <Monitor className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                  {theme || 'system'}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-premium-bg">
          {children}
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-premium-surface border border-premium p-6 max-w-sm w-full premium-card shadow-2xl relative">
            <h3 className="text-sm font-bold text-premium-main uppercase tracking-wider mb-2">
              Confirm Logout
            </h3>
            <p className="text-xs text-premium-muted mb-6 leading-relaxed">
              You are about to end your WITHUS Platform Admin session.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="premium-button-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 text-xs premium-button-primary border-none"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


