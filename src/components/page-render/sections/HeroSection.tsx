'use client';

import React from 'react';
import { z } from 'zod';
import { HeroSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { cn } from '@/lib/utils';
import { ArrowRight, MapPin, ExternalLink } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

// ─── Types ─────────────────────────────────────────────────────
type HeroContent = z.infer<typeof HeroSectionSchema>['content'];

type HeroProps = {
  section: z.infer<typeof HeroSectionSchema>;
  theme: ThemeConfig;
};

type SubProps = {
  content: HeroContent;
  theme: ThemeConfig;
};

// ─── Theme Utilities ───────────────────────────────────────────
function getRadius(theme: ThemeConfig) {
  const map: Record<string, string> = {
    none: '0', small: '0.375rem', medium: '0.5rem', large: '0.75rem', full: '9999px',
  };
  return map[theme.radius] || '0.5rem';
}

function getButtonRadius(theme: ThemeConfig) {
  const map: Record<string, string> = {
    none: '0', small: '0.375rem', medium: '0.5rem', large: '0.75rem', full: '9999px',
  };
  return map[theme.radius] || '0.5rem';
}

// ─── Shared Subcomponents ──────────────────────────────────────

function HeroEyebrow({ text, theme, className }: { text?: string; theme: ThemeConfig; className?: string }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        'inline-block text-xs font-semibold uppercase tracking-[0.2em] leading-none',
        className
      )}
      style={{ color: theme.primaryColor }}
    >
      {text}
    </span>
  );
}

function HeroTitle({ text, className }: { text: string; className?: string }) {
  return (
    <h1
      className={cn(
        'font-extrabold tracking-tight text-slate-900 leading-[1.08] [text-wrap:balance]',
        className
      )}
    >
      {text}
    </h1>
  );
}

function HeroHeadline({ text, theme, className }: { text?: string; theme: ThemeConfig; className?: string }) {
  if (!text) return null;
  return (
    <p
      className={cn(
        'font-medium leading-snug text-slate-700',
        className
      )}
    >
      {text}
    </p>
  );
}

function HeroDescription({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn('text-slate-500 leading-relaxed [text-wrap:pretty]', className)}>
      {text}
    </p>
  );
}

function HeroBadge({ text, theme }: { text?: string; theme: ThemeConfig }) {
  if (!text) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
      style={{
        borderColor: theme.primaryColor + '40',
        color: theme.primaryColor,
        backgroundColor: theme.primaryColor + '08',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
      {text}
    </span>
  );
}

function HeroLocation({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400 font-medium">
      <MapPin className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function HeroMetric({ value, label, theme }: { value?: string; label?: string; theme: ThemeConfig }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold tracking-tight" style={{ color: theme.primaryColor }}>{value}</span>
      {label && <span className="text-sm text-slate-400 font-medium">{label}</span>}
    </div>
  );
}

function HeroCTA({ content, theme, variant = 'default', className }: SubProps & { variant?: string; className?: string }) {
  const { buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl } = content;
  if (!buttonText) return null;

  const btnRadius = getButtonRadius(theme);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Primary */}
      <a
        href={buttonUrl || '#'}
        className="group inline-flex items-center justify-center gap-2.5 font-semibold text-white transition-all duration-300 hover:-translate-y-px active:translate-y-0"
        style={{
          backgroundColor: theme.primaryColor,
          borderRadius: btnRadius,
          padding: '0.75rem 1.75rem',
          fontSize: '0.9375rem',
          boxShadow: `0 1px 3px 0 ${theme.primaryColor}20, 0 4px 14px -2px ${theme.primaryColor}30`,
        }}
      >
        {buttonText}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>

      {/* Secondary */}
      {secondaryButtonText && (
        <a
          href={secondaryButtonUrl || '#'}
          className="inline-flex items-center justify-center gap-2 font-semibold text-slate-700 transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
          style={{
            borderRadius: btnRadius,
            padding: '0.75rem 1.75rem',
            fontSize: '0.9375rem',
          }}
        >
          {secondaryButtonText}
        </a>
      )}
    </div>
  );
}

