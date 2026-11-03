'use client';

import { ChevronDown } from 'lucide-react';
import { formatAiCost, type AiUsageSummary } from '@/lib/ai/usage';

export const primaryButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#292a25] px-3.5 py-2.5 text-[13px] font-medium leading-5 text-white transition hover:bg-[#42433c] disabled:cursor-not-allowed disabled:opacity-40';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d8d4c9] bg-white px-3 py-2 text-xs font-medium leading-4 text-[#4e4f48] transition hover:border-[#b8b3a6] disabled:cursor-not-allowed disabled:opacity-40';

export const ghostButtonClass =
  'inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#6d7a5e] transition hover:underline disabled:opacity-40';

export const studioInputClass =
  'w-full rounded-lg border border-[#e2dfd6] bg-white px-3 py-2.5 text-[13px] leading-5 text-[#2d2e28] outline-none transition placeholder:text-[#a9a79c] focus:border-[#292a25] focus:ring-2 focus:ring-[#292a25]/10';

export function StudioCard({
  title,
  description,
  icon,
  action,
  children,
  tone = 'default',
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'default' | 'muted' | 'accent';
}) {
  const background =
    tone === 'muted' ? 'bg-[#f7f5ee]' : tone === 'accent' ? 'bg-[#f5f7f0]' : 'bg-white';
  return (
    <section className={`rounded-xl border border-[#e6e2d8] ${background} p-4`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            {icon && (
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef0e8] text-[#6d7a5e]">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <p className="text-[13px] font-semibold leading-5 text-[#2d2e28]">{title}</p>
              )}
              {description && (
                <p className="mt-0.5 text-xs leading-5 text-[#85867d]">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StudioField({
  label,
  hint,
  helperText,
  children,
}: {
  label: string;
  hint?: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-medium text-[#6f7067]">{label}</span>
        {hint && <span className="text-[10.5px] font-normal text-[#a2a398]">{hint}</span>}
      </span>
      {children}
      {helperText && (
        <span className="mt-1.5 block text-[10.5px] leading-4 text-[#a2a398]">{helperText}</span>
      )}
    </label>
  );
}

export function UsageNote({
  usage,
  label = 'This action',
}: {
  usage?: AiUsageSummary | null;
  label?: string;
}) {
  if (!usage) return null;
  const tokens = usage.totalTokens ?? (usage.inputTokens !== null || usage.outputTokens !== null
    ? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
    : null);
  const cost = formatAiCost(usage.estimatedCostUsd);
  if (tokens === null && !cost) return null;

  return (
    <p className="mt-2 text-[10.5px] leading-4 text-[#a2a398]">
      {label}: {tokens !== null ? `${tokens.toLocaleString()} tokens` : 'usage recorded'}
      {cost ? ` · ~${cost}` : ''}
    </p>
  );
}

export function UsageTotal({ usage }: { usage: AiUsageSummary }) {
  const tokens = usage.totalTokens;
  const cost = formatAiCost(usage.estimatedCostUsd);
  if (tokens === null && !cost) return null;

  return (
    <p className="flex items-center justify-between gap-3 rounded-lg border border-[#ece9e1] bg-[#fbfaf6] px-3 py-2.5 text-[11px] leading-4 text-[#8a8b82]">
      <span>AI usage this session</span>
      <span className="font-medium text-[#5f6058]">
        {tokens !== null ? `${tokens.toLocaleString()} tokens` : 'Tracked'}
        {cost ? ` · ~${cost}` : ''}
      </span>
    </p>
  );
}

export function StudioDisclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-lg border border-[#e8e5dd] bg-[#fbfaf6]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold leading-5 text-[#5f6058]">
        {summary}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8a8b82] transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-[#ece9e1] px-3 py-2.5">{children}</div>
    </details>
  );
}

export function ChipList({
  values,
  selected,
  onToggle,
}: {
  values: string[];
  selected?: string[];
  onToggle?: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => {
        const active = selected?.includes(value) ?? false;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle?.(value)}
            aria-pressed={active}
            className={`rounded-full border px-2.5 py-1.5 text-[11.5px] leading-4 transition ${
              active
                ? 'border-[#292a25] bg-[#292a25] text-white'
                : 'border-[#e2dfd6] bg-white text-[#5f6058] hover:border-[#b8b3a6]'
            } ${onToggle ? '' : 'cursor-default'}`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
