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
  textContrast?: 'auto' | 'light' | 'dark';
};

// ─── Contrast Engine ───────────────────────────────────────────
/**
 * Resolves text color classes based on contrast mode.
 * "light" → white text (for dark/image backgrounds)
 * "dark"  → dark text (for light backgrounds)
 * "auto"  → infer from variant context
 */
function useContrastColors(mode: 'auto' | 'light' | 'dark', variant: string) {
  const resolved = mode === 'auto'
    ? (variant === 'immersive' ? 'light' : 'dark')
    : mode;

  return {
    title: resolved === 'light' ? 'text-white' : 'text-slate-900',
    headline: resolved === 'light' ? 'text-white/85' : 'text-slate-700',
    description: resolved === 'light' ? 'text-white/65' : 'text-slate-500',
    eyebrow: resolved === 'light' ? 'text-white/70' : '',
    meta: resolved === 'light' ? 'text-white/50' : 'text-slate-400',
    secondaryBtn: resolved === 'light'
      ? 'text-white border-white/25 hover:border-white/40 hover:bg-white/10'
      : 'text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    socialLink: resolved === 'light'
      ? '[&_a]:border-white/20 [&_a]:text-white/60 [&_a:hover]:text-white [&_a:hover]:border-white/40'
      : '',
    isLight: resolved === 'light',
  };
}

// ─── Theme Utilities ───────────────────────────────────────────
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
        'inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] leading-none',
        className
      )}
      style={!className?.includes('text-white') ? { color: theme.primaryColor } : undefined}
    >
      {text}
    </span>
  );
}

function HeroTitle({ text, className }: { text: string; className?: string }) {
  return (
    <h1
      className={cn(
        'font-serif font-extrabold tracking-tight leading-[1.08] [text-wrap:balance]',
        className
      )}
    >
      {text}
    </h1>
  );
}

function HeroHeadline({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn('font-sans font-medium leading-snug', className)}>
      {text}
    </p>
  );
}

function HeroDescription({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn('font-sans leading-relaxed [text-wrap:pretty]', className)}>
      {text}
    </p>
  );
}

function HeroBadge({ text, theme, isLight }: { text?: string; theme: ThemeConfig; isLight?: boolean }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-sans font-medium',
        isLight && 'border-white/20 bg-white/10 text-white/80'
      )}
      style={!isLight ? {
        borderColor: theme.primaryColor + '40',
        color: theme.primaryColor,
        backgroundColor: theme.primaryColor + '08',
      } : undefined}
    >
      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: isLight ? 'white' : theme.primaryColor }} />
      {text}
    </span>
  );
}

