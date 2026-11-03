'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  max?: number;
  hint?: string;
};

export function TagInput({
  label,
  values,
  onChange,
  placeholder = 'Add and press Enter',
  max = 20,
  hint,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const candidates = raw
      .split(',')
      .map((value) => value.replace(/\s+/g, ' ').trim().slice(0, 40))
      .filter(Boolean);
    if (!candidates.length) return;
    const existing = new Set(values.map((value) => value.toLowerCase()));
    const next = [...values];
    for (const candidate of candidates) {
      const key = candidate.toLowerCase();
      if (existing.has(key)) continue;
      existing.add(key);
      next.push(candidate);
      if (next.length >= max) break;
    }
    onChange(next.slice(0, max));
    setDraft('');
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-[#6f7067]">
          {label}
        </span>
        {hint && <span className="text-[10.5px] text-[#a2a398]">{hint}</span>}
      </div>
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-[#e2dfd6] bg-white px-2 py-1.5 focus-within:border-[#292a25] focus-within:ring-2 focus-within:ring-[#292a25]/10">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-md bg-[#f1efe8] px-2 py-1 text-[11.5px] font-medium text-[#4c4d45]"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((entry) => entry !== value))}
              className="rounded-full p-0.5 text-[#8a8b82] hover:bg-[#e3e0d7] hover:text-[#292a25]"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {values.length < max && (
          <>
            <input
              value={draft}
              onChange={(event) => {
                const value = event.target.value;
                if (value.includes(',')) commit(value);
                else setDraft(value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commit(draft);
                }
                if (event.key === 'Backspace' && !draft && values.length) {
                  onChange(values.slice(0, -1));
                }
              }}
              onBlur={() => commit(draft)}
              placeholder={values.length ? 'Add another' : placeholder}
              className="min-w-[90px] flex-1 bg-transparent px-1 py-1 text-[12.5px] text-[#292a25] outline-none placeholder:text-[#a9a79c]"
              aria-label={`Add ${label.toLowerCase()}`}
            />
            <Plus className="h-3.5 w-3.5 text-[#b0aea3]" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}
