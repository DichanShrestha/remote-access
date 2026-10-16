'use client';

import React, { useRef, useState, useEffect } from 'react';
import { z } from 'zod';
import { HeroSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { cn } from '@/lib/utils';
import { ArrowRight, MapPin, ExternalLink } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { motion, useScroll, useTransform } from 'motion/react';

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
  backgroundColor?: string;
  textColor?: string;
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
        data-page-button
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
          data-page-button
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
// ---------------------------------------------------------------------------
// ImmersiveHero
// Fixes:
//  - Height capped with svh so the next section peeks in on any screen
//  - Scrim runs left-to-right (where the text is) plus a light bottom fade
//  - Description/eyebrow forced to readable light colors over images
//  - CTA gets a visible ring so a navy button doesn't vanish on a dark photo
//  - Text column is narrower so the photo stays visible on the right
// ---------------------------------------------------------------------------
function ImmersiveHero({ content, theme, textContrast = 'auto' }: SubProps) {
  const bgImage = content.imageUrl;
  const colors = useContrastColors(textContrast, 'immersive');

  // Only override colors when a photo is behind the text and the user
  // hasn't explicitly chosen a contrast mode.
  const overImage = Boolean(bgImage) && textContrast === 'auto';

  return (
    <section
      className={cn(
        'relative w-full flex items-end overflow-hidden',
        // svh = stable viewport height (no mobile URL-bar jump).
        // The cap stops the hero from swallowing tall monitors, so the
        // next section is always visible and the page clearly continues.
        'min-h-[min(72svh,640px)] @md:min-h-[min(80svh,720px)]'
      )}
    >
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
          {/* Scrim 1: horizontal, dark where the text sits, clear on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/5" />
          {/* Scrim 2: gentle bottom fade for the CTA row */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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

      <div className="relative z-10 w-full px-6 @md:px-12 pb-14 @md:pb-20 pt-24 @md:pt-32">
        <div className="mx-auto max-w-5xl">
          <BlurFade delay={0.08} inView>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <HeroBadge text={content.badge} theme={theme} isLight={colors.isLight} />
              <HeroEyebrow
                text={content.eyebrow}
                theme={theme}
                className={cn(colors.eyebrow, overImage && 'text-white/80')}
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
            <BlurFade delay={0.2} inView>
              <HeroHeadline
                text={content.headline}
                className={cn(
                  'mt-5 text-lg @md:text-xl max-w-2xl',
                  colors.headline,
                  overImage && 'text-white'
                )}
              />
            </BlurFade>
          )}

          <BlurFade delay={0.24} inView>
            <HeroDescription
              text={content.subtitle}
              className={cn(
                'mt-4 text-base @md:text-lg max-w-xl',
                colors.description,
                // Was gray on a photo: the weakest element. Now near-white.
                overImage && 'text-white/85'
              )}
            />
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <div className="mt-8 @md:mt-10 flex flex-wrap items-center gap-6">
              {/*
                The ring keeps both buttons visible on a dark photo.
                Better long-term fix: give HeroCTA an "onImage" variant with
                a white primary button and a white-outline secondary.
              */}
              <div
                className={cn(
                  'contents',
                  overImage &&
                  '[&_a]:ring-1 [&_a]:ring-white/40 [&_button]:ring-1 [&_button]:ring-white/40'
                )}
              >
                <HeroCTA content={content} theme={theme} colors={colors} />
              </div>

              {(content.avatarUrl || content.location || content.metric) && (
                <div className="flex items-center gap-4">
                  {content.avatarUrl && <HeroAvatar src={content.avatarUrl} size="sm" />}
                  <div className="flex items-center gap-4">
                    <HeroLocation
                      text={content.location}
                      className={cn(colors.meta, overImage && 'text-white/75')}
                    />
                    <HeroMetric
                      value={content.metric}
                      label={content.metricLabel}
                      theme={theme}
                      className={cn(colors.meta, overImage && 'text-white/75')}
                    />
                  </div>
                </div>
              )}
            </div>
          </BlurFade>

          <BlurFade delay={0.34} inView>
            <HeroSocialLinks
              links={content.socialLinks}
              className={cn('mt-6', colors.socialLink, overImage && 'text-white/75')}
            />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SplitHero
// Fixes:
//  - Image fills its column (no max-w-md cap) and the grid leans toward it
//  - Wider crop (4/3 mobile, 5/4 desktop) so the photo keeps its context
//  - No dead zone: column gap tightened, image no longer pushed to far edge
//  - Decorative shape is an even, intentional offset that can't read as a glitch
//  - Vertical padding reduced
//  - Image is not wrapped in the animated element that shifts the shape
// ---------------------------------------------------------------------------
function SplitHero({ content, theme, textContrast = 'auto', wide = false }: SubProps & { wide?: boolean }) {
  const colors = useContrastColors(textContrast, 'split');
  const imageSrc = content.imageUrl || content.avatarUrl;
  const hasImage = Boolean(imageSrc);

  return (
    <section className={cn('relative w-full', wide ? 'px-0 py-0' : 'px-6 py-14 @md:px-12 @md:py-20 @lg:py-24')}>
      <div
        className={cn(
          'relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10',
          hasImage
            ? '@lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @lg:gap-12 @xl:gap-16'
            : 'max-w-3xl',
          wide && hasImage && 'mx-0 max-w-none items-stretch gap-0 @lg:grid-cols-2'
        )}
      >
        {/* Left: Text content */}
        <div className={cn('order-1 flex flex-col items-start text-left', wide && 'justify-center px-8 py-14 @md:px-12 @lg:px-16 @xl:px-24')}>
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
              <HeroHeadline
                text={content.headline}
                // Slightly heavier than the description so the two levels read differently
                className={cn('mt-4 text-lg @md:text-xl font-medium', colors.headline)}
              />
            </BlurFade>
          )}

          <BlurFade delay={0.18} inView direction="right">
            <HeroDescription
              text={content.subtitle}
              className={cn('mt-3 text-base max-w-md opacity-80', colors.description)}
            />
          </BlurFade>

          <BlurFade delay={0.24} inView direction="right">
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <HeroLocation text={content.location} className={colors.meta} />
              <HeroMetric
                value={content.metric}
                label={content.metricLabel}
                theme={theme}
                className={colors.meta}
              />
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
          <BlurFade delay={0.12} inView direction="left" className="order-2 w-full">
            {/*
              Padding on the wrapper reserves room for the offset shape, so it
              never gets clipped or pushes the layout sideways.
            */}
            <div className={cn('relative w-full pr-3 pb-3 @lg:pr-4 @lg:pb-4', wide && 'h-full min-h-80 p-0')}>
              {/* Decorative shape: same radius as the photo, offset evenly down-right */}
              <div
                aria-hidden
                className={cn('absolute inset-0 left-3 top-3 @lg:left-4 @lg:top-4 rounded-2xl opacity-[0.1]', wide && 'hidden')}
                style={{ backgroundColor: theme.primaryColor }}
              />
              <img
                src={imageSrc}
                alt=""
                fetchPriority="high"
                decoding="async"
                className={cn('relative block w-full aspect-[4/3] @lg:aspect-[5/4] object-cover object-center rounded-2xl shadow-xl ring-1 ring-slate-900/5', wide && 'h-full min-h-80 aspect-[4/3] rounded-none shadow-none ring-0 @lg:aspect-auto')}
              />
            </div>
          </BlurFade>
        )}
      </div>
    </section>
  );
}

