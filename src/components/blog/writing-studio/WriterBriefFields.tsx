'use client';

import { useState } from 'react';
import { ChevronDown, Compass, Loader2, Sparkles } from 'lucide-react';
import {
  StudioCard,
  StudioField,
  primaryButtonClass,
  studioInputClass,
} from './primitives';
import type { WritingBrief } from './types';

const TONE_SUGGESTIONS = [
  'Practical and friendly',
  'Warm and personal',
  'Clear and authoritative',
  'Conversational',
  'Analytical and precise',
  'Storytelling',
];

export function WriterBriefFields({
  brief,
  onChange,
  onGenerate,
  busy,
}: {
  brief: WritingBrief;
  onChange: (patch: Partial<WritingBrief>) => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const topicValid = brief.topic.trim().length >= 3;

  return (
    <div className="space-y-3">
      <StudioCard
        tone="accent"
        icon={<Compass className="h-3.5 w-3.5" />}
        title="Describe your idea"
        description="One brief is enough. Include what you know, your experience, opinions, examples or key points."
      >
        <div className="mt-4 space-y-4">
          <StudioField label="What do you want to write about?" hint={`${brief.topic.length}/2000`}>
            <textarea
              value={brief.topic}
              onChange={(event) => onChange({ topic: event.target.value.slice(0, 2000) })}
              rows={5}
              autoFocus
              placeholder="e.g. A practical guide for first-time renters in Kathmandu. Include what I learned about budgets, neighbourhoods and the questions to ask before signing."
              className={`${studioInputClass} resize-y`}
            />
          </StudioField>

          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            className="flex w-full items-center justify-between rounded-lg border border-[#e2dfd6] bg-white px-3 py-2.5 text-xs font-medium text-[#5f6058] hover:border-[#b8b3a6]"
            aria-expanded={showDetails}
          >
            <span>Add optional details: audience, tone, examples or CTA</span>
            <ChevronDown className={`h-3.5 w-3.5 transition ${showDetails ? 'rotate-180' : ''}`} />
          </button>

          {showDetails && (
            <div className="space-y-4 rounded-lg border border-[#e8e5dd] bg-[#fbfaf6] p-3">
              <StudioField label="Your experience or opinion">
                <textarea
                  value={brief.experience}
                  onChange={(event) => onChange({ experience: event.target.value.slice(0, 4000) })}
                  rows={3}
                  placeholder="What have you seen, tried or learned? Add a personal story or a strong opinion only you would know."
                  className={`${studioInputClass} resize-y`}
                />
              </StudioField>

              <StudioField label="Important points and examples">
                <textarea
                  value={brief.keyPoints}
                  onChange={(event) => onChange({ keyPoints: event.target.value.slice(0, 4000) })}
                  rows={3}
                  placeholder="Facts, examples or arguments you want covered. One idea per line works well."
                  className={`${studioInputClass} resize-y`}
                />
              </StudioField>

              <div className="grid gap-4">
                <StudioField label="Target audience">
                  <input
                    value={brief.audience}
                    onChange={(event) => onChange({ audience: event.target.value.slice(0, 500) })}
                    placeholder="e.g. First-time renters in their twenties"
                    className={studioInputClass}
                  />
                </StudioField>
                <StudioField label="Purpose">
                  <input
                    value={brief.purpose}
                    onChange={(event) => onChange({ purpose: event.target.value.slice(0, 500) })}
                    placeholder="e.g. Help readers avoid expensive mistakes"
                    className={studioInputClass}
                  />
                </StudioField>
                <StudioField label="Preferred tone" hint="Optional">
                  <input
                    value={brief.tone}
                    onChange={(event) => onChange({ tone: event.target.value.slice(0, 200) })}
                    list="studio-tone-suggestions"
                    placeholder="e.g. Practical and friendly"
                    className={studioInputClass}
                  />
                  <datalist id="studio-tone-suggestions">
                    {TONE_SUGGESTIONS.map((tone) => (
                      <option key={tone} value={tone} />
                    ))}
                  </datalist>
                </StudioField>
                <StudioField label="Business information to use" hint="Facts only">
                  <textarea
                    value={brief.businessInfo}
                    onChange={(event) => onChange({ businessInfo: event.target.value.slice(0, 4000) })}
                    rows={2}
                    placeholder="Anything specific the article may mention: services, location, approach. Leave blank to use your website copy only."
                    className={`${studioInputClass} resize-y`}
                  />
                </StudioField>
                <StudioField label="Call to action">
                  <input
                    value={brief.cta}
                    onChange={(event) => onChange({ cta: event.target.value.slice(0, 500) })}
                    placeholder="e.g. Book a free consultation"
                    className={studioInputClass}
                  />
                </StudioField>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onGenerate}
            disabled={busy || !topicValid}
            className={primaryButtonClass}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate article
          </button>
          {!topicValid && (
            <p className="text-center text-[10.5px] text-[#a2a398]">
              Add at least a short topic to generate an article.
            </p>
          )}
        </div>
      </StudioCard>

      <p className="px-1 text-[11px] leading-5 text-[#a2a398]">
        The studio writes from your brief and website content. You will review the draft before it is
        applied. It never publishes on its own, and factual claims are flagged for you to verify.
      </p>
    </div>
  );
}
