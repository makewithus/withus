'use client';

import React from 'react';
import { Shield, Lock, FileText, Server, Users, Mail, AlertTriangle, Link2, Briefcase, FileCheck, DollarSign } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-premium-bg py-16 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 mb-4">
            <img src="/logo.png" alt="WithUs Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-premium-main sm:text-4xl">Terms & Conditions</h1>
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
              1. Eligibility & Acceptance
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              By creating an account, accessing, or using the WithUs platform and associated browser extension, you agree to be bound by these Terms & Conditions. If you are accepting these Terms on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Users className="w-5 h-5 text-premium-muted" />
              2. Account Responsibilities
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              You are strictly responsible for maintaining the confidentiality of your login credentials to the WithUs platform. Any actions taken within your workspace or by authorized delegates fall under the responsibility of the organization owner.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Lock className="w-5 h-5 text-premium-muted" />
              3. Acceptable Use & Credential Responsibility
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                The WithUs platform provides a credential delegation system. You agree not to abuse this system to circumvent legal access controls, scrape data, or perform unauthorized activities on connected platforms.
              </p>
              <p>
                <strong className="text-premium-main">Credential Responsibility:</strong> Users retain full responsibility for the credentials stored within the WITHUS Vault. It is your obligation to ensure these credentials are valid, authorized, and actively monitored for security.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Link2 className="w-5 h-5 text-premium-muted" />
              4. Third-Party Integrations
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                WITHUS provides automated access and autofill capabilities for third-party government and commercial portals (including but not limited to MCA, GST, GitHub, Vercel).
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">No Ownership/Control:</strong> WITHUS does not own, operate, or control these third-party portals.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">Availability:</strong> WITHUS cannot guarantee the availability, uptime, or API stability of these third-party services.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">User Authorization:</strong> Users are strictly responsible for ensuring they possess the legal right and authorization to access the connected accounts.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">No Implied Partnership:</strong> WITHUS should not be represented as an official partner, affiliate, or endorsed vendor of these third-party services unless a formal partnership exists.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <DollarSign className="w-5 h-5 text-premium-muted" />
              5. Subscription & Payment Terms
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                Subscription and payment terms will be provided and detailed here when paid plans or merchant billing functionalities are formally introduced.
              </p>
              <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client Confirmation</strong>
                  Confirm commercial billing rules, pricing cycles, payment terms, and processors once finalized.
                </span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <AlertTriangle className="w-5 h-5 text-premium-muted" />
              6. Suspension & Termination
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                Access to the platform may be suspended or terminated if a violation of these Terms, unauthorized data access, or threat to system infrastructure is detected.
              </p>
              <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Legal/Client Review</strong>
                  Confirm suspension/termination legal policy and notice requirements.
                </span>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <FileCheck className="w-5 h-5 text-premium-muted" />
              7. Legal Safeguards
            </h2>
            <ul className="space-y-6 text-base text-premium-muted leading-relaxed font-medium">
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Intellectual Property</strong>
                  All rights to the WithUs platform and extension belong exclusively to makewithus.
                  <div className="mt-2 p-2 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-md text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>Confirm proprietary rights clauses.</span>
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Liability Limitations</strong>
                  Under no circumstances shall WithUs be liable for indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                  <div className="mt-2 p-2 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-md text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>Confirm standard enterprise liability cap language.</span>
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                <div>
                  <strong className="text-premium-main block mb-1">Governing Law</strong>
                  <div className="mt-2 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client/Legal Confirmation</strong>
                      Jurisdiction / governing law state and region.
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
