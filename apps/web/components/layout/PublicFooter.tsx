import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <div className="text-center text-xs text-premium-muted font-medium border-t border-premium/60 mt-12 pt-8">
      <p className="select-none">&copy; {new Date().getFullYear()} makewithus. All rights reserved.</p>
      <div className="mt-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[11px]">
        <Link href="/privacy" className="hover:text-premium-main transition-colors hover:underline">Privacy Policy</Link>
        <span className="text-zinc-300 dark:text-zinc-700 select-none hidden sm:inline">&bull;</span>
        <Link href="/terms" className="hover:text-premium-main transition-colors hover:underline">Terms & Conditions</Link>
        <span className="text-zinc-300 dark:text-zinc-700 select-none hidden sm:inline">&bull;</span>
        <Link href="/security" className="hover:text-premium-main transition-colors hover:underline">Security & Data Protection</Link>
        <span className="text-zinc-300 dark:text-zinc-700 select-none hidden sm:inline">&bull;</span>
        <Link href="/cookie-policy" className="hover:text-premium-main transition-colors hover:underline">Cookie Policy</Link>
        <span className="text-zinc-300 dark:text-zinc-700 select-none hidden sm:inline">&bull;</span>
        <Link href="/refund-policy" className="hover:text-premium-main transition-colors hover:underline">Refund & Cancellation Policy</Link>
      </div>
      <div className="mt-6 pt-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-premium-muted hover:text-premium-main transition-colors hover:underline">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