function PortfolioEditorialHero({ content }: SubProps) {
  return (
    <section className="w-full bg-[#f4f4f6] px-6 pb-12 pt-16 text-[#171717] sm:px-10 md:min-h-[min(90svh,960px)] md:px-[10%] md:pb-16 md:pt-24">
      <div className="mx-auto grid min-h-[390px] max-w-6xl grid-cols-1 items-end gap-10 md:min-h-[min(68svh,720px)] md:grid-cols-[0.8fr_1.6fr] md:gap-16">
        <div className="flex h-full flex-col items-start justify-between gap-8 md:pb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{content.title}</p>
            <p className="mt-12 max-w-[16rem] text-[11px] leading-relaxed text-neutral-500">{content.subtitle}</p>
          </div>
          {content.buttonText?.trim() ? <a href={content.buttonUrl || '#contact'} className="inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-8 text-[11px] font-semibold uppercase tracking-wide !text-white">{content.buttonText}</a> : null}
        </div>
        <div className="pb-1">
          <h1 className="max-w-4xl text-5xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl md:text-[clamp(3.5rem,6.2vw,6rem)]">{content.headline}</h1>
          <a href="#services" className="mt-10 inline-flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.16em]">Scroll down <span className="grid h-11 w-11 place-items-center rounded-full border border-neutral-400 text-lg font-normal">↓</span></a>
        </div>
      </div>
    </section>
  );
}