function HeroAvatar({ src, size = 'md', className }: { src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  if (!src) return null;
  const sizeMap = { sm: 'w-14 h-14', md: 'w-20 h-20', lg: 'w-28 h-28', xl: 'w-36 h-36' };
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <img
        src={src}
        alt=""
        className={cn(
          'rounded-full object-cover ring-2 ring-white shadow-lg',
          sizeMap[size]
        )}
      />
    </div>
  );
}

function HeroImage({ src, className, treatment = 'rounded' }: {
  src?: string;
  className?: string;
  treatment?: 'rounded' | 'asymmetric' | 'full' | 'editorial';
}) {
  if (!src) return null;
  const treatments: Record<string, string> = {
    rounded: 'rounded-2xl shadow-2xl',
    asymmetric: 'rounded-[2rem_0.5rem_2rem_0.5rem] shadow-2xl',
    full: 'w-full h-full object-cover',
    editorial: 'rounded-xl shadow-xl',
  };
  return (
    <div className={cn('overflow-hidden', className)}>
      <img
        src={src}
        alt=""
        className={cn('w-full h-full object-cover', treatments[treatment])}
      />
    </div>
  );
}

function HeroSocialLinks({ links, className }: { links?: HeroContent['socialLinks']; className?: string }) {
  if (!links || links.length === 0) return null;
  const iconMap: Record<string, string> = {
    twitter: '𝕏', x: '𝕏', instagram: '⬡', github: '◆', linkedin: 'in',
    youtube: '▶', tiktok: '♪', dribbble: '●', behance: 'Bē', medium: 'M',
    spotify: '♫', facebook: 'f',
  };
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 text-sm font-semibold transition-all duration-200 hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50"
        >
          {iconMap[link.platform.toLowerCase()] || <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      ))}
    </div>
  );
}

// ─── Variant 1: Editorial Center ───────────────────────────────
function EditorialCenter({ content, theme }: SubProps) {
  return (
    <section className="relative w-full px-6 md:px-12 py-20 md:py-32">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${theme.primaryColor}, transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <BlurFade delay={0} inView>
          <div className="flex flex-col items-center gap-5">
            <HeroBadge text={content.badge} theme={theme} />
            <HeroEyebrow text={content.eyebrow} theme={theme} />
          </div>
        </BlurFade>

        <BlurFade delay={0.08} inView>
          <HeroTitle
            text={content.title}
            className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          />
        </BlurFade>

        {content.headline && (
          <BlurFade delay={0.14} inView>
            <HeroHeadline
              text={content.headline}
              theme={theme}
              className="mt-4 text-lg md:text-xl max-w-xl"
            />
          </BlurFade>
        )}

        <BlurFade delay={0.18} inView>
          <HeroDescription
            text={content.subtitle}
            className="mt-4 text-base md:text-lg max-w-lg"
          />
        </BlurFade>

        <BlurFade delay={0.24} inView>
          <HeroCTA content={content} theme={theme} className="mt-8 justify-center" />
        </BlurFade>

        {(content.avatarUrl || content.imageUrl) && (
          <BlurFade delay={0.30} inView>
            <div className="mt-10">
              {content.avatarUrl ? (
                <HeroAvatar src={content.avatarUrl} size="xl" />
              ) : (
                <HeroImage src={content.imageUrl} className="max-w-md" treatment="editorial" />
              )}
            </div>
          </BlurFade>
        )}

        <BlurFade delay={0.34} inView>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <HeroLocation text={content.location} />
            <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} />
          </div>
        </BlurFade>

        <BlurFade delay={0.38} inView>
          <HeroSocialLinks links={content.socialLinks} className="mt-6 justify-center" />
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Variant 2: Split ──────────────────────────────────────────
function SplitHero({ content, theme }: SubProps) {
  const hasImage = content.imageUrl || content.avatarUrl;

  return (
    <section className="relative w-full px-6 md:px-12 py-16 md:py-24">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 md:flex-row md:items-center md:gap-16">
        {/* Left: Text content */}
        <div className="flex flex-1 flex-col items-start text-left">
          <BlurFade delay={0} inView direction="right">
            <div className="flex flex-wrap items-center gap-3">
              <HeroBadge text={content.badge} theme={theme} />
              <HeroEyebrow text={content.eyebrow} theme={theme} />
            </div>
          </BlurFade>

          <BlurFade delay={0.08} inView direction="right">
            <HeroTitle
              text={content.title}
              className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            />
          </BlurFade>

          {content.headline && (
            <BlurFade delay={0.14} inView direction="right">
              <HeroHeadline text={content.headline} theme={theme} className="mt-3 text-lg" />
            </BlurFade>
          )}

          <BlurFade delay={0.18} inView direction="right">
            <HeroDescription text={content.subtitle} className="mt-3 text-base max-w-md" />
          </BlurFade>

          <BlurFade delay={0.24} inView direction="right">
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <HeroLocation text={content.location} />
              <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} />
            </div>
          </BlurFade>

          <BlurFade delay={0.28} inView direction="right">
            <HeroCTA content={content} theme={theme} className="mt-7" />
          </BlurFade>

          <BlurFade delay={0.32} inView direction="right">
            <HeroSocialLinks links={content.socialLinks} className="mt-6" />
          </BlurFade>
        </div>

        {/* Right: Image */}
        {hasImage && (
          <BlurFade delay={0.12} inView direction="left" className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md">
              {/* Soft decorative background shape */}
              <div
                className="absolute -inset-4 rounded-[2rem] opacity-[0.06]"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <img
                src={content.imageUrl || content.avatarUrl}
                alt=""
                className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-xl"
              />
            </div>
          </BlurFade>
        )}
      </div>
    </section>
  );
}

