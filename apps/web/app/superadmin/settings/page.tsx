'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

function SettingRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 bg-[#181818] px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#eeeeee]">{label}</p>
        {note && <p className="mt-1 text-xs leading-5 text-[#777777]">{note}</p>}
      </div>
      <span className="shrink-0 text-sm font-mono text-[#999999] text-right">
        {value}
      </span>
    </div>
  );
}

const configurationControls = [
  { title: 'Rate Limit Editor', desc: 'Adjust request rate limits per endpoint' },
  { title: 'CORS Origin Manager', desc: 'Add or remove allowed CORS origins' },
  { title: 'Session Policy Editor', desc: 'Configure session TTL, max reveals, expiry policy' },
  { title: 'Notification Settings', desc: 'Configure alert thresholds and notification channels' },
  { title: 'Audit Retention Policy', desc: 'Set audit event retention period' },
  { title: 'Platform Feature Flags', desc: 'Enable or disable platform-level features' },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
          Platform Settings
        </h2>
        <p className="mt-1 text-sm text-[#777777]">
          Read-only platform configuration.
        </p>
      </div>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">Current Platform Configuration</h3>
        </div>

        <div className="space-y-px">
          <SettingRow label="Rate Limit — Requests per Window" value="100 requests / 60 seconds" note="Configured in app.module.ts ThrottlerModule" />
          <SettingRow label="JWT Access Token TTL" value="15 minutes" note="Short-lived for security" />
          <SettingRow label="JWT Refresh Token TTL" value="7 days" note="Rotated on each use (refresh token rotation)" />
          <SettingRow label="Session Expiry Scheduler" value="Enabled" note="Expired sessions are automatically cleaned up" />
          <SettingRow label="Credential Encryption" value="AES-256-GCM" note="Envelope encryption with MEK + DEK model" />
          <SettingRow label="CORS" value="Configured" note="Controlled by CORS_ORIGIN env variable" />
          <SettingRow label="Memory Heap Threshold" value="150 MB" note="Monitored via @nestjs/terminus health check" />
          <SettingRow label="Platform Audit Logging" value="Enabled" note="All Super Admin actions are logged to PlatformAuditEvent" />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">Configuration Controls</h3>
        </div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {configurationControls.map((item) => (
            <div
              key={item.title}
              className="flex items-start justify-between gap-4 bg-[#181818] px-5 py-4 transition-colors hover:bg-[#1d1d1d]"
            >
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#777777]">{item.desc}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[#666666]">Coming Soon</span>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-[#181818] px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />
          <p className="text-sm leading-6 text-[#888888]">
            Platform configuration write access will require MFA confirmation,
            a full audit trail, and dedicated security review before being made
            available in the Super Admin portal.
          </p>
        </div>
      </div>
    </div>
  );
}