function FashionEditorialHero({ content }: SubProps) {
  return (
    <section className="w-full bg-white px-6 py-10 text-[#171717] sm:px-10 md:px-[7%] md:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:min-h-[500px] md:grid-cols-[1.15fr_0.85fr] md:gap-12">
        <div className="relative mx-auto w-full max-w-[620px] pb-7 pr-7 md:pb-9 md:pr-9">
          {content.imageUrl && <img src={content.imageUrl} alt={content.title ? `${content.title} — style portrait` : 'Style portrait'} className="ml-auto aspect-[0.92/1] w-[72%] object-cover" />}
          {content.avatarUrl && <img src={content.avatarUrl} alt="A detail from the latest style story" className="absolute bottom-0 left-0 aspect-[1.3/1] w-[52%] border-[6px] border-white object-cover md:border-[10px]" />}
          {content.secondaryImageUrl && <img src={content.secondaryImageUrl} alt="Another look from the latest style story" className="absolute right-0 top-0 z-10 aspect-[1.25/1] w-[32%] border-[6px] border-white object-cover md:border-[10px]" />}
        </div>
        <div className="max-w-md md:pl-2">
          {content.eyebrow && <p className="mb-5 text-[9px] font-medium uppercase tracking-[0.24em] text-neutral-500">{content.eyebrow}</p>}
          <h1 className="font-serif text-4xl font-normal leading-[1.02] tracking-[-0.035em] sm:text-5xl md:text-[clamp(2.75rem,4vw,4.25rem)]">{content.headline || content.title}</h1>
          {content.subtitle && <p className="mt-5 max-w-sm text-[11px] leading-relaxed text-neutral-500 md:text-xs">{content.subtitle}</p>}
          {content.buttonText && <a href={content.buttonUrl || '#outfits'} className="mt-7 inline-flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.2em]">{content.buttonText}<span aria-hidden="true" className="h-px w-9 bg-current" /></a>}
        </div>
      </div>
    </section>
  );
}

function SpeakerEditorialHero({ content }: SubProps) {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#ff735e] text-[#171717] md:min-h-[540px]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_15%,#ffd5ca_0%,transparent_42%),linear-gradient(135deg,#ffe9df_0%,#ff8b72_55%,#ff604f_100%)]" />
      {content.imageUrl && <img src={content.imageUrl} alt={content.title ? `Portrait of ${content.title}` : 'Speaker portrait'} className="absolute inset-y-0 left-0 -z-0 h-full w-full object-cover object-top opacity-25 md:w-[53%] md:opacity-100 md:[mask-image:linear-gradient(to_right,black_65%,transparent_100%)]" />}
      <div className="relative z-10 mx-auto grid min-h-[440px] max-w-6xl items-center px-6 py-16 sm:px-10 md:min-h-[540px] md:grid-cols-[1.05fr_0.95fr] md:px-12">
        <div className="hidden md:block" aria-hidden="true" />
        <div className="max-w-lg rounded-sm bg-white/70 p-6 backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-0">
          {content.title && <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.22em]">{content.title}</p>}
          <h1 className="font-serif text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-[clamp(3rem,5vw,5rem)]">{content.headline || content.title}</h1>
          {content.subtitle && <p className="mt-5 max-w-md text-xs leading-relaxed text-neutral-800/80">{content.subtitle}</p>}
          {content.buttonText && <a href={content.buttonUrl || '#events'} className="mt-7 inline-flex min-h-10 items-center bg-[#ff634f] px-6 text-[9px] font-semibold uppercase tracking-wide text-white">{content.buttonText}</a>}
          {content.secondaryButtonText && <a href={content.secondaryButtonUrl || '#newsletter'} className="ml-3 mt-7 inline-flex min-h-10 items-center border border-neutral-900/30 px-5 text-[9px] font-semibold uppercase tracking-wide">{content.secondaryButtonText}</a>}
        </div>
      </div>
    </section>
  );
}

