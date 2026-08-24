'use client';

import React from 'react';
import { Shield, FileText, Settings, Info, AlertTriangle } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-premium-bg py-16 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 mb-4">
            <img src="/logo.png" alt="WithUs Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-premium-main sm:text-4xl">Cookie Policy</h1>
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
              <Info className="w-5 h-5 text-premium-muted" />
              1. What Are Cookies
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              Cookies are small text files that are placed on your computer or mobile device when you access a website or application. We use cookies to make websites work efficiently, securely manage sessions, and provide anonymized usage insights.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Shield className="w-5 h-5 text-premium-muted" />
              2. Essential Cookies
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                WithUs relies primarily on strictly necessary cookies required for the core functionality and security of the platform.
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">Authentication & Security:</strong> We use secure, HTTP-only cookies to maintain your authenticated session. This ensures that session identifiers cannot be accessed by malicious client-side scripts, protecting your workspace from unauthorized access.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-premium-muted mt-2.5 flex-shrink-0"></span>
                  <span>
                    <strong className="text-premium-main">Functionality:</strong> Essential cookies may be used to remember basic session states or interface preferences.
                  </span>
                </li>
              </ul>
              <p>
                Disabling essential authentication cookies may prevent users from signing in or using authenticated portions of the platform.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <Settings className="w-5 h-5 text-premium-muted" />
              3. Analytics & Third-Party Tracking
            </h2>
            <div className="text-base text-premium-muted leading-relaxed font-medium space-y-4">
              <p>
                The current makewithus application does not intentionally use non-essential analytics or marketing tracking cookies based on the presently implemented application configuration. Essential cookies may be used for authentication and core application functionality.
              </p>
              <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="block text-[10px] uppercase tracking-wider mb-1">Pending Client Confirmation</strong>
                  Confirm if any third-party analytics or tracking tools (e.g., Google Analytics, Mixpanel, Vercel Analytics) will be integrated in production.
                </span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-main flex items-center gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
              <FileText className="w-5 h-5 text-premium-muted" />
              4. Your Controls
            </h2>
            <p className="text-base text-premium-muted leading-relaxed font-medium">
              You can instruct your browser to refuse all non-essential cookies or to indicate when a cookie is being sent. However, because our session management relies on essential cookies, disabling all cookies in your browser settings will prevent you from logging into the WithUs platform.
            </p>
          </section>

          <PublicFooter />
        </div>

      </div>
    </div>
  );
}
