'use client';

import React from 'react';
import { Shield, Lock, Server, Users, Key, Database, Activity, Search, AlertTriangle } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-premium-bg py-16 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 mb-4">
            <img src="/logo.png" alt="WithUs Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-premium-main sm:text-4xl">Security & Data Protection</h1>
          <div className="flex justify-center mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/50">
              Last Updated: August 24, 2026
            </span>
          </div>
        </div>

        {/* Content Document Wrapper */}
        <div className="premium-card p-8 md:p-12 lg:p-16 space-y-12">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Shield className="w-5 h-5 text-premium-muted" />
              1. Our Security Commitment
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              At WithUs, security is the foundation of our credential delegation architecture. We use technical and organizational measures designed to protect data and credentials.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Key className="w-5 h-5 text-premium-muted" />
              2. Credential Encryption
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                Sensitive credential data handled by the WITHUS Vault is encrypted using <strong>AES-256-GCM</strong> before storage.
              </p>
              <p>
                Data transmission between your browser, the extension, and our services is encrypted in transit using TLS/HTTPS.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Lock className="w-5 h-5 text-premium-muted" />
              3. Access Controls & Authentication
            </h2>
            <ul className="space-y-6 text-base text-premium-muted leading-relaxed font-medium">
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Session Security</strong>
                  Authentication sessions use HTTP-only cookies where implemented, helping prevent client-side JavaScript from directly accessing authentication tokens. The application configures authentication cookies with security attributes including HTTP-only handling and production-specific Secure/SameSite settings where applicable.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Role-Based Access Control (RBAC)</strong>
                  Access to credentials and organizational settings is strictly governed by user roles (Owner, Admin, Member, Delegate).
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Admin Controls</strong>
                  Authorized organization administrators can manage delegated access and revoke applicable sessions according to their assigned permissions.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Search className="w-5 h-5 text-premium-muted" />
              4. Audit Logging
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              makewithus maintains application-level audit records for supported security and account activities. Where captured by the application, audit records may include information such as the organization ID, acting user ID, action performed, resource metadata, and timestamp.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Database className="w-5 h-5 text-premium-muted" />
              5. Infrastructure & Operations
            </h2>
            <ul className="space-y-6 text-base text-premium-muted leading-relaxed font-medium">
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Data Isolation</strong>
                  makewithus uses organization-based logical data separation within its application and database architecture. Organization-scoped records are associated with their respective organization identifiers to support separation between workspaces.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Backup & Recovery</strong>
                  makewithus includes database backup and restoration procedures for PostgreSQL data. The backup tooling uses PostgreSQL <code>pg_dump</code> and includes configurable local backup retention, currently configured for 7 days in the provided scripts.
                  <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client Confirmation</strong>
                      Confirm scheduling, off-site storage, geographic redundancy, and RPO/RTO for the production environment.
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Activity className="w-5 h-5 text-premium-muted" />
              6. Monitoring & Incident Response
            </h2>
            <ul className="space-y-6 text-base text-premium-muted leading-relaxed font-medium">
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Security Monitoring</strong>
                  makewithus implements application-level controls including API rate limiting, audit logging, and application error monitoring. Rate limiting is used to reduce abusive or excessive API requests, while application errors and exceptions can be captured through the configured monitoring integration (Sentry).
                  <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client/Operations Confirmation</strong>
                      Confirm production infrastructure-level monitoring, WAF, firewalls, and IDS/IPS configuration.
                    </span>
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Incident Handling</strong>
                  <div className="mt-2 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client Confirmation</strong>
                      Detail data-breach notification SLA windows, communication channels, and official incident response protocols.
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <PublicFooter />
        </div>

      </div>
    </div>
  );
}