function TattooCoverHero({ content, backgroundColor, textColor }: SubProps) {
  const photos = content.galleryImages || [];
  return <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 pb-5 pt-20 sm:px-8 sm:pt-24" style={{ backgroundColor: backgroundColor || '#0c0d0c', color: textColor || '#e9e7dc' }}>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35" style={{ background: 'radial-gradient(ellipse at 18% 62%, #343431 0, transparent 38%), radial-gradient(ellipse at 83% 50%, #292a27 0, transparent 35%)' }} />
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
      {content.eyebrow && <p className="mb-4 text-[8px] font-medium uppercase tracking-[0.23em] text-white/55 sm:mb-5 sm:text-[10px]">{content.eyebrow}</p>}
      <h1 className="max-w-[16ch] font-serif text-[clamp(2.6rem,8.2vw,7rem)] font-normal leading-[0.82] tracking-[-0.055em] text-[#e9e7dc]">{content.title}</h1>
      {(content.headline || content.subtitle) && <p className="mt-4 max-w-lg text-[10px] leading-relaxed text-white/65 sm:mt-5 sm:text-sm">{content.headline}{content.headline && content.subtitle ? <br /> : null}{content.subtitle}</p>}
      {photos.length > 0 && <div className="relative mt-8 h-[23vw] min-h-[110px] max-h-[260px] w-[calc(100%+2rem)] overflow-hidden sm:mt-9 sm:h-[22vw] sm:min-h-[180px]">
        <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-3">
          {photos.map((photo: any, i: number) => <figure key={photo.id || i} className="relative h-[86%] w-[18vw] min-w-[18vw] rotate-[var(--tilt)] overflow-hidden rounded-xl border border-white/15 shadow-2xl sm:w-[14vw] sm:min-w-[14vw] sm:rounded-2xl" style={{ '--tilt': `${[-4, 2, -2, 3, -3, 2, -4, 3][i % 8]}deg` } as React.CSSProperties}><img src={photo.url} alt={photo.caption || ''} className="h-full w-full object-cover" />{photo.caption && <figcaption className="sr-only">{photo.caption}</figcaption>}</figure>)}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0c0d0c] to-transparent" />
      </div>}
      <div className="relative z-10 mt-4 flex justify-center gap-2 sm:mt-5 sm:gap-3">
        {content.buttonText && <a href={content.buttonUrl || '#contact'} data-page-button className="rounded-full bg-[#e3e2d8] px-4 py-2 text-[9px] font-medium text-[#171715] sm:px-5 sm:py-2.5 sm:text-xs">{content.buttonText}</a>}
        {content.secondaryButtonText && <a href={content.secondaryButtonUrl || '#board'} className="rounded-full border border-white/30 px-4 py-2 text-[9px] text-[#e9e7dc] sm:px-5 sm:py-2.5 sm:text-xs">{content.secondaryButtonText}</a>}
      </div>
    </div>
  </section>;
}

