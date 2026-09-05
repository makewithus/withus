'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superAdminApi } from '../../../../lib/api/superadmin';
import { ArrowLeft, Building2, Users, Database, Zap, Plug2, Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../../../lib/formatters';

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getOrganizationDetail(params.id as string)
      .then((res) => setOrg(res.data))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-premium-muted text-xs font-semibold gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
      Loading organization details...
    </div>
  );

  if (!org) return (
    <div className="premium-card p-6 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 font-semibold">
      Organization not found.
    </div>
  );

  const owner = org.members?.find((m: any) => m.role === 'OWNER');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="premium-button-secondary py-1.5 px-3 text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Organizations
      </button>

      {/* Header Card */}
      <div className="premium-card p-6 shadow-none space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-premium flex-shrink-0">
            <Building2 className="w-6 h-6 text-premium-main" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-premium-main tracking-tight">{org.name}</h1>
              {org.isActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20 dark:border-emerald-900/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/30 dark:border-red-900/30">
                  <XCircle className="w-3 h-3 mr-1" /> Inactive
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-premium-muted mt-0.5">/{org.slug}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-premium-muted font-medium">
              <span>Created: <strong className="text-premium-main">{formatDate(org.createdAt)}</strong></span>
              <span>Owner: <strong className="text-premium-main">{owner?.user?.email || '—'}</strong></span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-premium">
          {[
            { label: 'Members', value: org._count?.members ?? 0 },
            { label: 'Vaults', value: org._count?.vaults ?? 0 },
            { label: 'Secrets', value: org.secretCount ?? 0 },
            { label: 'Active Sessions', value: org.activeSessionCount ?? 0 },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-2xl font-bold text-premium-main font-number">{s.value}</div>
              <div className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="premium-card p-5 shadow-none space-y-4">
          <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium pb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-premium-muted" /> Organization Members
          </h2>
          <div className="space-y-2">
            {org.members?.slice(0, 10).map((m: any) => (
              <div key={m.user.id} className="flex items-center justify-between py-1 border-b border-premium/50 last:border-b-0">
                <div>
                  <div className="text-xs font-bold text-premium-main">{m.user.fullName || m.user.email}</div>
                  <div className="text-[10px] text-premium-muted font-medium">{m.user.email}</div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-premium-main border border-premium/50">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vaults */}
        <div className="premium-card p-5 shadow-none space-y-4">
          <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium pb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-premium-muted" /> Vaults
          </h2>
          <div className="space-y-2">
            {org.vaults?.slice(0, 8).map((v: any) => (
              <div key={v.id} className="flex items-center justify-between py-1 border-b border-premium/50 last:border-b-0">
                <span className="text-xs font-semibold text-premium-main">{v.name}</span>
                <span className="text-[10px] font-bold text-premium-muted font-number">{v._count?.secrets ?? 0} secrets</span>
              </div>
            ))}
            {org.vaults?.length === 0 && <div className="text-xs text-premium-muted py-2 font-medium">No vaults found.</div>}
          </div>
        </div>

        {/* Integrations */}
        <div className="premium-card p-5 shadow-none space-y-4">
          <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium pb-2 flex items-center gap-1.5">
            <Plug2 className="w-3.5 h-3.5 text-premium-muted" /> Integrations
          </h2>
          {org.integrationConnections?.length === 0 ? (
            <div className="text-xs text-premium-muted py-2 font-medium">No integrations connected.</div>
          ) : org.integrationConnections?.map((ic: any) => (
            <div key={ic.provider} className="flex items-center justify-between py-1 border-b border-premium/50 last:border-b-0">
              <span className="text-xs font-semibold text-premium-main">{ic.provider}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${ic.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/30'}`}>
                {ic.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Audit */}
        <div className="premium-card p-5 shadow-none space-y-4">
          <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium pb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-premium-muted" /> Recent Audit Events
          </h2>
          <div className="space-y-2">
            {org.recentAudit?.slice(0, 6).map((e: any) => (
              <div key={e.id} className="flex items-start justify-between gap-2 py-1 border-b border-premium/50 last:border-b-0">
                <div>
                  <div className="text-[11px] font-mono font-semibold text-premium-main">{e.action}</div>
                  <div className="text-[10px] text-premium-muted font-medium">by {e.actor?.email || 'system'}</div>
                </div>
                <span className="text-[10px] text-premium-muted font-bold whitespace-nowrap">{formatDate(e.createdAt)}</span>
              </div>
            ))}
            {org.recentAudit?.length === 0 && <div className="text-xs text-premium-muted py-2 font-medium">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

