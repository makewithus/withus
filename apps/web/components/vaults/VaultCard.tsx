import React from 'react';
import Link from 'next/link';
import { VaultResponse } from '@repo/types';
import { KeyRound, Clock } from 'lucide-react';
import { formatDate } from '../../lib/formatters';

export function VaultCard({ vault }: { vault: VaultResponse }) {
  const createdDate = formatDate(vault.createdAt);

  return (
    <Link
      href={`/vaults/${vault.id}`}
      className="
        block
        group
        overflow-hidden
        bg-[#181818]
        transition-colors
        duration-150
        hover:bg-[#1f1f1f]
      "
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#242424] text-[#a0a0a0] transition-colors group-hover:bg-[#2b2b2b] group-hover:text-[#d0d0d0]">
            <KeyRound className="h-4 w-4" />
          </div>

          <h3 className="min-w-0 truncate text-[15px] font-semibold tracking-[-0.01em] text-[#eeeeee]">
            {vault.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <p className="min-h-[40px] line-clamp-2 text-[13px] leading-5 text-[#858585]">
          {vault.description || 'No description provided.'}
        </p>

        <div className="mt-5 flex items-center text-[11px] font-medium text-[#666666]">
          <Clock className="mr-1.5 h-3.5 w-3.5 shrink-0" />
          <span>Created {createdDate}</span>
        </div>
      </div>
    </Link>
  );
}