function HeroLocation({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-sans font-medium', className || 'text-slate-400')}>
      <MapPin className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function HeroMetric({ value, label, theme, className }: { value?: string; label?: string; theme: ThemeConfig; className?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold font-sans tracking-tight" style={{ color: theme.primaryColor }}>{value}</span>
      {label && <span className={cn('text-sm font-sans font-medium', className || 'text-slate-400')}>{label}</span>}
    </div>
  );
}

function HeroCTA({ content, theme, colors, className }: SubProps & { colors: ReturnType<typeof useContrastColors>; className?: string }) {
  const { buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl } = content;
  if (!buttonText) return null;

  const btnRadius = getButtonRadius(theme);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Primary */}
      <a
        href={buttonUrl || '#'}
        className="group inline-flex items-center justify-center gap-2.5 font-sans font-semibold text-white transition-all duration-300 hover:-translate-y-px active:translate-y-0"
        style={{
          backgroundColor: theme.primaryColor,
          borderRadius: btnRadius,
          padding: '0.875rem 2rem',
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
          className={cn(
            'inline-flex items-center justify-center gap-2 font-sans font-semibold transition-all duration-300 border',
            colors.secondaryBtn
          )}
          style={{
            borderRadius: btnRadius,
            padding: '0.875rem 2rem',
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
function EditorialCenter({ content, theme, textContrast = 'auto' }: SubProps) {
  const colors = useContrastColors(textContrast, 'editorial-center');

  return (
    <section className="relative w-full px-6 @md:px-12 py-20 @md:py-28 @lg:py-32">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${theme.primaryColor}, transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <BlurFade delay={0} inView>
          <div className="flex flex-col items-center gap-5">
            <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
            <HeroEyebrow text={content.eyebrow} theme={theme} className={colors.eyebrow} />
          </div>
        </BlurFade>

        <BlurFade delay={0.08} inView>
          <HeroTitle
            text={content.title}
            className={cn('mt-5 text-4xl @sm:text-5xl @md:text-6xl @lg:text-7xl', colors.title)}
          />
        </BlurFade>

        {content.headline && (
          <BlurFade delay={0.14} inView>
            <HeroHeadline
              text={content.headline}
              className={cn('mt-5 text-lg @md:text-xl max-w-xl', colors.headline)}
            />
          </BlurFade>
        )}

        <BlurFade delay={0.18} inView>
          <HeroDescription
            text={content.subtitle}
            className={cn('mt-4 text-base @md:text-lg max-w-lg', colors.description)}
          />
        </BlurFade>

        <BlurFade delay={0.24} inView>
          <HeroCTA content={content} theme={theme} colors={colors} className="mt-10 justify-center" />
        </BlurFade>

        {(content.avatarUrl || content.imageUrl) && (
          <BlurFade delay={0.30} inView>
            <div className="mt-14">
              {content.avatarUrl ? (
                <HeroAvatar src={content.avatarUrl} size="xl" />
              ) : (
                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/5">
                  <img src={content.imageUrl} alt="" className="w-full max-w-md h-auto object-cover" />
                </div>
              )}
            </div>
          </BlurFade>
        )}

        {(content.location || content.metric) && (
          <BlurFade delay={0.34} inView>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <HeroLocation text={content.location} className={colors.meta} />
              <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} className={colors.meta} />
            </div>
          </BlurFade>
        )}

        <BlurFade delay={0.38} inView>
          <HeroSocialLinks links={content.socialLinks} className={cn('mt-6 justify-center', colors.socialLink)} />
        </BlurFade>
      </div>
    </section>
  );
}

// ─── Variant 2: Split ──────────────────────────────────────────
function SplitHero({ content, theme, textContrast = 'auto' }: SubProps) {
  const colors = useContrastColors(textContrast, 'split');
  const hasImage = content.imageUrl || content.avatarUrl;

  return (
    <section className="relative w-full px-6 @md:px-12 py-20 @md:py-28 @lg:py-32">
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 @lg:grid-cols-2 @lg:gap-16 @xl:gap-20">
        {/* Left: Text content */}
        <div className="flex flex-col items-start text-left order-1">
          <BlurFade delay={0} inView direction="right">
            <div className="flex flex-wrap items-center gap-3">
              <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
              <HeroEyebrow text={content.eyebrow} theme={theme} className={colors.eyebrow} />
            </div>
          </BlurFade>

          <BlurFade delay={0.08} inView direction="right">
            <HeroTitle
              text={content.title}
              className={cn('mt-5 text-3xl @sm:text-4xl @md:text-5xl @lg:text-6xl', colors.title)}
            />
          </BlurFade>

          {content.headline && (
            <BlurFade delay={0.14} inView direction="right">
              <HeroHeadline text={content.headline} className={cn('mt-4 text-lg', colors.headline)} />
            </BlurFade>
          )}

          <BlurFade delay={0.18} inView direction="right">
            <HeroDescription text={content.subtitle} className={cn('mt-4 text-base max-w-md', colors.description)} />
          </BlurFade>

          <BlurFade delay={0.24} inView direction="right">
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <HeroLocation text={content.location} className={colors.meta} />
              <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} className={colors.meta} />
            </div>
          </BlurFade>

          <BlurFade delay={0.28} inView direction="right">
            <HeroCTA content={content} theme={theme} colors={colors} className="mt-8" />
          </BlurFade>

          <BlurFade delay={0.32} inView direction="right">
            <HeroSocialLinks links={content.socialLinks} className={cn('mt-6', colors.socialLink)} />
          </BlurFade>
        </div>

        {/* Right: Image */}
        {hasImage && (
          <BlurFade delay={0.12} inView direction="left" className="flex justify-center @lg:justify-end order-2">
            <div className="relative w-full max-w-sm @lg:max-w-md">
              {/* Soft decorative background shape */}
              <div
                className="absolute -inset-4 rounded-[2rem] opacity-[0.06]"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <img
                src={content.imageUrl || content.avatarUrl}
                alt=""
                className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl ring-1 ring-slate-900/5"
              />
            </div>
          </BlurFade>
        )}
      </div>
    </section>
  );
}

// ─── Variant 3: Immersive ──────────────────────────────────────
function ImmersiveHero({ content, theme, textContrast = 'auto' }: SubProps) {
  const bgImage = content.imageUrl;
  const colors = useContrastColors(textContrast, 'immersive');

  return (
    <section className="relative w-full min-h-[70vh] @md:min-h-[80vh] flex items-end overflow-hidden">
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Gradient scrim — tuned for guaranteed readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
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

      <div className="relative z-10 w-full px-6 @md:px-12 pb-16 @md:pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <BlurFade delay={0.08} inView>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
              <HeroEyebrow
                text={content.eyebrow}
                theme={theme}
                className={colors.eyebrow}
              />
            </div>
          </BlurFade>

          <BlurFade delay={0.14} inView>
            <HeroTitle
              text={content.title}
              className={cn('text-4xl @sm:text-5xl @md:text-6xl @lg:text-7xl', colors.title)}
            />
          </BlurFade>

          {content.headline && (
            <BlurFade delay={0.20} inView>
              <HeroHeadline
                text={content.headline}
                className={cn('mt-5 text-lg @md:text-xl max-w-2xl', colors.headline)}
              />
            </BlurFade>
          )}

          <BlurFade delay={0.24} inView>
            <HeroDescription
              text={content.subtitle}
              className={cn('mt-4 text-base @md:text-lg max-w-xl', colors.description)}
            />
          </BlurFade>

          <BlurFade delay={0.30} inView>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <HeroCTA content={content} theme={theme} colors={colors} />
              {(content.avatarUrl || content.location || content.metric) && (
                <div className="flex items-center gap-4">
                  {content.avatarUrl && <HeroAvatar src={content.avatarUrl} size="sm" />}
                  <div className="flex items-center gap-4">
                    <HeroLocation text={content.location} className={colors.meta} />
                    <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} className={colors.meta} />
                  </div>
                </div>
              )}
            </div>
          </BlurFade>

          <BlurFade delay={0.34} inView>
            <HeroSocialLinks
              links={content.socialLinks}
              className={cn('mt-6', colors.socialLink)}
            />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

// ─── Variant 4: Minimal Profile ────────────────────────────────
function MinimalProfile({ content, theme, textContrast = 'auto' }: SubProps) {
  const colors = useContrastColors(textContrast, 'minimal');

  return (
    <section className="relative w-full px-6 @md:px-12 py-20 @md:py-28 @lg:py-32">
      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
        {content.avatarUrl && (
          <BlurFade delay={0} inView>
            <HeroAvatar src={content.avatarUrl} size="xl" />
          </BlurFade>
        )}

        <BlurFade delay={0.08} inView>
          <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <HeroTitle
            text={content.title}
            className={cn('mt-5 text-3xl @sm:text-4xl @md:text-5xl', colors.title)}
          />
        </BlurFade>

        {content.headline && (
          <BlurFade delay={0.16} inView>
            <HeroHeadline
              text={content.headline}
              className={cn('mt-4 text-base @md:text-lg', colors.headline)}
            />
          </BlurFade>
        )}

        <BlurFade delay={0.20} inView>
          <HeroDescription text={content.subtitle} className={cn('mt-3 text-sm @md:text-base', colors.description)} />
        </BlurFade>

        <BlurFade delay={0.24} inView>
          <div className="mt-5 flex items-center justify-center gap-3">
            <HeroLocation text={content.location} className={colors.meta} />
            <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} className={colors.meta} />
          </div>
        </BlurFade>

        <BlurFade delay={0.28} inView>
          <HeroCTA content={content} theme={theme} colors={colors} className="mt-8 justify-center" />
        </BlurFade>

        <BlurFade delay={0.32} inView>
          <HeroSocialLinks links={content.socialLinks} className={cn('mt-6 justify-center', colors.socialLink)} />
        </BlurFade>

        {/* Minimal bottom line */}
        <div className="mt-14 w-12 h-px bg-slate-200" />
      </div>
    </section>
  );
}

// ─── Variant 5: Asymmetric ─────────────────────────────────────
function AsymmetricHero({ content, theme, textContrast = 'auto' }: SubProps) {
  const colors = useContrastColors(textContrast, 'asymmetric');

  return (
    <section className="relative w-full px-6 @md:px-12 py-20 @md:py-28 @lg:py-32 overflow-hidden">
      {/* Subtle offset glow */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-[0.05] blur-3xl"
        style={{ backgroundColor: theme.primaryColor }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 @lg:grid-cols-12 gap-12 @lg:gap-8 items-center @lg:items-end">
          {/* Left: Text — takes 7 columns */}
          <div className="@lg:col-span-7 flex flex-col items-start">
            <BlurFade delay={0} inView>
              <div className="flex flex-wrap items-center gap-3">
                <HeroEyebrow text={content.eyebrow} theme={theme} className={colors.eyebrow} />
                <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
              </div>
            </BlurFade>

            <BlurFade delay={0.10} inView>
              <HeroTitle
                text={content.title}
                className={cn('mt-5 text-4xl @sm:text-5xl @md:text-6xl @lg:text-[4.5rem]', colors.title)}
              />
            </BlurFade>

            {content.headline && (
              <BlurFade delay={0.16} inView>
                <HeroHeadline text={content.headline} className={cn('mt-4 text-lg @md:text-xl max-w-lg', colors.headline)} />
              </BlurFade>
            )}

            <BlurFade delay={0.20} inView>
              <HeroDescription text={content.subtitle} className={cn('mt-4 text-base max-w-md', colors.description)} />
            </BlurFade>

            <BlurFade delay={0.26} inView>
              <HeroCTA content={content} theme={theme} colors={colors} className="mt-8" />
            </BlurFade>

            <BlurFade delay={0.30} inView>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <HeroLocation text={content.location} className={colors.meta} />
                <HeroMetric value={content.metric} label={content.metricLabel} theme={theme} className={colors.meta} />
              </div>
            </BlurFade>

            <BlurFade delay={0.34} inView>
              <HeroSocialLinks links={content.socialLinks} className={cn('mt-5', colors.socialLink)} />
            </BlurFade>
          </div>

          {/* Right: Visual — takes 5 columns */}
          {(content.imageUrl || content.avatarUrl) && (
            <BlurFade delay={0.14} inView direction="left" className="@lg:col-span-5 flex justify-center @lg:justify-end w-full mt-8 @lg:mt-0">
              <div className="relative w-full max-w-sm @lg:max-w-none flex justify-center @lg:block">
                {/* Offset background shape */}
                <div
                  className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl opacity-[0.08]"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                {content.avatarUrl && !content.imageUrl ? (
                  <img
                    src={content.avatarUrl}
                    alt=""
                    className="relative w-48 h-48 @sm:w-64 @sm:h-64 rounded-2xl object-cover shadow-2xl ring-1 ring-slate-900/5"
                  />
                ) : (
                  <img
                    src={content.imageUrl}
                    alt=""
                    className="relative w-full aspect-[3/4] @sm:max-w-xs @lg:max-w-sm rounded-[1.5rem_0.5rem_1.5rem_0.5rem] object-cover shadow-2xl ring-1 ring-slate-900/5"
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

  // Read textContrast from section metadata (defaults to 'auto')
  const textContrast = (section as any).textContrast || 'auto';

  return <Layout content={content} theme={theme} textContrast={textContrast} />;
}
