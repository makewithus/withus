'use client';

import React from 'react';
import { Ticket, AlertCircle } from 'lucide-react';
import { SupportCard } from '../../../components/common/SupportCard';

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-[#888888]" />
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Support & Help Center
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#777777]">
          Get help with your WithUs account and platform access.
        </p>
      </div>

      {/* Direct Support */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-medium text-[#cccccc]">
            Direct Support
          </h2>
        </div>

        <SupportCard />
      </section>

      {/* Automated Support */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-medium text-[#cccccc]">
            Automated Support
          </h2>
        </div>

        <div className="bg-[#181818] px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />

            <div>
              <p className="text-sm font-medium text-[#eeeeee]">
                Ticketing infrastructure is not available yet
              </p>

              <p className="mt-1 text-sm leading-6 text-[#888888]">
                In-app ticket creation, ticket status tracking, and SLA
                escalation workflows will be integrated when the automated
                ticketing backend is provisioned.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Ticketing */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-medium text-[#cccccc]">
            Support Tickets
          </h2>
        </div>

        <div className="bg-[#181818] px-5 py-8 text-center">
          <Ticket className="mx-auto mb-3 h-5 w-5 text-[#555555]" />

          <p className="text-sm font-medium text-[#eeeeee]">
            Ticketing system not connected
          </p>

          <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-[#777777]">
            Support tickets, issue categories, SLA tracking, and resolution
            metrics will appear here once the ticketing backend is connected.
          </p>

          <p className="mt-3 text-xs font-medium text-[#666666]">
            Future Module
          </p>
        </div>
      </section>
    </div>
  );
}