// ─── Variant 3: Immersive ──────────────────────────────────────
function ImmersiveHero({ content, theme }: SubProps) {
  const bgImage = content.imageUrl;

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden">
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </div>
      )}

      {/* Fallback gradient when no image */}
      {!bgImage && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${theme.primaryColor}15 0%, ${theme.primaryColor}05 40%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <BlurFade delay={0.08} inView>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <HeroBadge text={content.badge} theme={theme} />
              <HeroEyebrow
                text={content.eyebrow}
                theme={theme}
                className={bgImage ? '!text-white/70' : ''}
              />
            </div>
          </BlurFade>

          <BlurFade delay={0.14} inView>
            <HeroTitle
              text={content.title}
              className={cn(
                'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
                bgImage ? '!text-white' : ''
              )}
            />
          </BlurFade>

          {content.headline && (
            <BlurFade delay={0.20} inView>
              <HeroHeadline
                text={content.headline}
                theme={theme}
                className={cn('mt-4 text-lg md:text-xl max-w-2xl', bgImage ? '!text-white/80' : '')}
              />
            </BlurFade>
          )}

          <BlurFade delay={0.24} inView>
            <HeroDescription
              text={content.subtitle}
              className={cn('mt-3 text-base md:text-lg max-w-xl', bgImage ? '!text-white/60' : '')}
            />
          </BlurFade>

          <BlurFade delay={0.30} inView>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <HeroCTA content={content} theme={theme} />
              {content.avatarUrl && (
                <div className="flex items-center gap-3">
                  <HeroAvatar src={content.avatarUrl} size="sm" />
                  <HeroLocation text={content.location} />
                </div>
              )}
            </div>
          </BlurFade>

          <BlurFade delay={0.34} inView>
            <HeroSocialLinks
              links={content.socialLinks}
              className={cn('mt-6', bgImage && '[&_a]:border-white/20 [&_a]:text-white/60 [&_a:hover]:text-white [&_a:hover]:border-white/40')}
            />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

// ─── Variant 4: Minimal Profile ────────────────────────────────
function MinimalProfile({ content, theme }: SubProps) {
  return (
    <section className="relative w-full px-6 md:px-12 py-20 md:py-32">
      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
        {content.avatarUrl && (
          <BlurFade delay={0} inView>
            <HeroAvatar src={content.avatarUrl} size="xl" />
          </BlurFade>
        )}

        <BlurFade delay={0.08} inView>
          <HeroBadge text={content.badge} theme={theme} />
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <HeroTitle
            text={content.title}
            className="mt-5 text-3xl sm:text-4xl md:text-5xl"
          />
        </BlurFade>

        {content.headline && (
          <BlurFade delay={0.16} inView>
            <HeroHeadline
              text={content.headline}
              theme={theme}
              className="mt-3 text-base md:text-lg"
            />
          </BlurFade>
        )}

        <BlurFade delay={0.20} inView>
          <HeroDescription text={content.subtitle} className="mt-3 text-sm md:text-base" />
        </BlurFade>

        <BlurFade delay={0.24} inView>
          <div className="mt-4 flex items-center justify-center gap-3">
            <HeroLocation text={content.location} />
            <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} />
          </div>
        </BlurFade>

        <BlurFade delay={0.28} inView>
          <HeroCTA content={content} theme={theme} className="mt-7 justify-center" />
        </BlurFade>

        <BlurFade delay={0.32} inView>
          <HeroSocialLinks links={content.socialLinks} className="mt-6 justify-center" />
        </BlurFade>

        {/* Minimal bottom line */}
        <div className="mt-12 w-12 h-px bg-slate-200" />
      </div>
    </section>
  );
}