function RestaurantCoverHero({ content }: SubProps) {
  return <section className="relative flex min-h-[54svh] w-full items-end justify-center overflow-hidden bg-neutral-900 text-white md:min-h-[620px]">
    {content.imageUrl && <img src={content.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
    <div className="absolute inset-0 bg-black/35" />
    <div className="relative z-10 px-6 pb-5 text-center"><a href={content.buttonUrl || '#menu'} className="border-b border-white/70 pb-1 text-[9px] font-medium uppercase tracking-wide text-white">{content.buttonText || 'Scopri il menu'} ↓</a></div>
  </section>;
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


function ZoomRevealPortal({ zoomWord, theme, isPreview }: {
  zoomWord: string;
  theme: ThemeConfig;
  isPreview?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const zoomScale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 0.9, 1],
    [1, 2, 5, 20, 80, 400]
  );

  // Fade out the text just before the camera passes completely through the hole
  // to prevent jagged pixel edges from clipping the viewport.
  const textOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center pointer-events-none">

        {/* 
          FIX 1: Matched Background
          Changed from bg-black to bg-background/bg-white so it merges 
          perfectly with "The collection" section.
        */}
        <motion.div
          className="absolute inset-0 bg-white"
        />

        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{
            scale: zoomScale,
            opacity: textOpacity,
            transformOrigin: '50% 50%',
          }}
        >
          <span
            className="font-serif font-black uppercase select-none text-black drop-shadow-sm"
            style={{
              fontSize: 'clamp(60px, 15vw, 200px)',
              letterSpacing: '-0.05em',
              lineHeight: 1,
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {zoomWord}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
function SalonArchHero({ content, theme }: SubProps) {
  const imageSrc = content.imageUrl || content.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000';

  return (
    <section className="relative w-full overflow-hidden px-6 py-12 @md:px-12 @md:py-20 @lg:py-24">
      {/* Delicate background curved stroke line */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-50 200 C 300 120, 250 500, 600 350 C 950 200, 1000 650, 1300 500"
          stroke="#c5a880"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <path
          d="M100 700 C 400 600, 500 750, 800 680 C 1050 620, 1150 780, 1300 720"
          stroke="#c5a880"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 @lg:grid-cols-12 @lg:gap-16">
        {/* Left Column: Typography & CTA */}
        <div className="flex flex-col items-start text-left @lg:col-span-7">
          <BlurFade delay={0} inView direction="right">
            {content.eyebrow && (
              <span className="inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#b89562] mb-3">
                {content.eyebrow}
              </span>
            )}
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-[#1f1a18] dark:text-stone-100 @sm:text-5xl @md:text-6xl @lg:text-7xl">
              {content.headline && content.title ? (
                <>
                  {content.headline}
                  <br />
                  <span className="italic font-serif text-[#b89562]">{content.title}</span>
                </>
              ) : (() => {
                const text = content.title || content.headline || "Manicure And Pedicure Nail Salon";
                const words = text.trim().split(/\s+/);
                if (words.length <= 2) {
                  return (
                    <>
                      {words[0]}
                      {words[1] && (
                        <>
                          <br />
                          <span className="italic font-serif text-[#b89562]">{words[1]}</span>
                        </>
                      )}
                    </>
                  );
                }
                const firstPart = words.slice(0, -2).join(' ');
                const accentPart = words.slice(-2).join(' ');
                return (
                  <>
                    {firstPart}
                    <br />
                    <span className="italic font-serif text-[#b89562]">{accentPart}</span>
                  </>
                );
              })()}
            </h1>
          </BlurFade>

          <BlurFade delay={0.12} inView direction="right">
            <p className="mt-6 max-w-lg font-sans text-sm leading-relaxed text-[#78716c] dark:text-stone-300 @md:text-base">
              {content.subtitle || "Welcome to our premier nail studio, where luxury meets care. We offer exceptional manicures, pedicures, and nail art in a serene atmosphere."}
            </p>
          </BlurFade>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {content.buttonText && (
              <BlurFade delay={0.2} inView direction="right">
                <a
                  href={content.buttonUrl || '#contact'}
                  data-page-button
                  className="inline-flex items-center justify-center rounded-full bg-[#1f1a18] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#382f2c] hover:shadow-md"
                >
                  {content.buttonText}
                </a>
              </BlurFade>
            )}
            {content.secondaryButtonText && (
              <BlurFade delay={0.24} inView direction="right">
                <a
                  href={content.secondaryButtonUrl || '#treatments'}
                  className="inline-flex items-center justify-center rounded-full border border-black/15 dark:border-white/20 px-7 py-3.5 text-sm font-medium text-current hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  {content.secondaryButtonText}
                </a>
              </BlurFade>
            )}
          </div>
        </div>

        {/* Right Column: Signature Arched Photo */}
        <div className="flex justify-center @lg:col-span-5 @lg:justify-end">
          <BlurFade delay={0.16} inView direction="left" className="relative w-full max-w-sm">
            {/* Fine decorative outer arch outline */}
            <div className="absolute -inset-3.5 rounded-t-full border border-[#c5a880]/40 pointer-events-none" />

            {/* Sparkle accents */}
            <span data-color-preserve className="absolute -top-6 right-6 text-xl text-[#c5a880]/80 select-none animate-pulse">✦</span>
            <span data-color-preserve className="absolute top-10 -left-4 text-sm text-[#c5a880]/60 select-none">✧</span>
            <span data-color-preserve className="absolute -bottom-2 right-4 text-xs text-[#c5a880]/50 select-none">✦</span>

            {/* Arched image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full rounded-b-2xl bg-[#eee7de] shadow-2xl ring-1 ring-black/5">
              <img
                src={imageSrc}
                alt={content.title}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </BlurFade>
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
  'arch': SalonArchHero,
  'salon-arch': SalonArchHero,
  'portfolio-editorial': PortfolioEditorialHero,
  'editorial-portfolio': PortfolioEditorialHero,
  'editorial-collage': FashionEditorialHero,
  'fashion-editorial': FashionEditorialHero,
  'keynote': SpeakerEditorialHero,
  'speaker-editorial': SpeakerEditorialHero,
  'curved-strip': TattooCoverHero,
  'tattoo-cover': TattooCoverHero, // backward compat
  'cover-story': RestaurantCoverHero,
  'restaurant-cover': RestaurantCoverHero,
  'split-wide': (props) => <SplitHero {...props} wide />,
  'immersive': ImmersiveHero,
  'minimal': MinimalProfile,
  'asymmetric': AsymmetricHero,
};

export function HeroSection({ section, theme, isPreview }: HeroProps & { isPreview?: boolean }) {
  const { content, variant = 'default' } = section;
  const Layout = VARIANT_MAP[variant] || EditorialCenter;
  const textContrast = (section as any).textContrast || 'auto';

  const heroContent = <Layout content={content} theme={theme} textContrast={textContrast} backgroundColor={section.backgroundColor} textColor={section.textColor} />;
  const zoomReveal = (section as any).zoomReveal;
  const zoomWord = (section as any).zoomWord || content.title?.split(' ')[0] || 'Hello';

  return (
    <>
      {heroContent}
      {zoomReveal && (
        <ZoomRevealPortal zoomWord={zoomWord} theme={theme} isPreview={isPreview} />
      )}
    </>
  );
}
