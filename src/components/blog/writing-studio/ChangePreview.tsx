'use client';

import { AlertTriangle, Check, Loader2, Undo2, X } from 'lucide-react';
import { UsageNote } from './primitives';
import type { ChangeProposal } from './types';

const applyLabel: Record<ChangeProposal['mode'], string> = {
  replace: 'Use this draft',
  insert: 'Insert at end',
  selection: 'Replace selection',
};

export function ChangePreview({
  proposal,
  onApply,
  onDiscard,
  busy,
}: {
  proposal: ChangeProposal;
  onApply: () => void;
  onDiscard: () => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-xl border border-[#cfd8c6] bg-[#f7faf3] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-5 text-[#2d2e28]">{proposal.label}</p>
          <p className="mt-1 text-xs leading-5 text-[#5f6b56]">{proposal.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-medium text-[#6d7a5e]">
          Not applied
        </span>
      </div>

      {proposal.flags && proposal.flags.length > 0 && (
        <div className="mt-3 rounded-lg bg-[#fdf8ee] px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8a5a33]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Claims to verify before publishing
          </p>
          <ul className="mt-2 space-y-2">
            {proposal.flags.map((flag, index) => (
              <li key={`${index}-${flag.claim}`} className="text-[11.5px] leading-5 text-[#7a6649]">
                <span className="font-medium">“{flag.claim}”</span>
                {flag.reason ? ` — ${flag.reason}` : ''}
                {flag.suggestion ? (
                  <span className="mt-0.5 block text-[#9a8a72]">Suggestion: {flag.suggestion}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {proposal.mode === 'selection' && (
        <div className="mt-3 space-y-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-[#8a8b82]">Before</p>
            <div className="max-h-28 overflow-y-auto rounded-lg border border-[#e8e5dd] bg-white px-3 py-2 text-xs leading-5 text-[#77786f]">
              {proposal.selectionText || 'Selected passage'}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-[#5f7353]">After</p>
            <div
              className="article-prose max-h-40 overflow-y-auto rounded-lg border border-[#cfd8c6] bg-white px-3 py-2 text-[12.5px] leading-5 text-[#2d2e28]"
              dangerouslySetInnerHTML={{ __html: proposal.html }}
            />
          </div>
        </div>
      )}

      {proposal.mode !== 'selection' && (
        <div
          className="article-prose mt-3 max-h-64 overflow-y-auto rounded-lg border border-[#dfe5d7] bg-white px-3.5 py-3 text-[12.5px] leading-6 text-[#2d2e28]"
          dangerouslySetInnerHTML={{ __html: proposal.html }}
        />
      )}

      <UsageNote usage={proposal.usage} label={proposal.label} />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#292a25] px-3.5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#42433c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {applyLabel[proposal.mode]}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d8d4c9] bg-white px-3 py-2.5 text-xs font-medium text-[#5f6058] transition hover:border-[#b8b3a6] disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" /> Discard
        </button>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#7d8c73]">
        <Undo2 className="h-3.5 w-3.5" /> Nothing changes until you apply. Undo with ⌘Z afterwards.
      </p>
    </section>
  );
}