// ─── Variant 5: Asymmetric ─────────────────────────────────────
function AsymmetricHero({ content, theme }: SubProps) {
  return (
    <section className="relative w-full px-6 md:px-12 py-16 md:py-28 overflow-hidden">
      {/* Subtle offset glow */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-[0.05] blur-3xl"
        style={{ backgroundColor: theme.primaryColor }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 items-end">
          {/* Left: Text — takes 7 columns, offset from top */}
          <div className="md:col-span-7 flex flex-col items-start">
            <BlurFade delay={0} inView>
              <div className="flex flex-wrap items-center gap-3">
                <HeroEyebrow text={content.eyebrow} theme={theme} />
                <HeroBadge text={content.badge} theme={theme} />
              </div>
            </BlurFade>

            <BlurFade delay={0.10} inView>
              <HeroTitle
                text={content.title}
                className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]"
              />
            </BlurFade>

            {content.headline && (
              <BlurFade delay={0.16} inView>
                <HeroHeadline text={content.headline} theme={theme} className="mt-3 text-lg md:text-xl max-w-lg" />
              </BlurFade>
            )}

            <BlurFade delay={0.20} inView>
              <HeroDescription text={content.subtitle} className="mt-3 text-base max-w-md" />
            </BlurFade>

            <BlurFade delay={0.26} inView>
              <HeroCTA content={content} theme={theme} className="mt-7" />
            </BlurFade>

            <BlurFade delay={0.30} inView>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <HeroLocation text={content.location} />
                <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} />
              </div>
            </BlurFade>

            <BlurFade delay={0.34} inView>
              <HeroSocialLinks links={content.socialLinks} className="mt-5" />
            </BlurFade>
          </div>

          {/* Right: Visual — takes 5 columns, positioned off-center */}
          {(content.imageUrl || content.avatarUrl) && (
            <BlurFade delay={0.14} inView direction="left" className="md:col-span-5 flex justify-end">
              <div className="relative">
                {/* Offset background shape */}
                <div
                  className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl opacity-[0.08]"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                {content.avatarUrl && !content.imageUrl ? (
                  <img
                    src={content.avatarUrl}
                    alt=""
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-xl"
                  />
                ) : (
                  <img
                    src={content.imageUrl}
                    alt=""
                    className="relative w-full max-w-xs md:max-w-sm aspect-[3/4] rounded-[1.5rem_0.5rem_1.5rem_0.5rem] object-cover shadow-xl"
                  />
                )}
              </div>
            </BlurFade>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main Hero Component ───────────────────────────────────────
const VARIANT_MAP: Record<string, React.ComponentType<SubProps>> = {
  'default': EditorialCenter,
  'editorial-center': EditorialCenter,
  'split': SplitHero,
  'immersive': ImmersiveHero,
  'minimal': MinimalProfile,
  'asymmetric': AsymmetricHero,
};

export function HeroSection({ section, theme }: HeroProps) {
  const { content, variant = 'default' } = section;
  const Layout = VARIANT_MAP[variant] || EditorialCenter;

  return <Layout content={content} theme={theme} />;
}
