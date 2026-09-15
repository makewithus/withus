'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { 
  Download, 
  FolderArchive, 
  Compass, 
  ToggleRight, 
  FolderOpen, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';

export default function ExtensionPage() {
  const [copiedLink, setCopiedLink] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Download Extension',
      description: 'Get the stable WithUs extension package compiled for your workspace.',
      icon: Download,
      badge: 'ZIP Archive',
    },
    {
      number: 2,
      title: 'Extract the ZIP',
      description: 'Unzip the downloaded archive to a permanent directory on your local machine.',
      icon: FolderArchive,
    },
    {
      number: 3,
      title: 'Open Extension Settings',
      description: 'Navigate to chrome://extensions or edge://extensions in your web browser.',
      icon: Compass,
      actionText: 'Copy Link',
      action: () => {
        navigator.clipboard.writeText('chrome://extensions');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    },
    {
      number: 4,
      title: 'Enable Developer Mode',
      description: 'Turn on the "Developer mode" toggle switch in the top right corner of the extension page.',
      icon: ToggleRight,
    },
    {
      number: 5,
      title: 'Load Unpacked',
      description: 'Click the "Load unpacked" button in the top left corner.',
      icon: FolderOpen,
    },
    {
      number: 6,
      title: 'Select Extracted Folder',
      description: 'Select the unzipped folder. The extension icon will now appear in your browser toolbar!',
      icon: CheckCircle2,
    }
  ];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Browser Extension
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#777777]">
              Install the WithUs browser extension to autofill credentials securely.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://chromewebstore.google.com/detail/withus-vault/ccelghkaoejlmljlhcefnkbcbfmoge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#181818] px-4 py-2.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-[#202020] hover:text-white"
            >
              Chrome Web Store
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="/downloads/WITHUS-Extension.zip"
              className="inline-flex items-center gap-2 bg-[#eeeeee] px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white"
            >
              <Download className="h-4 w-4" />
              Download ZIP
            </a>
          </div>
        </div>

        <div className="bg-[#181818] px-5 py-4">
          <p className="text-sm font-medium text-[#eeeeee]">Chrome Web Store support is coming soon.</p>
          <p className="mt-1 text-sm leading-5 text-[#777777]">
            Until then, install the developer version using the steps below.
          </p>
        </div>

        <section>
          <div className="mb-3">
            <h2 className="text-base font-medium text-[#eeeeee]">Installation</h2>
            <p className="mt-1 text-sm text-[#666666]">
              Follow these steps to load the extension locally.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="bg-[#181818] px-5 py-5 transition-colors hover:bg-[#1d1d1d]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#242424] text-[#aaaaaa]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#555555]">
                          {String(step.number).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-medium text-[#eeeeee]">
                          {step.title}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-5 text-[#777777]">
                        {step.description}
                      </p>

                      {step.number === 1 && (
                        <a
                          href="/downloads/WITHUS-Extension.zip"
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#cccccc] transition-colors hover:text-white"
                        >
                          Download Package
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {step.number === 3 && step.action && (
                        <button
                          type="button"
                          onClick={step.action}
                          className="mt-4 text-xs font-medium text-[#cccccc] transition-colors hover:text-white"
                        >
                          {copiedLink ? 'Copied!' : 'Copy Link'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-[#181818] px-5 py-5">
          <h2 className="text-base font-medium text-[#eeeeee]">
            Verification
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              'WithUs extension badge appears in your browser bar',
              'Clicking the icon shows the WithUs Vault pop-up',
              'Status indicator shows a green dot when logged in',
              'Autofill prompts trigger automatically on supported login pages',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-[#888888]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#bbbbbb]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#181818] px-5 py-5">
          <h2 className="text-base font-medium text-[#eeeeee]">
            Troubleshooting
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-[#dddddd]">
                Extension icon not showing in toolbar?
              </h3>
              <p className="mt-2 text-sm leading-5 text-[#777777]">
                Open the Extensions menu in your browser and pin WithUs Vault to keep it visible.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#dddddd]">
                Autofill prompts not triggering?
              </h3>
              <p className="mt-2 text-sm leading-5 text-[#777777]">
                Open the extension pop-up and confirm that you are signed in. If the status is grey, sign in first.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-2 text-xs text-[#555555]">
          <span>&copy; {new Date().getFullYear()} WithUs</span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#aaaaaa]"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:makewithus.in@gmail.com"
              className="transition-colors hover:text-[#aaaaaa]"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
