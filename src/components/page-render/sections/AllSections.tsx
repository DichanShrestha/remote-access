"use client";
import React, { lazy, Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { PageSection, ThemeConfig, FeatureSplitSectionSchema, ValueCardsSectionSchema, CaseStudiesSectionSchema, ContactSectionSchema, StatsSectionSchema, SiteFooterSectionSchema, SiteNavbarSectionSchema, BlogListSectionSchema } from '@/lib/page-engine/schemas';
import { HeroSection } from './HeroSection';
import { RichTextSection } from './RichTextSection';
import { LinkListSection } from './LinkListSection';
import { FaqSection } from './FaqSection';
import { SiteFooter, SiteNavbar } from './SiteChromeSections';
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaYoutube, FaTiktok, FaDribbble, FaBehance, FaSpotify, FaFacebook, FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { Marquee } from '@/components/ui/marquee';
import { submitLead } from '@/actions/leads';
import { formatVideoEmbedUrl } from '@/lib/video-embed';
import { readableTextColor } from '@/lib/color-contrast';

// Optional interaction-heavy presentation modules stay out of the base page chunk.
const ChromaGrid = lazy(() => import('@/components/ChromaGrid'));
const BounceCards = lazy(() => import('@/components/BounceCards'));
const GlareHover = lazy(() => import('@/components/GlareHover'));
const ScrollReveal = lazy(() => import('@/components/ScrollReveal'));
const GradualBlur = lazy(() => import('@/components/GradualBlur'));
const Dock = lazy(() => import('@/components/Dock'));
const CountUp = lazy(() => import('@/components/CountUp'));
const Stepper = lazy(() => import('@/components/Stepper'));
import { MagicCard } from '@/components/ui/magic-card';
import { NumberTicker } from '@/components/ui/number-ticker';
import { PageImage } from '@/components/page-render/PageImage';
import { PageLink } from '@/components/page-render/PageLink';

// ── URL Button ─────────────────────────────────────────────────
export function UrlButtonSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { label, url, description } = section.content;
  const { layout } = section;
  const styles: Record<string, string> = {
    filled: 'text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    outline: 'bg-transparent border-2 hover:-translate-y-0.5',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <PageLink
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-page-button
        className={`group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${styles[layout] || styles.filled}`}
        style={layout === 'filled' ? { backgroundColor: theme.primaryColor } : layout === 'outline' ? { borderColor: theme.primaryColor, color: theme.primaryColor } : {}}
      >
        <div className="flex flex-col">
          <span>{label}</span>
          {description && <span className="text-sm font-normal opacity-70">{description}</span>}
        </div>
        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </PageLink>
    </section>
  );
}

// ── Image Button ───────────────────────────────────────────────
export function ImageButtonSection({ section }: { section: any; theme: ThemeConfig }) {
  const { imageUrl, label, url } = section.content;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <PageLink href={url} target="_blank" rel="noopener noreferrer" className="group block w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative">
        <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800">
          <PageImage src={imageUrl} alt={label || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {label && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <span className="px-6 py-4 text-white font-bold text-lg">{label}</span>
          </div>
        )}
      </PageLink>
    </section>
  );
}

// ── Email Button ───────────────────────────────────────────────
export function EmailButtonSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { label, email, subject } = section.content;
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <PageLink href={href} data-page-button className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
        <span>{label}</span>
        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </PageLink>
    </section>
  );
}

// ── File Button ────────────────────────────────────────────────
export function FileButtonSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { label, fileUrl } = section.content;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <PageLink href={fileUrl} download data-page-button className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
        <span>{label}</span>
        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      </PageLink>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────
export function CtaSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, text, buttonText, buttonUrl } = section.content;
  if (section.variant === 'portfolio-footer') return <section className="w-full bg-[#171717] px-6 py-20 text-center text-white md:py-28"><div className="mx-auto max-w-xl"><h2 className="text-2xl font-bold uppercase leading-tight tracking-[0.08em] md:text-3xl">{title}</h2>{text && <p className="mx-auto mt-4 max-w-md text-[10px] leading-relaxed text-white/60">{text}</p>}<PageLink href={buttonUrl} data-page-button className="mt-7 inline-flex rounded-full bg-white px-9 py-3 text-[9px] font-bold uppercase tracking-wide text-neutral-900">{buttonText}</PageLink></div></section>;
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{title}</h2>
        {text && <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">{text}</p>}
        <PageLink href={buttonUrl} data-page-button className="inline-block px-10 py-4 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          {buttonText}
        </PageLink>
      </div>
    </section>
  );
}

// ── Social Links / Follow ──────────────────────────────────────
export function SocialLinksSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { links } = section.content;
  const { layout, variant = 'default' } = section;

  if (variant === 'dock') {
    const dockItems = links.map((link: any) => ({
      title: link.platform,
      icon: (
        <PageLink href={link.url} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center rounded-full text-white text-lg font-bold" style={{ backgroundColor: theme.primaryColor }}>
          {link.platform.charAt(0).toUpperCase()}
        </PageLink>
      ),
    }));
    return (
      <section className="py-8 px-4 flex justify-center w-full my-4">
        {/* @ts-ignore */}
        <Suspense fallback={null}><Dock items={dockItems} size={56} magnification={72} /></Suspense>
      </section>
    );
  }

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <FaTwitter className="w-4 h-4" />;
      case 'x': return <FaXTwitter className="w-4 h-4" />;
      case 'instagram': return <FaInstagram className="w-4 h-4" />;
      case 'github': return <FaGithub className="w-4 h-4" />;
      case 'linkedin': return <FaLinkedin className="w-4 h-4" />;
      case 'youtube': return <FaYoutube className="w-4 h-4" />;
      case 'tiktok': return <FaTiktok className="w-4 h-4" />;
      case 'dribbble': return <FaDribbble className="w-4 h-4" />;
      case 'behance': return <FaBehance className="w-4 h-4" />;
      case 'spotify': return <FaSpotify className="w-4 h-4" />;
      case 'facebook': return <FaFacebook className="w-4 h-4" />;
      default: return <FaLink className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3 py-8">
        {links.map((link: any) => (
          <PageLink
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-neutral-400 hover:shadow-md dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
          >
            {getIcon(link.platform)}
            {link.platform}
          </PageLink>
        ))}
      </div>
    </section>
  );
}

// ── Image ──────────────────────────────────────────────────────
export function ImageSection({ section }: { section: any; theme: ThemeConfig }) {
  const { url, alt, caption } = section.content;
  const { layout, variant = 'default' } = section;

  if (layout === 'cover') {
    return (
      <section className="h-full min-h-72 w-full p-0">
        <figure className="h-full min-h-72 w-full">
          <PageImage src={url} alt={alt || caption || 'Image'} className="aspect-[4/3] h-full min-h-72 w-full object-cover md:aspect-auto" />
          {caption && <figcaption className="sr-only">{caption}</figcaption>}
        </figure>
      </section>
    );
  }

  if (variant === 'scroll-reveal') {
    return (
      <section className={`py-10 ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
        {/* @ts-ignore */}
        <Suspense fallback={<PageImage src={url} alt={alt || caption || 'Image'} className={`w-full h-auto object-cover ${layout === 'full' ? '' : 'rounded-2xl shadow-lg'}`} />}>
          <ScrollReveal scrollContainerRef={null}><PageImage src={url} alt={alt || caption || 'Image'} className={`w-full h-auto object-cover ${layout === 'full' ? '' : 'rounded-2xl shadow-lg'}`} /></ScrollReveal>
        </Suspense>
        {caption && <p className="text-center text-sm text-slate-400 mt-4 italic">{caption}</p>}
      </section>
    );
  }

  if (variant === 'gradual-blur') {
    return (
      <section className={`py-10 relative ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
        <PageImage src={url} alt={alt || caption || 'Image'} className={`w-full h-auto object-cover ${layout === 'full' ? '' : 'rounded-2xl shadow-lg'}`} />
        {/* @ts-ignore */}
        <Suspense fallback={null}><GradualBlur position="bottom" strength={5} height="40%" /></Suspense>
        {caption && <p className="text-center text-sm text-slate-400 mt-4 italic">{caption}</p>}
      </section>
    );
  }

  return (
    <section className={`py-10 ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
      <figure className="w-full group">
        <div className={`overflow-hidden ${layout === 'full' ? '' : 'rounded-2xl'} shadow-lg`}>
          <PageImage src={url} alt={alt || caption || 'Image'} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
        </div>
        {caption && <figcaption className="text-center text-sm text-slate-400 mt-4 italic">{caption}</figcaption>}
      </figure>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────
export function GallerySection({ section }: { section: any; theme: ThemeConfig }) {
  const { images } = section.content;
  const variant = section.variant || 'default';

  if (!images || images.length === 0) {
    return <section className="py-10 px-4 text-center text-slate-400 text-sm">Add images to your gallery</section>;
  }

  const urls = images.map((img: any) => img.url);

  if (variant === 'restaurant-gallery') {
    return <section className="w-full bg-white px-4 py-14 text-[#171717] sm:px-8 md:px-[8%] md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {section.content.eyebrow && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a8874e]">{section.content.eyebrow}</p>}
          {section.content.title && <h2 className="font-serif text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] tracking-[-0.035em]">{section.content.title}</h2>}
          {section.content.description && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#171717]/65">{section.content.description}</p>}
        </div>
        <div className="grid auto-rows-[150px] grid-cols-2 gap-2 sm:auto-rows-[210px] md:auto-rows-[190px] md:grid-cols-4 md:gap-3">
          {images.map((img: any, index: number) => <figure key={img.id || index} className={cn(
            'group relative overflow-hidden bg-[#eee8dd]',
            index === 0 && 'col-span-2 row-span-2',
            index === 3 && 'col-span-2 md:col-span-2',
          )}>
            <PageImage src={img.url} alt={img.caption || ''} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {img.caption && <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 px-4 pb-3 font-serif text-sm italic text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">{img.caption}</figcaption>}
          </figure>)}
        </div>
        {(section.content.buttonText || section.content.secondaryButtonText) && <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          {section.content.buttonText && <PageLink href={section.content.buttonUrl || '#booking'} data-page-button className="inline-flex min-h-11 items-center border-b border-[#a8874e] pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#171717]">{section.content.buttonText}</PageLink>}
          {section.content.secondaryButtonText && <PageLink href={section.content.secondaryButtonUrl || '#menu'} className="inline-flex min-h-11 items-center text-xs font-medium uppercase tracking-[0.16em] text-[#171717]/60">{section.content.secondaryButtonText}</PageLink>}
        </div>}
      </div>
    </section>;
  }

  if (variant === 'salon-gallery') {
    return <section className="w-full bg-[#f6f4ee] px-5 py-16 text-[#1f1a18] sm:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {section.content.eyebrow && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b89562]">{section.content.eyebrow}</p>}
          {section.content.title && <h2 className="font-serif text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] tracking-[-0.035em]">{section.content.title}</h2>}
          {section.content.description && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#1f1a18]/60">{section.content.description}</p>}
        </div>
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img: any, index: number) => <figure key={img.id || index} className={cn('group relative overflow-hidden rounded-[1.75rem] bg-[#ede6dc]', index === 0 ? 'md:col-span-2' : '')}>
            <PageImage src={img.url} alt={img.caption || ''} className={cn('w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]', index === 0 ? 'aspect-[4/3] md:aspect-[2.1/1]' : 'aspect-[4/5]')} />
            {img.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-5 pb-4 pt-10 text-[10px] uppercase tracking-[0.18em] text-white/90">{img.caption}</figcaption>}
          </figure>)}
        </div>
        {(section.content.buttonText || section.content.secondaryButtonText) && <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {section.content.buttonText && <PageLink href={section.content.buttonUrl || '#contact'} data-page-button className="inline-flex min-h-11 items-center rounded-full bg-[#1f1a18] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-white">{section.content.buttonText}</PageLink>}
          {section.content.secondaryButtonText && <PageLink href={section.content.secondaryButtonUrl || '#contact'} className="inline-flex min-h-11 items-center rounded-full border border-[#1f1a18]/20 px-7 text-xs font-medium uppercase tracking-[0.14em]">{section.content.secondaryButtonText}</PageLink>}
        </div>}
      </div>
    </section>;
  }

  if (variant === 'tattoo-gallery') {
    return <section className="w-full overflow-hidden bg-[#0c0d0c] px-5 py-16 text-[#e9e7dc] sm:px-10 md:px-[8%] md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            {section.content.eyebrow && <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">{section.content.eyebrow}</p>}
            {section.content.title && <h2 className="font-serif text-[clamp(2rem,5.8vw,4.25rem)] leading-[0.95] tracking-[-0.045em]">{section.content.title}</h2>}
          </div>
          <div className="md:pb-1">
            {section.content.description && <p className="max-w-md text-sm leading-relaxed text-white/55">{section.content.description}</p>}
            {section.content.buttonText && <PageLink href={section.content.buttonUrl || '#contact'} data-page-button className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#e3e2d8] px-5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#171715]">{section.content.buttonText}</PageLink>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img: any, index: number) => <figure key={img.id || index} className={cn('group relative overflow-hidden border border-white/10 bg-[#141513]', index % 3 === 1 && 'md:mt-10')}>
            <PageImage src={img.url} alt={img.caption || ''} className="aspect-[4/5] w-full object-cover grayscale-[18%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-3 pb-3 pt-10">
              {img.caption && <figcaption className="text-[9px] uppercase tracking-[0.14em] text-white/70">{img.caption}</figcaption>}
              {img.note && <span className="max-w-[9rem] rotate-[-2deg] bg-[#e3e2d8] px-2 py-1 text-[8px] font-medium leading-tight text-[#171715]">{img.note}</span>}
            </div>
          </figure>)}
        </div>
      </div>
    </section>;
  }

  if (variant === 'photo-strip') return <section className="relative w-full overflow-hidden bg-[#0c0d0c] pb-7 pt-1 sm:pb-9">
    <div className="relative h-[24vw] min-h-[84px] max-h-[250px] sm:h-[19vw] sm:min-h-[120px]">
      <div className="absolute inset-x-0 top-0 flex h-full -translate-x-[7%] items-center justify-center gap-1 sm:gap-3">
        {images.map((img: any, i: number) => <figure key={img.id || i} className="relative h-[86%] w-[16vw] min-w-[16vw] rotate-[var(--tilt)] overflow-hidden rounded-[1rem] border border-white/15 shadow-2xl sm:w-[15vw] sm:min-w-[15vw]" style={{ '--tilt': `${[-5, 3, -2, 4, -3, 2, -4][i % 7]}deg` } as React.CSSProperties}><PageImage src={img.url} alt={img.caption || ''} className="h-full w-full object-cover" />{img.caption && <figcaption className="sr-only">{img.caption}</figcaption>}</figure>)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0c0d0c] to-transparent" />
    </div>
    <div className="relative z-10 flex justify-center gap-2 px-5">
      {section.content.buttonText && <PageLink href={section.content.buttonUrl || '#contact'} data-page-button className="rounded-full bg-[#d4d3c8] px-4 py-2 text-[8px] font-medium text-[#171715] shadow-sm sm:text-[10px]">{section.content.buttonText}</PageLink>}
      {section.content.secondaryButtonText && <PageLink href={section.content.secondaryButtonUrl || '#board'} className="rounded-full border border-white/25 px-4 py-2 text-[8px] text-[#e9e7dc] sm:text-[10px]">{section.content.secondaryButtonText}</PageLink>}
    </div>
  </section>;

  if (variant === 'pinboard') {
    return <section className="w-full px-6 py-20 text-[#e9e7dc] sm:px-10 md:px-[8%] md:py-28">
      <div className="mx-auto mb-8 max-w-6xl text-center sm:mb-10">
        <div><h2 className="font-serif text-[clamp(1.7rem,6vw,4rem)] leading-[0.84] tracking-[-0.05em] whitespace-nowrap">{section.content.title || 'On The Board'}</h2>{section.content.description && <p className="mx-auto mt-3 max-w-md text-[7px] leading-relaxed text-white/55 sm:text-xs">{section.content.description}</p>}</div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-3 items-center gap-x-4 gap-y-7 sm:gap-x-10 sm:gap-y-14">
        {images.map((img: any, i: number) => <figure key={img.id || i} className="relative mx-auto w-full max-w-[230px] rotate-[var(--tilt)] rounded-[10px] bg-[#e9e9dc] p-2 pb-8 text-[#171715] shadow-[0_12px_35px_#0008] sm:p-3 sm:pb-10" style={{ '--tilt': `${[-4, 3, -2, 4, -3, 2][i % 6]}deg` } as React.CSSProperties}>
          <PageImage src={img.url} alt={img.caption || ''} className="aspect-[4/5] w-full object-cover" />
          {img.caption && <figcaption className="absolute inset-x-2 bottom-2 truncate text-[9px] font-semibold uppercase tracking-wide sm:inset-x-3 sm:bottom-3 sm:text-[10px]">{img.caption}</figcaption>}
          <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-8deg] bg-white/40 shadow-sm" />
          {img.note && <span className="absolute -right-5 bottom-8 z-10 w-16 rotate-[9deg] bg-[#f4df67] px-2 py-2 font-serif text-[8px] font-semibold uppercase leading-tight text-[#1d1d18] shadow-md sm:-right-7 sm:w-20 sm:text-[10px]">{img.note}</span>}
        </figure>)}
      </div>
    </section>;
  }

  if (variant === 'masonry') {
    return (
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((img: any, i: number) => (
            <div key={img.id || i} className="break-inside-avoid group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <PageImage
                src={img.url}
                alt={img.caption || ''}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'chroma') {
    return (
      <section className="py-12 w-full max-w-7xl mx-auto">
        {/* @ts-ignore */}
        <Suspense fallback={<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{urls.map((url: string) => <PageImage key={url} src={url} alt="" className="aspect-square w-full object-cover" />)}</div>}>
          <ChromaGrid items={urls.map((u: string) => ({ image: u }))} />
        </Suspense>
      </section>
    );
  }

  if (variant === 'bounce') {
    return (
      <section className="py-20 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[500px] overflow-hidden">
        <div className="relative w-full max-w-[800px] h-[400px] flex items-center justify-center scale-75 md:scale-100">
          {/* @ts-ignore */}
          <Suspense fallback={<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{urls.map((url: string) => <PageImage key={url} src={url} alt="" className="aspect-square w-full object-cover" />)}</div>}>
            <BounceCards images={urls} containerWidth={800} containerHeight={400} />
          </Suspense>
        </div>
      </section>
    );
  }



  return (
    <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className={`grid gap-3 ${section.layout === 'masonry' ? 'grid-cols-2 md:grid-cols-4 items-start' : 'grid-cols-2 md:grid-cols-3'}`}>
        {images.map((img: any) => (
          <div key={img.id} className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <PageImage src={img.url} alt={img.caption || ''} className={`w-full ${section.layout === 'masonry' ? 'h-auto' : 'aspect-square object-cover'} group-hover:scale-105 transition-transform duration-500`} />
            {img.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-medium">{img.caption}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

import FlexCarousel from '@/components/FlexCarousel';
import CircularCarousel from '@/components/CircularCarousel';
import DepthCarousel from '@/components/DepthCarousel';
import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import { Check, Mail, Phone, MapPin } from 'lucide-react';

// ── Carousel ───────────────────────────────────────────────────
export function CarouselSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { images } = section.content;
  const variant = section.variant || 'default';
  const [currentIndex, setCurrentIndex] = useState(0);

  const formattedItems = useMemo(() => {
    if (!images || images.length === 0) return [];

    // To ensure 3-4 items are beautifully visible in the front arc of the cylinder,
    // we need the cylinder to have at least 8-10 items total.
    let displayImages = [...images];
    while (displayImages.length < 8) {
      displayImages = [...displayImages, ...images];
    }
    // Trim to 20 if it gets absurdly long
    if (displayImages.length > 20) {
      displayImages = displayImages.slice(0, 20);
    }

    return displayImages.map((img: any, i: number) => ({
      src: img.url,
      image: img.url,
      alt: img.caption || 'Carousel image',
      title: img.caption || '',
      subtitle: '',
      id: `${img.id}-${i}`, // keep unique react key if they use it
    }));
  }, [images]);

  if (!images || images.length === 0) {
    return <section className="py-10 px-4 text-center text-slate-400 text-sm">Add images to your carousel</section>;
  }

  if (variant === 'fashion-strip') return <section className="w-full overflow-hidden border-y border-neutral-200 bg-white py-10 text-[#171717] md:py-14">
    <div className="mb-5 flex items-center justify-between px-6 sm:px-10 md:px-[7%]"><p className="text-[8px] font-semibold uppercase tracking-[0.22em]">The outfit diary</p><p className="text-[8px] uppercase tracking-[0.18em] text-neutral-400">Scroll to explore&nbsp; →</p></div>
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-10 md:gap-6 md:px-[7%]">
      {images.map((image: any) => <article key={image.id} className="w-[72vw] flex-none snap-start sm:w-[42vw] md:w-[calc((86vw-4.5rem)/4)] md:max-w-[280px]">
        <PageImage src={image.url} alt={image.caption || 'Outfit inspiration'} className="aspect-[0.78/1] w-full object-cover" />
        <p className="mt-3 text-center text-[8px] uppercase tracking-[0.15em] text-neutral-500">OUTFIT&nbsp; / &nbsp;{image.caption}</p>
      </article>)}
    </div>
  </section>;

  if (variant === 'restaurant-featured') return <section className="w-full bg-white px-6 py-10 sm:px-10 md:px-[10%] md:py-14"><div className="mx-auto grid max-w-6xl grid-cols-[1fr_64px] gap-2 sm:grid-cols-[1fr_100px] md:gap-3"><div className="relative aspect-[1.65/1] overflow-hidden bg-neutral-100"><PageImage src={images[currentIndex % images.length].url} alt={images[currentIndex % images.length].caption || ''} className="h-full w-full object-cover" /><span className="absolute right-4 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-[#c6a66b] text-[8px] font-semibold uppercase text-white">{images[currentIndex % images.length].caption || 'Scopri'}</span><div className="absolute bottom-4 left-4 flex gap-2"><button onClick={() => setCurrentIndex(index => (index - 1 + images.length) % images.length)} aria-label="Previous dish" className="grid h-8 w-8 place-items-center rounded-full bg-white/90">←</button><button onClick={() => setCurrentIndex(index => (index + 1) % images.length)} aria-label="Next dish" className="grid h-8 w-8 place-items-center rounded-full bg-white/90">→</button></div></div><div className="flex flex-col gap-2">{images.filter((_: any, index: number) => index !== currentIndex % images.length).slice(0, 2).map((image: any) => <button key={image.id} onClick={() => setCurrentIndex(images.findIndex((item: any) => item.id === image.id))} className="min-h-0 flex-1 overflow-hidden"><PageImage src={image.url} alt={image.caption || ''} className="h-full w-full object-cover" /></button>)}</div></div></section>;

  if (variant === 'flex') {
    return (
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto h-[600px] relative w-full">
        {/* @ts-ignore React Bits JSX components miss some optional props */}
        <FlexCarousel items={formattedItems} />
      </section>
    );
  }

  if (variant === 'circular') {
    return (
      <section className="py-12 w-full h-[600px] md:h-[700px] relative overflow-hidden flex items-center justify-center">
        {/* @ts-ignore React Bits JSX components miss some optional props */}
        <CircularCarousel items={formattedItems} cardWidth={250} gap={40} />
      </section>
    );
  }

  if (variant === 'react-bits') {
    return (
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto relative w-full">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]" tabIndex={0} aria-label="Image carousel; scroll horizontally to browse">
          {images.map((image: any) => <figure key={image.id} className="w-[min(82vw,52rem)] shrink-0 snap-center">
            <PageImage src={image.url} alt={image.caption || ''} sizes="(max-width: 768px) 82vw, 832px" className="aspect-video w-full rounded-lg bg-neutral-100 object-cover" />
            {image.caption && <figcaption className="mt-3 text-sm text-neutral-600">{image.caption}</figcaption>}
          </figure>)}
        </div>
      </section>
    );
  }

  if (variant === 'depth') {
    return (
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto h-[500px] relative w-full">
        {/* @ts-ignore React Bits JSX components miss some optional props */}
        <DepthCarousel items={formattedItems} />
      </section>
    );
  }

  // Default layout
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-slate-900 group">
        <PageImage
          src={images[currentIndex].url}
          alt={images[currentIndex].caption || ''}
          className="w-full h-full object-cover transition-opacity duration-500"
          key={currentIndex}
        />

        {images[currentIndex].caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 pb-4 pt-16 px-6">
            <span className="text-white font-medium">{images[currentIndex].caption}</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                  style={i === currentIndex ? { backgroundColor: theme.primaryColor } : {}}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Helper to transform any video URL (YouTube, Vimeo, Loom, direct video) into an embeddable URL
export { formatVideoEmbedUrl } from '@/lib/video-embed';

// ── Video ──────────────────────────────────────────────────────
export function VideoSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { url = '', title = '' } = section?.content || {};
  const variant = section?.variant || 'default';
  const embedUrl = formatVideoEmbedUrl(url);
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(embedUrl);

  const videoPlayer = (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
      {!embedUrl ? (
        <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
          <svg className="w-12 h-12 mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium">Add a video URL in settings</p>
        </div>
      ) : isDirectVideo ? (
        <video
          src={embedUrl}
          controls
          className="w-full h-full object-cover"
        />
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title={title || 'Video'}
        />
      )}
    </div>
  );

  if (variant === 'blur-fade') {
    return (
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-5xl mx-auto">
        <BlurFade delay={0.2} inView>
          <div className="relative group">
            {/* Soft decorative background shape */}
            <div className="absolute -inset-4 md:-inset-8 rounded-[2rem] opacity-[0.04]" style={{ backgroundColor: theme.primaryColor }} />
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-200/50 dark:border-slate-800/50">
              {videoPlayer}
            </div>
          </div>
        </BlurFade>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
        {videoPlayer}
      </div>
    </section>
  );
}

// ── Audio ──────────────────────────────────────────────────────
export function AudioSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { url, title, artist } = section.content;
  return (
    <section className="py-8 px-4 md:px-8 max-w-xl mx-auto">
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryColor + '20' }}>
          <svg className="w-7 h-7" style={{ color: theme.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
        </div>
        <div className="flex-1 min-w-0">
          {title && <div className="font-bold text-sm truncate">{title}</div>}
          {artist && <div className="text-xs text-slate-400 truncate">{artist}</div>}
          {url ? (
            <audio controls className="w-full mt-2 h-8" src={url}>Your browser does not support audio.</audio>
          ) : (
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full w-1/3 rounded-full" style={{ backgroundColor: theme.primaryColor + '60' }} /></div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Resume ─────────────────────────────────────────────────────
export function ResumeSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const variant = section.variant || 'default';

  if (variant === 'stepper') {
    const steps = items.map((item: any) => ({
      title: `${item.role} at ${item.company}`,
      description: `${item.period}\n${item.description || ''}`,
    }));
    return (
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        {title && <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: theme.primaryColor }}>{title}</h2>}
        {/* @ts-ignore */}
        <Suspense fallback={null}><Stepper steps={steps} activeStep={0} /></Suspense>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto">
      {title && <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: theme.primaryColor }}>{title}</h2>}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
        <div className="flex flex-col gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="flex gap-5 relative">
              <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 flex-shrink-0 shadow-md z-10" style={{ backgroundColor: theme.primaryColor }} />
              <div className="flex-1 pb-2">
                <div className="font-bold text-lg">{item.role}</div>
                <div className="text-sm font-medium" style={{ color: theme.primaryColor }}>{item.company} · {item.period}</div>
                {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Services ───────────────────────────────────────────────────
export function ServicesSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const variant = section.variant || 'minimal-border';

  const renderDescription = (desc?: string) => desc || <span className="opacity-60">Premium service offering tailored to your unique requirements and goals.</span>;

  if (variant === 'restaurant-list') {
    const { eyebrow, subtitle } = section.content;
    return <section className="w-full bg-white px-6 py-16 text-[#171717] sm:px-10 md:px-[10%] md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-16">
          <div>
            {eyebrow && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a8874e]">{eyebrow}</p>}
            {title && <h2 className="max-w-md font-serif text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.04em]">{title}</h2>}
          </div>
          {subtitle && <p className="max-w-lg text-sm leading-relaxed text-[#171717]/65 md:pb-1">{subtitle}</p>}
        </div>
        <div className="mt-10 grid gap-x-14 md:mt-14 md:grid-cols-2">
          {items.map((item: any, index: number) => <article key={item.id} className="group border-t border-[#171717]/15 py-6 md:py-7">
            <div className="flex items-start gap-5">
              <span className="pt-0.5 font-serif text-sm italic text-[#a8874e]">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-serif text-xl leading-snug tracking-[-0.02em] md:text-2xl">{item.title}</h3>
                {item.description && <p className="mt-2 max-w-md text-sm leading-relaxed text-[#171717]/60">{item.description}</p>}
              </div>
            </div>
          </article>)}
        </div>
      </div>
    </section>;
  }

  if (variant === 'corporate-index') {
    const { eyebrow, subtitle } = section.content;
    return <section className="w-full px-6 py-16 text-[#171717] sm:px-10 md:px-[8%] md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[0.82fr_1.18fr] md:gap-16">
          <header className="md:sticky md:top-24 md:self-start">
            {eyebrow && <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#093326]">{eyebrow}</p>}
            {title && <h2 className="max-w-sm font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.04em]">{title}</h2>}
            {subtitle && <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#171717]/60">{subtitle}</p>}
          </header>
          <div className="border-t border-[#093326]/20">
            {items.map((item: any, index: number) => <article key={item.id} className="grid gap-3 border-b border-[#093326]/20 py-7 md:grid-cols-[2.5rem_1fr] md:gap-6 md:py-9">
              <span className="font-serif text-sm italic text-[#093326]/50">{String(index + 1).padStart(2, '0')}</span>
              <div>
                {item.tag && <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#093326]/70">{item.tag}</p>}
                <h3 className="max-w-lg font-serif text-2xl leading-tight tracking-[-0.025em] md:text-3xl">{item.title}</h3>
                {item.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#171717]/60">{item.description}</p>}
                {item.buttonText && <PageLink href={item.buttonUrl || '#contact'} data-page-button className="mt-5 inline-flex min-h-10 items-center border-b border-[#093326] pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#093326]">{item.buttonText}</PageLink>}
              </div>
            </article>)}
          </div>
        </div>
      </div>
    </section>;
  }

  if (variant === 'salon-menu') {
    const { eyebrow, subtitle } = section.content;
    return <section className="w-full bg-[#f6f4ee] px-5 py-16 text-[#1f1a18] sm:px-10 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {eyebrow && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b89562]">{eyebrow}</p>}
          {title && <h2 className="font-serif text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.04em]">{title}</h2>}
          {subtitle && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#1f1a18]/60">{subtitle}</p>}
        </div>
        <div className="divide-y divide-[#1f1a18]/12 border-y border-[#1f1a18]/12">
          {items.map((item: any, index: number) => <article key={item.id} className="grid gap-6 py-7 md:grid-cols-[10rem_1fr] md:gap-9 md:py-9">
            <div className="relative overflow-hidden rounded-t-[5rem] rounded-b-2xl bg-[#ede6dc]">
              {item.imageUrl ? <PageImage src={item.imageUrl} alt={item.title} className="aspect-[4/5] w-full object-cover md:aspect-[4/5]" /> : <div className="grid aspect-[4/5] place-items-center text-[10px] uppercase tracking-widest text-[#1f1a18]/30">Nue Studio</div>}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                {item.tag && <span className="rounded-full bg-[#ede6dc] px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8f7042]">{item.tag}</span>}
                {item.price && <span className="text-[10px] uppercase tracking-[0.14em] text-[#1f1a18]/50">{item.price}</span>}
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight tracking-[-0.025em] md:text-3xl">{item.title}</h3>
              {item.description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#1f1a18]/60">{item.description}</p>}
              {item.buttonText && <PageLink href={item.buttonUrl || '#contact'} data-page-button className="mt-5 inline-flex min-h-10 w-fit items-center rounded-full border border-[#1f1a18] px-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1f1a18]">{item.buttonText}</PageLink>}
            </div>
          </article>)}
        </div>
      </div>
    </section>;
  }

  if (variant === 'salon-staggered' || variant === 'staggered') {
    return (
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto text-current">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-normal text-current tracking-tight">{title}</h2>
          </div>
        )}
        <div className="flex flex-col gap-16 md:gap-24">
          {items.map((item: any, index: number) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col items-center gap-10 md:gap-16",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Image side with squircle and floating duration/price pill */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg group bg-[#ede6dc]">
                    {item.imageUrl ? (
                      <PageImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-current/30">Nail Treatment</div>
                    )}
                    {item.price && (
                      <div className="absolute top-4 right-4 bg-white/95 dark:bg-stone-900/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-800 dark:text-stone-200 border border-black/5">
                        {item.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Text side */}
                <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                  {(item.icon || item.tag) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#b89562] mb-3">
                      {item.icon || item.tag}
                    </span>
                  )}
                  <h3 className="text-2xl md:text-4xl font-serif font-normal text-current tracking-tight mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-current/75 leading-relaxed font-sans mb-7 max-w-md">
                    {item.description}
                  </p>
                  <PageLink
                    href={item.buttonUrl || "#contact"}
                    data-page-button
                    className="inline-flex items-center justify-center rounded-full bg-[#1f1a18] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#382f2c] hover:shadow transition-all"
                  >
                    {item.buttonText || "Book Now"}
                  </PageLink>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (variant === 'portfolio-band') {
    type BandItem = { id: string; title: string; description?: string; tag?: string };
    type BandLink = { id: string; title?: string; platform?: string; label?: string; url?: string };
    const band = section.content;
    const socialLinks: BandLink[] = band.socialLinks
      || [{ id: 'fb', title: 'Facebook' }, { id: 'tw', title: 'Twitter' }, { id: 'ig', title: 'Instagram' }];
    return (
      <section
        className="w-full px-6 py-16 sm:px-10 md:px-[8%] md:py-24"
        style={{ backgroundColor: section.backgroundColor || '#171717', color: section.textColor || '#ffffff' }}
      >
        <div className="mx-auto max-w-6xl">
          {(band.eyebrow || band.title || band.subtitle || band.description) && (
            <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[1.1fr_0.9fr] md:items-end">
              <div>
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-current/45">{band.eyebrow || 'Services'}</p>
                {band.title && <h2 className="font-serif text-[clamp(2rem,5.8vw,4.25rem)] leading-[0.95] tracking-[-0.045em]">{band.title}</h2>}
              </div>
              {(band.subtitle || band.description) && <p className="max-w-md text-sm leading-relaxed text-current/55">{band.subtitle || band.description}</p>}
            </div>
          )}
          <div className="grid gap-8 md:grid-cols-[1.45fr_0.7fr] md:gap-12">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {items.map((item: BandItem, index: number) => <div key={item.id} className="border-t border-current/15 pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-base font-semibold tracking-tight sm:text-lg">{item.title}</p>
                  <span className="text-[9px] tabular-nums text-current/30">{String(index + 1).padStart(2, '0')}</span>
                </div>
                {item.description && <p className="mt-2 text-xs leading-relaxed text-current/50">{item.description}</p>}
                {item.tag && <span className="mt-3 inline-block border border-current/20 px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-current/60">{item.tag}</span>}
              </div>)}
            </div>
            <div className="border-t border-current/20 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-current/40">{band.socialLabel || 'Follow me'}</p>
              <div className="flex flex-col items-start gap-2">
                {socialLinks.map((link: BandLink) => <PageLink key={link.id} href={link.url || '#'} className="w-full max-w-48 border-b border-current/70 pb-1 text-sm font-medium">{link.title || link.platform || link.label}<span className="float-right">↗</span></PageLink>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'architecture-accordion') {
    return <section className="w-full bg-white px-6 py-16 text-[#123b38] sm:px-10 md:px-[10%] md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wide">Our services</p><PageLink href="#contact" className="border-b border-current/50 pb-1 text-[9px] uppercase">Get in touch&nbsp; ↘</PageLink></div>
        <div className="border-t border-[#123b38]/30">
          {items.map((item: any, index: number) => <details key={item.id} open={index === 1} className="group border-b border-[#123b38]/30">
            <summary className="flex cursor-pointer list-none items-center gap-3 py-4 marker:hidden [&::-webkit-details-marker]:hidden"><span className="text-[9px] font-semibold">{String(index + 1).padStart(2, '0')}</span><span className="flex-1 text-2xl font-medium uppercase leading-none tracking-[-0.04em] text-[#bdd1e0] sm:text-3xl md:text-4xl">{item.title}</span><span className="text-2xl font-light group-open:text-[#123b38]"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary>
            <div className="grid gap-4 pb-5 pl-8 md:grid-cols-[1fr_1.2fr] md:pl-12">{item.imageUrl && <PageImage src={item.imageUrl} alt="" className="h-20 w-full object-cover md:h-24 md:max-w-36" />}<div><p className="max-w-xl text-[10px] leading-relaxed text-neutral-600">{item.description}</p><div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#123b38]"><span className="rounded-full border border-current/30 px-2 py-1">Ongoing Support</span><span className="rounded-full border border-current/30 px-2 py-1">Space Planning</span><span className="rounded-full border border-current/30 px-2 py-1">Sustainable Design</span></div></div></div>
          </details>)}
        </div>
      </div>
    </section>;
  }

  if (variant === 'glass-dark') {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center text-neutral-900 dark:text-white">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="group flex flex-col justify-between h-full min-h-[260px] p-8 rounded-2xl transition-all duration-300 bg-neutral-900 border border-neutral-800 text-white shadow-xl hover:border-neutral-700 hover:bg-neutral-850">
              <div>
                <div className="w-8 h-[2px] bg-neutral-700 mb-6 group-hover:w-12 group-hover:bg-white transition-all" />
                <h3 className="text-xl font-serif text-white mb-3">{item.title}</h3>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">{renderDescription(item.description)}</p>
              </div>
              {item.price && (
                <div className="mt-6 font-bold text-lg text-white/90">{item.price}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'asymmetric-bento') {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-neutral-900 dark:text-white">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="group flex flex-col justify-between h-full min-h-[260px] p-8 rounded-3xl transition-all duration-300 bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">{renderDescription(item.description)}</p>
              </div>
              {item.price && (
                <div className="mt-6 font-bold text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-neutral-100 dark:border-slate-700 w-fit" style={{ color: theme.primaryColor }}>
                  {item.price}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Default: minimal-border
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      {title && <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-neutral-900 dark:text-white">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any, i: number) => (
          <div key={item.id} className="group flex flex-col justify-between h-full min-h-[260px] p-8 rounded-2xl transition-all duration-300 bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700">
            <div>
              <div className="text-xs font-mono font-semibold text-neutral-400 mb-6 bg-neutral-100 dark:bg-slate-800 px-2.5 py-1 rounded-md w-fit">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">{renderDescription(item.description)}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>{item.price}</span>
              <div className="text-xs font-medium text-neutral-900 dark:text-white inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Products ───────────────────────────────────────────────────
export function ProductsSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const variant = section.variant || 'default';

  if (variant === 'luxury-products') {
    const { eyebrow, description } = section.content;
    return <section className="w-full bg-white px-6 py-16 text-[#171717] sm:px-10 md:px-[8%] md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-16">
          {eyebrow && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#171717]/45">{eyebrow}</p>}
          {title && <h2 className="font-serif text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.04em]">{title}</h2>}
          {description && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#171717]/55">{description}</p>}
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {items.map((item: any) => <article key={item.id} className="group">
            <PageLink href={item.url || '#contact'} className="relative block overflow-hidden bg-[#f5f5f5]">
              {item.imageUrl && <PageImage src={item.imageUrl} alt={item.title} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.18em] transition-transform duration-300 group-hover:translate-y-0">View product</span>
            </PageLink>
            <div className="mt-4 flex items-start justify-between gap-4 border-t border-[#171717]/12 pt-4">
              <h3 className="font-serif text-xl leading-snug tracking-[-0.02em]">{item.title}</h3>
              <span className="whitespace-nowrap text-xs tabular-nums text-[#171717]/60">{item.price}</span>
            </div>
            {item.description && <p className="mt-2 text-xs leading-relaxed text-[#171717]/50">{item.description}</p>}
          </article>)}
        </div>
      </div>
    </section>;
  }

  if (variant === 'restaurant-menu' || variant === 'categorized-menu') {
    const categories = Array.from(new Set(items.map((item: any) => item.category || 'Menu')));
    return <section className="w-full px-6 py-14 text-inherit sm:px-10 md:px-[10%] md:py-20"><div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[0.8fr_1fr] md:gap-12">
      {section.content.menuImageUrl && <PageImage src={section.content.menuImageUrl} alt="A selection from our kitchen" className="aspect-[0.8/1] w-full object-cover" />}
      <div><div className="mb-5 flex items-end justify-between"><h2 className="font-serif text-4xl">{title || 'Menu'}</h2><PageLink href="#menu-0" className="text-xs uppercase underline underline-offset-4">Vedi tutto</PageLink></div><nav aria-label="Menu categories" className="mb-6 flex flex-wrap gap-x-3 text-xs uppercase text-current/70">{categories.map((category: any, index: number) => <PageLink key={category} href={`#menu-${index}`} className="whitespace-nowrap">{category}{index < categories.length - 1 && <span className="ml-3 opacity-50">/</span>}</PageLink>)}</nav>
        {categories.map((category: any, index: number) => <div key={category} id={`menu-${index}`} className="mb-5 scroll-mt-6"><h3 className="sr-only">{category}</h3><div className="border-t border-current/30">{items.filter((item: any) => (item.category || 'Menu') === category).map((item: any) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-current/20 py-3 text-sm"><div><p className="font-medium">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-current/65">{item.description}</p></div><span className="whitespace-nowrap text-current/75">{item.price}</span></div>)}</div></div>)}
      </div>
    </div></section>;
  }

  if (variant === 'glare') {
    return (
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((item: any) => (
            // @ts-ignore
            <Suspense key={item.id} fallback={<article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">{item.imageUrl && <div className="aspect-square overflow-hidden"><PageImage src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /></div>}<div className="p-4"><h3 className="text-sm font-bold text-white">{item.title}</h3><p className="mb-1 line-clamp-2 text-xs text-slate-400">{item.description}</p><div className="text-sm font-bold" style={{ color: theme.primaryColor }}>{item.price}</div></div></article>}><GlareHover className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {item.imageUrl && (
                <div className="aspect-square overflow-hidden">
                  <PageImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-1 line-clamp-2">{item.description}</p>
                <div className="font-bold text-sm" style={{ color: theme.primaryColor }}>{item.price}</div>
              </div>
            </GlareHover></Suspense>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'magic-card') {
    return (
      <section className="py-24 px-4 md:px-8 max-w-6xl mx-auto">
        {title && <h2 className="text-4xl font-serif mb-16 text-center text-slate-800 dark:text-slate-100">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {items.map((item: any) => (
            <div key={item.id} className="group flex flex-col gap-5">
              <MagicCard className="w-full aspect-[4/5] rounded-xl overflow-hidden cursor-pointer" gradientColor={theme.primaryColor + '10'}>
                {item.imageUrl && (
                  <PageImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </MagicCard>
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-lg font-serif">{item.title}</h3>
                  <div className="font-medium text-slate-500 whitespace-nowrap">{item.price}</div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                <PageLink href={item.url || '#'} className="inline-block mt-3 text-sm font-semibold tracking-wide uppercase border-b border-transparent hover:border-slate-800 transition-colors self-start pb-0.5">Shop Now</PageLink>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
      {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((item: any) => (
          <div key={item.id} className="group">
            {item.imageUrl && (
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden shadow-sm">
                <PageImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <h3 className="font-bold text-sm">{item.title}</h3>
            <p className="text-xs text-slate-400 mb-1 line-clamp-2">{item.description}</p>
            <div className="font-bold text-sm">{item.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────
function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-400 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'fill-transparent stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      ))}
    </div>
  );
}

function TestimonialCard({ item, isMarquee = false }: { item: any, isMarquee?: boolean }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${isMarquee ? 'w-[320px] md:w-[380px] shrink-0 mx-3' : 'w-full h-full'}`}>
      <div>
        <div className="text-neutral-200 dark:text-slate-700 text-4xl font-serif leading-none select-none mb-4">"</div>
        <StarRating rating={item.rating || 5} />
        <p className="font-serif text-base md:text-lg text-neutral-800 dark:text-slate-200 leading-relaxed mb-8">{item.quote}</p>
      </div>

      <div className="flex items-center gap-3">
        {item.avatarUrl ? (
          <PageImage src={item.avatarUrl} alt={item.author} className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-slate-700" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 flex items-center justify-center font-bold text-neutral-400">
            {item.author?.[0] || 'A'}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-white">{item.author}</div>
          {item.role && <div className="text-xs text-neutral-500 dark:text-slate-400">{item.role}</div>}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const variant = section.variant || 'grid';

  if (variant === 'salon-editorial' || variant === 'editorial-quotes') {
    return (
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto text-current">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-current">
            {title || "What Our Clients Say"}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between overflow-hidden backdrop-blur-sm"
            >
              {/* Giant watermark quotation */}
              <span data-color-preserve className="absolute right-6 bottom-2 font-serif text-8xl md:text-9xl text-white/[0.05] select-none pointer-events-none leading-none">
                ”
              </span>
              <p className="relative z-10 text-base md:text-lg leading-relaxed text-current/85 font-sans mb-8">
                "{item.quote}"
              </p>
              <div className="relative z-10">
                <span className="font-serif text-lg font-medium tracking-wide text-current">
                  {item.author}
                </span>
                {item.role && (
                  <span className="block text-xs uppercase tracking-wider text-current/60 mt-1">
                    {item.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'marquee') {
    // Split items into two rows
    const firstRow = items.slice(0, Math.ceil(items.length / 2));
    const secondRow = items.slice(Math.ceil(items.length / 2));

    return (
      <section className="py-20 px-0 md:px-0 w-full overflow-hidden">
        {title && <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white text-center mb-16">{title}</h2>}

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <Marquee aria-hidden="true" pauseOnHover className="[--duration:40s]">
            {firstRow.map((item: any) => (
              <TestimonialCard key={item.id} item={item} isMarquee />
            ))}
          </Marquee>

          {secondRow.length > 0 && (
            <Marquee aria-hidden="true" reverse pauseOnHover className="[--duration:40s] mt-6">
              {secondRow.map((item: any) => (
                <TestimonialCard key={item.id} item={item} isMarquee />
              ))}
            </Marquee>
          )}
        </div>
        <ul className="sr-only">
          {items.map((item: any) => <li key={item.id}>{item.quote} — {item.author}{item.role ? `, ${item.role}` : ''}</li>)}
        </ul>
      </section>
    );
  }

  // Default: Grid
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      {title && <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white text-center mb-16">{title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="h-full">
            <TestimonialCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}


// ── Announcement ───────────────────────────────────────────────
export function AnnouncementSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { text, url, buttonText } = section.content;
  return (
    <div className="w-full py-3.5 px-4 text-center text-sm font-semibold tracking-wide" style={{ backgroundColor: theme.primaryColor, color: '#fff' }}>
      <span>{text}</span>
      {url && <PageLink href={url} className="ml-3 underline underline-offset-2 opacity-80 hover:opacity-100">{buttonText || 'Learn More →'}</PageLink>}
    </div>
  );
}

// ── Lead Form ──────────────────────────────────────────────────
function LeadFormFields({ buttonText, theme, pageId, sectionId, variant = '', content = {} }: { buttonText: string; theme: ThemeConfig; pageId?: string; sectionId: string; variant?: string; content?: any }) {
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const tattooInquiry = variant === 'split-inquiry';
  const salonInquiry = variant === 'salon-inquiry';
  const fieldClass = tattooInquiry
    ? 'w-full rounded-xl border border-white/15 bg-transparent px-3 py-2.5 text-[8px] text-[#e9e7dc] placeholder:text-white/25 focus:border-white/35 focus:outline-none sm:px-4 sm:py-3 sm:text-xs'
    : salonInquiry
      ? 'w-full rounded-2xl border border-[#1f1a18]/15 bg-white/70 px-4 py-3 text-sm text-[#1f1a18] placeholder:text-[#1f1a18]/30 focus:border-[#b89562] focus:outline-none focus:ring-2 focus:ring-[#b89562]/20'
      : 'w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm';
  const labelClass = tattooInquiry
    ? 'mb-1.5 block text-[7px] text-white/60 sm:text-[10px]'
    : salonInquiry
      ? 'mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1f1a18]/55'
      : 'block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2';

  const chips = ['Web Design', 'Branding', 'Growth', 'Other'];

  const toggleChip = (chip: string) => {
    setActiveChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pageId) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = tattooInquiry ? '' : formData.get('email') as string;
    const phone = tattooInquiry ? formData.get('phone') as string : undefined;
    const message = formData.get('message') as string;

    await submitLead({
      pageId,
      componentId: sectionId,
      componentType: 'lead-form',
      name,
      email,
      phone,
      message,
      customData: { services: activeChips },
    });

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Message sent!</h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">{content.successMessage || "We'll get back to you as soon as possible."}</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
      {/* Service Pills */}
      {!tattooInquiry && !salonInquiry && <div className="flex flex-wrap gap-2 mb-1">
        {chips.map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => toggleChip(chip)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${activeChips.includes(chip) ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white' : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-slate-700 hover:border-neutral-400 dark:hover:border-slate-500'}`}
          >
            {chip}
          </button>
        ))}
      </div>}

      {/* Name */}
      <div>
        <label className={labelClass}>{content.nameLabel || 'Full Name'}</label>
        <input name="name" type="text" required placeholder={content.namePlaceholder || 'John Doe'} className={fieldClass} />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>{content.contactLabel || 'Email Address'}</label>
        <input name={tattooInquiry ? 'phone' : 'email'} type={tattooInquiry ? 'tel' : 'email'} required placeholder={content.contactPlaceholder || (tattooInquiry ? '+1 (555) 000-0000' : 'john@company.com')} className={fieldClass} />
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>{content.messageLabel || 'Your Message'}</label>
        <textarea name="message" required placeholder={content.messagePlaceholder || 'Tell us about your project...'} rows={tattooInquiry ? 5 : 4} className={`${fieldClass} resize-none`} />
      </div>

      {/* CTA Button */}
      <button type="submit" data-page-button disabled={loading} style={{ backgroundColor: theme.primaryColor, color: readableTextColor(theme.primaryColor) }} className="w-full bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 font-medium py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-1 disabled:opacity-70">
        {loading ? 'Sending...' : buttonText || 'Send Message'}
        {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
      </button>

      {/* Trust Badges */}
      {!salonInquiry && <div className="flex items-center justify-center gap-5 mt-1">
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">⚡ Avg. response: &lt; 24h</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">🔒 100% Privacy. No spam.</span>
      </div>}
    </form>
  );
}

export function LeadFormSection({ section, theme, pageId }: { section: any; theme: ThemeConfig; pageId?: string }) {
  const { title, description, buttonText } = section.content;
  const variant = section.variant || 'card-centered';

  if (variant === 'salon-inquiry') {
    return <section className="w-full bg-[#f6f4ee] px-5 py-16 text-[#1f1a18] sm:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <div>
          <span className="mb-4 inline-block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b89562]">Appointments</span>
          <h2 className="max-w-sm font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.04em]">{title || 'Send us a note'}</h2>
          {description && <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#1f1a18]/60">{description}</p>}
          <div className="mt-8 space-y-4 border-t border-[#1f1a18]/12 pt-6 text-sm">
            {section.content.email && <p className="flex flex-col gap-1"><span className="text-[9px] uppercase tracking-[0.16em] text-[#1f1a18]/45">Email</span><PageLink href={`mailto:${section.content.email}`} className="w-fit border-b border-[#1f1a18]/25 pb-0.5 text-[#1f1a18]">{section.content.email}</PageLink></p>}
            {section.content.location && <p className="flex flex-col gap-1"><span className="text-[9px] uppercase tracking-[0.16em] text-[#1f1a18]/45">Studio</span><span className="max-w-xs text-[#1f1a18]/75">{section.content.location}</span></p>}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#1f1a18]/10 bg-white/60 p-5 sm:p-8 md:p-10">
          <LeadFormFields buttonText={buttonText} theme={theme} pageId={pageId} sectionId={section.id} variant="salon-inquiry" content={section.content} />
        </div>
      </div>
    </section>;
  }

  if (variant === 'split-inquiry') {
    const infoCards = [
      { title: 'Email me at', value: section.content.email, href: section.content.email ? `mailto:${section.content.email}` : undefined, icon: '✉' },
      { title: 'Follow me on Instagram', value: section.content.instagram?.replace(/^https?:\/\//, ''), href: section.content.instagram, icon: '◎' },
      { title: 'Tattooing at', value: section.content.location, icon: '♧' },
    ].filter(item => item.value);
    return <section className="w-full overflow-x-clip bg-[#0c0d0c] px-6 py-14 text-[#e9e7dc] sm:px-10 md:px-[8%] md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-7 max-w-[13ch] font-serif text-[clamp(1.9rem,6.8vw,4.5rem)] leading-[0.84] tracking-[-0.05em]">{title || 'Let’s Create Something Permanent.'}</h2>
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-[0.92fr_1.08fr] sm:gap-8 md:gap-12">
          <div>
            {description && <p className="mb-5 text-[11px] leading-relaxed text-white/65 sm:mb-8 sm:text-sm">{description}</p>}
            <div className="flex flex-col gap-2 sm:gap-3">{infoCards.map(card => <PageLink key={card.title} href={card.href || '#'} className="flex min-h-12 min-w-0 items-center gap-2 rounded-lg border border-white/10 px-2 py-2 sm:min-h-16 sm:gap-3 sm:px-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-white/20 text-[10px] sm:h-7 sm:w-7 sm:text-sm">{card.icon}</span><span className="min-w-0"><span className="block text-[10px] text-white/55 sm:text-xs">{card.title}</span><span className="mt-1 block truncate text-[10px] sm:text-sm">{card.value}</span></span></PageLink>)}</div>
          </div>
          <div className="min-w-0 rounded-lg border border-white/10 p-2.5 sm:rounded-xl sm:p-4">
            <LeadFormFields buttonText={buttonText} theme={theme} pageId={pageId} sectionId={section.id} variant="split-inquiry" content={section.content} />
          </div>
        </div>
      </div>
    </section>;
  }

  if (variant === 'split-layout') {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column — Info & Social Proof (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
              {title || "Let's talk"}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-10">
              {description || "Ready to elevate your digital presence? Fill out the form and we'll schedule a free strategy call."}
            </p>

            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Email</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">hello@yoursite.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Location</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">Remote · Worldwide</div>
                </div>
              </div>
            </div>

            {/* Founder Quote */}
            <div className="p-5 bg-neutral-50 dark:bg-slate-800/80 rounded-2xl border border-neutral-100 dark:border-slate-700 flex gap-4 items-start">
              <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center font-serif text-lg font-bold text-neutral-600 dark:text-neutral-300">F</div>
              <div>
                <p className="text-sm italic text-neutral-600 dark:text-neutral-300 leading-relaxed mb-1.5">"We partner with ambitious brands to create category-defining digital experiences."</p>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">Founder</div>
              </div>
            </div>
          </div>

          {/* Right Column — Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-50/50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 p-8 rounded-3xl">
            <LeadFormFields buttonText={buttonText} theme={theme} pageId={pageId} sectionId={section.id} />
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'editorial-panel') {
    return (
      <section className="w-full p-8 md:p-10">
        <div className="mb-6">
          <span className="mb-2 inline-block rounded-sm bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-900">Let’s connect</span>
          <h2 className="text-3xl font-semibold tracking-tight text-current">{title || 'We’re here to help'}</h2>
          {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-current/70">{description}</p>}
        </div>
        <ContactForm theme={theme} pageId={pageId} sectionId={section.id} submitLabel={buttonText || 'Submit'} showInterestOptions={false} showStatusNote={false} />
      </section>
    );
  }

  // Default: card-centered
  return (
    <section className="py-20 px-6 w-full">
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xl rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
            {title || "Let's talk"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed">
            {description || "Tell us about your project and we'll schedule a free strategy call."}
          </p>
        </div>
        <LeadFormFields buttonText={buttonText} theme={theme} pageId={pageId} sectionId={section.id} />
      </div>
    </section>
  );
}

// ── Collect Emails ─────────────────────────────────────────────
export function CollectEmailsSection({ section, theme, pageId }: { section: any; theme: ThemeConfig; pageId?: string }) {
  const { title, placeholder, buttonText } = section.content;
  const variant = section.variant || 'default';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pageId) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    await submitLead({
      pageId,
      componentId: section.id,
      componentType: 'collect-emails',
      email,
    });
    setSuccess(true);
    setLoading(false);
  };

  if (variant === 'spacious') {
    return (
      <section className="py-32 px-4 md:px-8 max-w-2xl mx-auto text-center border-t border-slate-200/50">
        <BlurFade delay={0.1} inView>
          {title && <h2 className="text-3xl md:text-4xl font-serif mb-12">{title}</h2>}
          {success ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-medium">Subscribed successfully!</div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
              <input name="email" type="email" required placeholder={placeholder || 'Your email'} className="flex-1 px-6 py-4 rounded-none border-b-2 border-slate-200 dark:border-slate-700 bg-transparent text-base focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-colors text-center sm:text-left" />
              <button type="submit" data-page-button disabled={loading} className="px-8 py-4 rounded-none font-bold text-white text-sm tracking-widest uppercase transition-all flex-shrink-0 disabled:opacity-70" style={{ backgroundColor: theme.primaryColor }}>
                {loading ? '...' : buttonText}
              </button>
            </form>
          )}
        </BlurFade>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 max-w-md mx-auto text-center">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {success ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium">Subscribed successfully!</div>
      ) : (
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
          <input name="email" type="email" required placeholder={placeholder || 'Your email'} className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900" />
          <button type="submit" data-page-button disabled={loading} className="w-full shrink-0 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-70 sm:w-auto sm:px-6" style={{ backgroundColor: theme.primaryColor }}>
            {loading ? '...' : buttonText}
          </button>
        </form>
      )}
    </section>
  );
}

// ── Booking ────────────────────────────────────────────────────
export function BookingSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, description, link } = section.content;
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  if (section.variant === 'restaurant-reservation') {
    const steps = ['Persone', 'Data', 'Ora'];
    const sendReservation = () => {
      const subject = encodeURIComponent(`Table reservation for ${guests}`);
      const body = encodeURIComponent(`Guests: ${guests}\nDate: ${date}\nTime: ${time}`);
      window.location.href = `${link || 'mailto:info@osteriasanrocco.com'}?subject=${subject}&body=${body}`;
    };
    return <section className="w-full bg-white px-6 py-12 text-neutral-900 sm:px-10 md:px-[10%] md:py-16"><h2 className="mb-8 text-center font-serif text-4xl md:mb-10 md:text-5xl">{title || 'Prenota un tavolo'}</h2><div className="mx-auto grid max-w-6xl gap-2 md:grid-cols-2 md:gap-3">
      <div className="min-h-[340px] bg-[#c8ad78] p-5 text-white sm:p-7">
        <div className="mb-7 grid grid-cols-3 border border-white/60 text-center text-[9px]"><span className="bg-white py-2 font-semibold text-[#9a7d48]">{steps[0]}</span>{steps.slice(1).map((label, index) => <span key={label} className={`py-2 ${step >= index + 1 ? 'bg-white/20' : ''}`}>{label}</span>)}</div>
        {step === 0 && <><p className="mb-4 font-serif text-lg">Per quante persone?</p><div className="grid grid-cols-3 gap-1.5">{[1, 2, 3, 4, 5, 6, 9].map(count => <button key={count} onClick={() => setGuests(count)} className={`h-9 border border-white/70 text-xs ${guests === count ? 'bg-white text-[#9a7d48]' : 'hover:bg-white/15'}`}>{count === 9 ? '9+' : count}</button>)}</div></>}
        {step === 1 && <label className="block font-serif text-lg">Scegli una data<input type="date" value={date} onChange={event => setDate(event.target.value)} className="mt-5 block h-12 w-full border border-white/70 bg-transparent px-3 font-sans text-sm text-white [color-scheme:light]" /></label>}
        {step === 2 && <label className="block font-serif text-lg">Scegli un orario<select value={time} onChange={event => setTime(event.target.value)} className="mt-5 block h-12 w-full border border-white/70 bg-transparent px-3 font-sans text-sm text-[#6c5837]"><option>18:00</option><option>18:30</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option></select></label>}
        <div className="mt-8 flex gap-2">{step > 0 && <button onClick={() => setStep(value => value - 1)} className="h-10 border border-white/70 px-5 text-[9px] font-semibold uppercase">Indietro</button>}{step < 2 ? <button onClick={() => setStep(value => value + 1)} className="h-10 flex-1 bg-white text-[9px] font-semibold uppercase tracking-wide text-[#81683e]">Continua</button> : <button onClick={sendReservation} className="h-10 flex-1 bg-white text-[9px] font-semibold uppercase tracking-wide text-[#81683e]">Richiedi prenotazione</button>}</div>
      </div>
      {section.content.imageUrl && <PageImage src={section.content.imageUrl} alt="A table set for dinner" className="min-h-[340px] w-full object-cover" />}
    </div></section>;
  }
  return (
    <section className="py-16 px-4 md:px-8 max-w-xl mx-auto text-center">
      <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        {description && <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">{description}</p>}
        <PageLink href={link} target="_blank" rel="noopener noreferrer" data-page-button className="inline-block px-10 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          Book Now
        </PageLink>
      </div>
    </section>
  );
}

// ── Contact ────────────────────────────────────────────────────
function ContactForm({ theme, pageId, sectionId, submitLabel = 'Send Message', showInterestOptions = true, showStatusNote = true }: { theme: ThemeConfig; pageId?: string; sectionId: string; submitLabel?: string; showInterestOptions?: boolean; showStatusNote?: boolean }) {
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const chips = ['Web Design', 'Branding', 'Growth', 'Other'];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleChip = (chip: string) => {
    setActiveChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pageId) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    await submitLead({
      pageId,
      componentId: sectionId,
      componentType: 'contact',
      name,
      email,
      message,
      customData: { interest: activeChips },
    });

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Message sent!</h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
      {showInterestOptions && <div className="flex flex-wrap gap-2 mb-2">
        {chips.map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => toggleChip(chip)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activeChips.includes(chip) ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white' : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-500'}`}
          >
            {chip}
          </button>
        ))}
      </div>}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Name</label>
        <input name="name" required type="text" placeholder="John Doe" className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Email</label>
        <input name="email" required type="email" placeholder="john@company.com" className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Message</label>
        <textarea name="message" required placeholder="How can we help?" rows={4} className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm resize-none" />
      </div>
      <button type="submit" data-page-button disabled={loading} style={{ backgroundColor: theme.primaryColor }} className="w-full bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
        {loading ? 'Sending...' : submitLabel}
        {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
      </button>
      {showStatusNote && <div className="flex items-center justify-center gap-4 mt-2 opacity-70">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">⚡ Avg. response: &lt; 24h</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">🔒 100% Privacy</div>
      </div>}
    </form>
  );
}

export function ContactSection({ section, theme, pageId }: { section: z.infer<typeof ContactSectionSchema>; theme: ThemeConfig; pageId?: string }) {
  const { title, description, buttonText, email, phone, address } = section.content;
  const variant = section.variant || 'card-centered';

  if (variant === 'corporate-details') {
    return <section className="w-full overflow-hidden bg-[#062f26] px-6 py-16 text-[#f5f2f0] sm:px-10 md:px-[8%] md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
        <div>
          {section.content.eyebrow && <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b9c9c2]">{section.content.eyebrow}</p>}
          <h2 className="max-w-md font-serif text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] tracking-[-0.04em]">{title || 'Start with a conversation'}</h2>
          {description && <p className="mt-5 max-w-md text-sm leading-relaxed text-[#f5f2f0]/65">{description}</p>}
          {buttonText && <PageLink href={section.content.email ? `mailto:${section.content.email}` : '#contact'} data-page-button className="mt-8 inline-flex min-h-11 items-center bg-[#f5f2f0] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#062f26]">{buttonText}</PageLink>}
        </div>
        <div className="border-t border-white/20 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          {email && <div className="border-b border-white/15 py-6 first:pt-0 md:first:pt-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b9c9c2]/70">Email</p>
            <PageLink href={`mailto:${email}`} className="mt-2 inline-block font-serif text-xl tracking-[-0.02em] hover:text-[#b9c9c2] md:text-2xl">{email}</PageLink>
          </div>}
          {phone && <div className="border-b border-white/15 py-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b9c9c2]/70">Phone</p>
            <PageLink href={`tel:${phone}`} className="mt-2 inline-block font-serif text-xl tracking-[-0.02em] hover:text-[#b9c9c2] md:text-2xl">{phone}</PageLink>
          </div>}
          {address && <div className="border-b border-white/15 py-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b9c9c2]/70">Office</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#f5f2f0]/75">{address}</p>
          </div>}
        </div>
      </div>
    </section>;
  }

  if (variant === 'salon-cards' || variant === 'cards-row' || variant === 'contact-cards') {
    return (
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto text-center text-current">
        {section.content.eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b89562] mb-3 inline-block">
            {section.content.eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-current mb-3">
          {title || "Get In Touch."}
        </h2>
        {description && (
          <p className="text-sm md:text-base text-current/70 max-w-md mx-auto mb-14 font-sans">
            {description}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Email */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-[#ede6dc] dark:bg-white/10 flex items-center justify-center text-[#b89562] mb-5">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-current mb-1">Email</h3>
            <p className="text-xs text-current/60 mb-3">Reach our salon concierge</p>
            {email && (
              <PageLink href={`mailto:${email}`} className="text-sm font-medium text-current hover:underline">
                {email}
              </PageLink>
            )}
          </div>
          {/* Phone */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-[#ede6dc] dark:bg-white/10 flex items-center justify-center text-[#b89562] mb-5">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-current mb-1">Phone</h3>
            <p className="text-xs text-current/60 mb-3">Mon-Sat from 9am to 7pm</p>
            {phone && (
              <PageLink href={`tel:${phone}`} className="text-sm font-medium text-current hover:underline">
                {phone}
              </PageLink>
            )}
          </div>
          {/* Office */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-[#ede6dc] dark:bg-white/10 flex items-center justify-center text-[#b89562] mb-5">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-current mb-1">Office</h3>
            <p className="text-xs text-current/60 mb-3">Walk-ins and appointments</p>
            {address && (
              <span className="text-sm font-medium text-current">
                {address}
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal-footer') {
    return (
      <footer className="py-16 px-8 mt-12 border-t border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 items-center">
            {address && <span>{address}</span>}
            {email && <PageLink href={`mailto:${email}`} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">{email}</PageLink>}
            {phone && <span>{phone}</span>}
          </div>
          <div className="text-xs opacity-60">© {new Date().getFullYear()} Forma. All rights reserved.</div>
        </div>
      </footer>
    );
  }

  if (variant === 'split-layout') {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto items-start">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
              {title || "Let's build something great together."}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-10">
              Ready to elevate your digital presence? We're currently taking on new projects and would love to hear about your vision.
            </p>

            <div className="flex flex-col gap-6">
              {email && (
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email Us</div>
                  <PageLink href={`mailto:${email}`} className="text-lg font-medium text-neutral-900 dark:text-white hover:underline decoration-neutral-300 underline-offset-4">{email}</PageLink>
                </div>
              )}
              {phone && (
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Call Us</div>
                  <div className="text-lg font-medium text-neutral-900 dark:text-white">{phone}</div>
                </div>
              )}
              {address && (
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Location</div>
                  <div className="text-lg font-medium text-neutral-900 dark:text-white">{address}</div>
                </div>
              )}
            </div>

            <div className="mt-12 p-6 bg-neutral-50 dark:bg-slate-800 rounded-2xl border border-neutral-100 dark:border-slate-700 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center font-serif text-xl font-bold">F</div>
              <div>
                <p className="text-sm italic text-neutral-700 dark:text-neutral-300 mb-2">"We partner with ambitious brands to create category-defining digital experiences."</p>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">Founder, Forma</div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-50/50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 p-8 rounded-3xl">
            <ContactForm theme={theme} pageId={pageId} sectionId={section.id} />
          </div>
        </div>
      </section>
    );
  }

  // Default: card-centered
  return (
    <section className="py-20 px-6 w-full">
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xl rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
            {title || "Get in touch"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </div>
        <ContactForm theme={theme} pageId={pageId} sectionId={section.id} submitLabel={buttonText || 'Send Message'} />
      </div>
    </section>
  );
}

// ── Quote ──────────────────────────────────────────────────────
export function QuoteSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { text, author } = section.content;
  if (section.variant === 'editorial-statement') return <section className="w-full px-6 py-24 text-center text-[#e9e7dc] md:py-32"><blockquote className="mx-auto max-w-4xl font-serif text-xl leading-relaxed tracking-[-0.02em] sm:text-2xl md:text-3xl">“{text}”</blockquote>{author && <cite className="mt-5 block text-[10px] uppercase tracking-[0.2em] text-white/45 not-italic">{author}</cite>}</section>;
  return (
    <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto text-center relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-8xl font-serif opacity-10 select-none" style={{ color: theme.primaryColor }}>"</div>
      <blockquote className="text-2xl md:text-3xl font-medium italic leading-relaxed relative z-10 text-slate-700 dark:text-slate-200">
        "{text}"
      </blockquote>
      {author && <cite className="block mt-6 text-sm font-semibold text-slate-400 not-italic">— {author}</cite>}
    </section>
  );
}

// ── Marquee ────────────────────────────────────────────────────
export function MarqueeSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { text } = section.content;
  const variant = section.variant || 'default';

  if (variant === 'premium') {
    return (
      <section className="py-10 overflow-hidden relative bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10" />
        {/* @ts-ignore */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Cg/%3E%3C/svg%3E")' }} />
        <Marquee aria-hidden="true" reverse={section.layout === 'right'} pauseOnHover className="[--duration:25s]">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm md:text-base font-bold uppercase tracking-[0.3em] mx-12 opacity-80" style={{ color: theme.primaryColor }}>
              {text}
            </span>
          ))}
        </Marquee>
        <p className="sr-only">{text}</p>
      </section>
    );
  }

  return (
    <section className="py-6 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-100 dark:from-slate-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-100 dark:from-slate-950 to-transparent z-10" />
      <Marquee aria-hidden="true" reverse={section.layout === 'right'} pauseOnHover className="[--duration:20s]">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-2xl md:text-4xl font-black uppercase tracking-widest mx-4 opacity-30" style={{ color: theme.primaryColor }}>
            {text}
          </span>
        ))}
      </Marquee>
      <p className="sr-only">{text}</p>
    </section>
  );
}

// ── Donate ─────────────────────────────────────────────────────
export function DonateSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, links } = section.content;
  return (
    <section className="py-12 px-4 md:px-8 max-w-md mx-auto text-center">
      {title && <h2 className="text-xl font-bold mb-6">{title}</h2>}
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map((link: any) => (
          <PageLink key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold text-sm border border-slate-200 dark:border-slate-700">
            {link.platform === 'PayPal' && <span className="text-lg">₱</span>}
            {link.platform === 'Venmo' && <span className="text-lg font-black">V</span>}
            {link.platform === 'Cash App' && <span className="text-lg font-black">$</span>}
            {!['PayPal', 'Venmo', 'Cash App'].includes(link.platform) && <span>💰</span>}
            {link.platform}
          </PageLink>
        ))}
      </div>
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────
function CountdownUnit({ value, label, primaryColor }: { value: number; label: string; primaryColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl font-black tabular-nums md:text-5xl" style={{ color: primaryColor }}>{String(value).padStart(2, '0')}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

export function CountdownSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, targetDate } = section.content;
  const variant = section.variant || 'default';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const intervalRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    intervalRef.current = setInterval(calc, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [targetDate]);

  if (variant === 'count-up') {
    return (
      <section className="py-16 px-4 md:px-8 max-w-lg mx-auto text-center">
        {title && <h2 className="text-xl font-bold mb-8">{title}</h2>}
        <div className="flex justify-center gap-6 md:gap-10">
          <div className="flex flex-col items-center">
            {/* @ts-ignore */}
            <Suspense fallback={<span className="text-4xl font-black tabular-nums">{timeLeft.days}</span>}><CountUp from={0} to={timeLeft.days} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} /></Suspense>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">days</div>
          </div>
          <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
          <div className="flex flex-col items-center">
            {/* @ts-ignore */}
            <Suspense fallback={<span className="text-4xl font-black tabular-nums">{timeLeft.hours}</span>}><CountUp from={0} to={timeLeft.hours} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} /></Suspense>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">hours</div>
          </div>
          <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
          <div className="flex flex-col items-center">
            {/* @ts-ignore */}
            <Suspense fallback={<span className="text-4xl font-black tabular-nums">{timeLeft.mins}</span>}><CountUp from={0} to={timeLeft.mins} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} /></Suspense>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">mins</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 max-w-lg mx-auto text-center">
      {title && <h2 className="text-xl font-bold mb-8">{title}</h2>}
      <div className="flex justify-center gap-6 md:gap-10">
        <CountdownUnit value={timeLeft.days} label="days" primaryColor={theme.primaryColor} />
        <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
        <CountdownUnit value={timeLeft.hours} label="hours" primaryColor={theme.primaryColor} />
        <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
        <CountdownUnit value={timeLeft.mins} label="mins" primaryColor={theme.primaryColor} />
      </div>
    </section>
  );
}

// ── Timeline ───────────────────────────────────────────────────
function TimelineStep({ item, index, theme }: { item: any, index: number, theme: ThemeConfig }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  return (
    <div ref={ref} className="flex gap-0 items-start relative w-full group">
      {/* Left column */}
      <div className="w-20 flex-shrink-0 flex flex-col items-center justify-start relative pt-1">
        {/* Circle */}
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full font-mono text-sm font-bold z-10 transition-all duration-500 relative
            ${isInView
              ? 'bg-neutral-900 text-white shadow-md scale-100 dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 text-neutral-400 border border-neutral-300 scale-90 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
            }
          `}
        >
          {index + 1}
        </div>
      </div>
      {/* Right column */}
      <div className="pb-12 last:pb-0 pl-6 flex-1">
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-500 ${isInView ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-slate-400'}`}>
          {item.label || item.title}
        </h3>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">{item.description}</p>
      </div>
    </div>
  );
}

function TattooProcessSection({ section, title, items }: { section: any; title: string; items: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [pathD, setPathD] = useState('');

  const calcPath = useCallback(() => {
    const container = containerRef.current;
    if (!container || pinRefs.current.length < 2) return;
    const cRect = container.getBoundingClientRect();
    const points = pinRefs.current
      .map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - cRect.left, y: r.top + r.height / 2 - cRect.top };
      })
      .filter(Boolean) as { x: number; y: number }[];
    if (points.length < 2) return;

    let d = `M${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midY = (p0.y + p1.y) / 2;
      // Create a generous outward curve
      const curveOutX = p0.x < p1.x ? Math.min(p0.x, p1.x) - 60 : Math.max(p0.x, p1.x) + 60;
      d += ` C${p0.x} ${midY}, ${curveOutX} ${midY}, ${p1.x} ${p1.y}`;
    }
    setPathD(d);
  }, []);

  useEffect(() => {
    calcPath();
    const ro = new ResizeObserver(calcPath);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', calcPath);
    return () => { ro.disconnect(); window.removeEventListener('resize', calcPath); };
  }, [calcPath, items]);

  return (
    <section className="w-full bg-[#0c0d0c] px-6 py-20 text-[#e9e7dc] sm:px-10 md:px-[12%] md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-[14rem] sm:mb-10 sm:max-w-sm">
          <h2 className="font-serif text-[clamp(2rem,7vw,4rem)] leading-[0.82] tracking-[-0.055em]">{title || 'From Idea To Ink'}</h2>
          {section.content.description && <p className="mt-4 text-[8px] leading-[1.4] text-white/55 sm:mt-5 sm:text-xs">{section.content.description}</p>}
        </div>
        <div ref={containerRef} className="relative grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-8 sm:gap-y-12">
          {/* Red thread SVG */}
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
            {pathD && <path d={pathD} fill="none" stroke="#b5221c" strokeWidth="2" strokeLinecap="round" />}
          </svg>
          {items.map((item: any, i: number) => {
            const isRight = i % 2 === 0; // even index → right column
            return (
              <article
                key={item.id}
                className={`relative z-10 w-[72%] rounded-md border border-[#e5e5dc]/30 bg-[#c5c6bd] p-2.5 shadow-[0_8px_22px_#0008] sm:max-w-[340px] sm:rounded-lg sm:p-5 ${isRight ? 'justify-self-end' : 'justify-self-start'}`}
                style={{ gridColumnStart: isRight ? 2 : 1, gridRowStart: i + 1 }}
              >
                {/* Pin – positioned on the edge facing the thread */}
                <span
                  ref={(el) => { pinRefs.current[i] = el; }}
                  className={`absolute h-3 w-3 rounded-full bg-[#df1111] shadow-[0_1px_6px_#0008] sm:h-4 sm:w-4 ${isRight ? '-left-1.5 top-3 sm:-left-2 sm:top-4' : '-right-1.5 top-3 sm:-right-2 sm:top-4'}`}
                />
                <div data-color-preserve className="text-[#171715]">
                  <p className="font-serif text-[9px] leading-none opacity-55 sm:text-xs">0{i + 1} ✳</p>
                  <h3 className="mt-1 font-serif text-[10px] font-semibold leading-tight sm:mt-2 sm:text-xl">{item.label}</h3>
                  <p className="mt-1.5 text-[6px] leading-[1.25] opacity-75 sm:mt-2 sm:text-[11px]">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TimelineSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const layout = section.layout || 'vertical';

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (section.variant === 'pinned-thread') return <TattooProcessSection section={section} title={title} items={items} />;

  if (layout === 'restaurant-history') return <section className="w-full bg-white px-6 py-14 text-neutral-900 sm:px-10 md:px-[10%] md:py-20"><div className="mx-auto max-w-6xl"><div className="mb-8 flex items-center justify-between"><h2 className="font-serif text-4xl md:text-5xl">{title || 'La nostra storia'}</h2><div className="flex gap-2 text-sm text-[#c6a66b]"><button aria-label="Previous years" className="grid h-8 w-8 place-items-center rounded-full border border-current">←</button><button aria-label="Next years" className="grid h-8 w-8 place-items-center rounded-full border border-current">→</button></div></div><div className="mb-5 overflow-x-auto overscroll-x-contain"><div className="flex min-w-max items-end gap-10 border-b border-neutral-400 px-5">{items.map((item: any, index: number) => <PageLink key={item.id} href={`#history-${item.id}`} className={`relative pb-3 font-serif text-3xl italic ${index === 0 ? 'text-[#c6a66b]' : 'text-neutral-900'}`}>{item.label}<span className={`absolute -bottom-1 left-0 h-3 w-3 rounded-full border-2 border-white ${index === 0 ? 'bg-[#c6a66b]' : 'bg-neutral-900'}`} /></PageLink>)}</div></div><div className="grid gap-4 md:grid-cols-3">{items.map((item: any) => <article id={`history-${item.id}`} key={item.id} className="scroll-mt-8">{item.imageUrl && <PageImage src={item.imageUrl} alt="" className="mb-3 aspect-[1.35/1] w-full object-cover" />}<p className="text-[9px] leading-relaxed text-neutral-600">{item.description}</p></article>)}</div></div></section>;

  if (layout === 'horizontal-cards') {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20">
        {title && <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white text-center mb-16">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {items.map((item: any, i: number) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-400 dark:text-slate-500 font-mono text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 mt-4 pr-10">{item.label || item.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-20" ref={containerRef}>
      {title && <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white text-center mb-16">{title}</h2>}

      <div className="relative">
        {/* Background stem line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-neutral-200 dark:bg-slate-800" />

        {/* Animated stem line */}
        <motion.div
          className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-neutral-900 dark:bg-white origin-top"
          style={{ scaleY: lineHeight }}
        />

        <div className="flex flex-col relative z-10">
          {items.map((item: any, i: number) => (
            <TimelineStep key={item.id} item={item} index={i} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Divider ────────────────────────────────────────────────────
export function DividerSection({ section }: { section: any; theme: ThemeConfig }) {
  const { layout } = section;
  return (
    <div className="py-6 max-w-4xl mx-auto px-8 w-full">
      <hr className={`border-t-2 ${layout === 'dashed' ? 'border-dashed' : layout === 'dotted' ? 'border-dotted' : 'border-solid'} border-slate-200 dark:border-slate-700`} />
    </div>
  );
}

// ── Spacer ─────────────────────────────────────────────────────
export function SpacerSection({ section }: { section: any; theme: ThemeConfig }) {
  const { layout } = section;
  const height = layout === 'small' ? 'h-6' : layout === 'medium' ? 'h-12' : layout === 'large' ? 'h-24' : 'h-40';
  return <div className={`w-full ${height}`} />;
}
// ── Stats ──────────────────────────────────────────────────────
export function StatsSection({ section, theme }: { section: z.infer<typeof StatsSectionSchema>; theme: ThemeConfig }) {
  const { eyebrow, title, description, items } = section.content;
  if (section.variant === 'salon-minimal' || section.variant === 'minimal-row') {
    return (
      <section className="w-full px-6 py-12 md:py-16 text-current">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center divide-x divide-white/10">
            {items.map((item: any) => (
              <div key={item.id} className="flex flex-col items-center justify-center px-2">
                <span className="font-serif text-3xl @sm:text-4xl @md:text-5xl font-light tracking-tight text-current">
                  {item.prefix}{item.value}{item.suffix}
                </span>
                <span className="mt-2 text-xs md:text-sm font-sans tracking-widest uppercase opacity-75 text-current">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.variant === 'editorial-band') {
    return (
      <section className="w-full px-6 py-16 md:px-10 md:py-20 text-current">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <span className="mb-3 inline-flex rounded-sm bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">{eyebrow || 'Commitment'}</span>
              {title && <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{title}</h2>}
            </div>
            <div>

              {description && <p className="max-w-xl text-xs leading-relaxed text-current/75">{description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((item: any) => (
              <div key={item.id} className="flex min-h-28 flex-col justify-end border border-white/10 bg-white/[0.06] p-4 text-left md:min-h-32">
                <p className="whitespace-pre-wrap text-2xl font-medium tracking-tight">
                  {item.prefix}<NumberTicker value={parseInt(item.value) || 0} />{item.suffix}
                </p>
                <div className="mt-2 text-[10px] leading-snug text-current/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto text-center">
      {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item: any) => (
          <div key={item.id} className="flex flex-col items-center">
            <p className="whitespace-pre-wrap text-4xl font-medium tracking-tighter text-black dark:text-white">
              {item.prefix}
              <NumberTicker value={parseInt(item.value) || 0} />
              {item.suffix}
            </p>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-2">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CaseStudiesSection({ section }: { section: z.infer<typeof CaseStudiesSectionSchema> }) {
  const { title, description, actionText, actionUrl, items } = section.content;
  if (section.variant === 'speaker-events') return <section className="w-full bg-[#ff715c] px-6 py-14 text-[#171717] sm:px-10 md:px-[8%] md:py-16">
    <div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.2em]">Ideas in motion</p><h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">{title || 'Seminars & lectures'}</h2>{description && <p className="mt-3 max-w-lg text-[10px] leading-relaxed text-neutral-800/75">{description}</p>}</div>{actionText && <PageLink href={actionUrl || '#events'} className="bg-sky-500 px-5 py-3 text-[8px] font-semibold uppercase tracking-wide text-white">{actionText} &nbsp; →</PageLink>}</div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{items.map((item: any) => <article key={item.id} className="group relative min-h-[270px] overflow-hidden rounded-xl bg-neutral-900 text-white"><PageImage src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" /><div className="absolute left-3 top-3 bg-[#ff715c] px-2.5 py-2 text-center text-[8px] font-bold uppercase leading-tight">{item.date || 'LIVE'}<br /><span className="text-[7px] font-medium">{item.category || 'EVENT'}</span></div><div className="absolute inset-x-4 bottom-4"><p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/70">{item.client || 'Talks & conversations'}</p><h3 className="mt-1 font-serif text-xl font-bold leading-tight">{item.title}</h3><p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-white/75">{item.description}</p>{item.url && <PageLink href={item.url} className="mt-3 inline-block text-[8px] font-semibold uppercase tracking-wide underline underline-offset-4">{item.buttonText || 'Reserve a seat'}</PageLink>}</div></article>)}</div>
    </div>
  </section>;
  if (section.variant === 'editorial-rows') {
    return (
      <section className="w-full bg-[#f4f4f6] px-6 py-16 text-[#171717] sm:px-10 md:px-[15%] md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10"><h2 className="text-2xl font-bold uppercase tracking-[0.08em]">{title || 'Projects'}</h2></div>
          <div className="space-y-10 md:space-y-12">
            {items.map((item: any) => <article key={item.id} className="grid items-center gap-5 md:grid-cols-[1.25fr_0.75fr] md:gap-8">
              <PageLink href={item.url || '#'} className="group block aspect-[1.65/1] overflow-hidden bg-neutral-200"><PageImage src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></PageLink>
              <div><p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{item.date || item.category || 'Selected work'}</p><h3 className="max-w-xs text-xl font-bold uppercase leading-[1.05] tracking-[0.07em] sm:text-2xl">{item.title}</h3><p className="mt-3 text-[10px] leading-relaxed text-neutral-600">{item.description}</p><PageLink href={item.url || '#'} className="mt-4 inline-flex items-center gap-3 text-[9px] font-semibold uppercase">{item.buttonText || 'View live'} <span className="grid h-8 w-8 place-items-center rounded-full border border-neutral-300 text-base">›</span></PageLink></div>
            </article>)}
          </div>
          {actionText && <PageLink href={actionUrl || '#'} className="mt-8 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-[9px] font-semibold uppercase tracking-wide text-white">{actionText}</PageLink>}
        </div>
      </section>
    );
  }
  if (section.variant === 'architecture-feature') {
    const [feature, ...previews] = items;
    if (!feature) return null;
    return <section className="w-full bg-white px-6 py-16 text-[#123b38] sm:px-10 md:px-[10%] md:py-20">
      <div className="mx-auto max-w-6xl"><div className="mb-8 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase">Curated works we’re proud of</p>{actionText && <PageLink href={actionUrl || '#'} className="border-b border-current/50 pb-1 text-[9px] uppercase">{actionText} ↘</PageLink>}</div>
        <div className="grid items-center gap-6 md:grid-cols-[0.75fr_1.5fr_0.45fr]">
          <div><h3 className="text-xl font-semibold">{feature.title}</h3><p className="mt-2 text-[10px] leading-relaxed text-neutral-600">{feature.description}</p><p className="mt-3 text-[9px]">Client <strong>{feature.client}</strong></p><p className="mt-1 text-[9px]">{feature.location}</p><PageLink href={feature.url || '#'} className="mt-3 inline-block border-b border-current pb-1 text-[9px] uppercase">See detail ↘</PageLink><div className="mt-8 flex gap-6 text-sm"><span>←</span><span className="text-[9px]">01 / {String(items.length).padStart(2, '0')}</span><span>→</span></div></div>
          <PageLink href={feature.url || '#'} className="block aspect-[1.35/1] overflow-hidden rounded-md bg-neutral-100"><PageImage src={feature.imageUrl} alt={feature.title} className="h-full w-full object-cover" /></PageLink>
          <div className="hidden flex-col gap-3 md:flex">{previews.slice(0, 2).map(item => <PageLink key={item.id} href={item.url || '#'} className="block aspect-[1.15/1] overflow-hidden rounded-md bg-neutral-100"><PageImage src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /></PageLink>)}</div>
        </div>
      </div>
    </section>;
  }
  return (
    <section className="w-full px-6 py-16 text-current md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{title}</h2>
          {description && <p className="max-w-md text-xs leading-relaxed text-current/70">{description}</p>}
          {actionText && <PageLink href={actionUrl || '#'} className="justify-self-start border border-current/40 px-4 py-2 text-[10px] font-semibold transition hover:bg-white hover:text-slate-900">{actionText}</PageLink>}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item: any) => (
            <article key={item.id} className="min-w-0">
              <PageLink href={item.url || '#'} className="group block aspect-[4/3] overflow-hidden bg-white/10">
                <PageImage src={item.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </PageLink>
              <h3 className="mt-4 text-sm font-semibold leading-snug">{item.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-current/70">{item.description}</p>
              {item.url && <PageLink href={item.url} className="mt-3 inline-block text-[10px] font-semibold underline decoration-current/40 underline-offset-4">{item.buttonText || 'Read more'}</PageLink>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogListSection({ section }: { section: z.infer<typeof BlogListSectionSchema> }) {
  const { title, actionText, actionUrl, items } = section.content;
  if (section.variant === 'image-cards') return <section className="w-full bg-white px-6 py-16 text-[#123b38] sm:px-10 md:px-[10%] md:py-20"><div className="mx-auto max-w-6xl"><div className="mb-8 flex items-center justify-between"><h2 className="text-[10px] font-semibold uppercase">{title}</h2>{actionText && <PageLink href={actionUrl || '#'} className="border-b border-current/50 pb-1 text-[9px] uppercase">{actionText} ↘</PageLink>}</div><div className="grid gap-5 md:grid-cols-3">{items.map(item => <article key={item.id} className="min-w-0"><PageLink href={item.url || '#'} className="block aspect-[1.35/1] overflow-hidden rounded-md bg-neutral-100"><PageImage src={item.imageUrl} alt="" className="h-full w-full object-cover" /></PageLink><p className="mt-3 text-[8px] text-[#123b38]/60">{item.date} &nbsp; • &nbsp; by Julie Hill</p><PageLink href={item.url || '#'} className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">{item.title}</PageLink></article>)}</div></div></section>;
  return <section className="w-full rounded-b-[2rem] border-t border-neutral-400 bg-[#f4f4f6] px-6 py-14 text-[#171717] sm:px-10 md:px-[15%] md:py-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between"><h2 className="text-2xl font-bold uppercase tracking-[0.08em]">{title}</h2>{actionText && <PageLink href={actionUrl || '#'} className="rounded-full bg-neutral-900 px-6 py-3 text-[9px] font-semibold uppercase tracking-wide text-white">{actionText}</PageLink>}</div>
      <div>{items.map(item => <article key={item.id} className="grid gap-4 border-b border-neutral-400 py-6 first:border-t md:grid-cols-[1fr_0.8fr] md:gap-10">
        <div><p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.category}<span className="mx-3">/</span>{item.date}</p><PageLink href={item.url || '#'} className="max-w-sm text-sm font-bold leading-snug hover:underline">{item.title}</PageLink></div>
        <p className="max-w-md text-[10px] leading-relaxed text-neutral-600">{item.description}</p>
      </article>)}</div>
    </div>
  </section>;
}

// ── Central Dispatcher ─────────────────────────────────────────
function FeatureSplitSection({ section, theme }: { section: z.infer<typeof FeatureSplitSectionSchema>; theme: ThemeConfig }) {
  const { content, layout = 'image-left' } = section;
  const isImageLeft = layout === 'image-left';
  const portfolioPortrait = section.variant === 'portfolio-about';
  const editorial = section.variant === 'editorial' || portfolioPortrait;

  if (section.variant === 'restaurant-story') return <section className="w-full bg-white px-6 py-12 text-neutral-900 sm:px-10 md:px-[10%] md:py-16"><div className={`mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-2 md:gap-10 ${isImageLeft ? '' : 'md:[&>div:first-child]:order-2'}`}>
    <div className="aspect-[1.05/1] overflow-hidden"><PageImage src={content.imageUrl} alt={content.imageAlt || content.title} className="h-full w-full object-cover" /></div>
    <div className="flex flex-col gap-6">{content.eyebrow && <p className="text-[8px] uppercase tracking-[0.16em] text-[#b99c65]">{content.eyebrow}</p>}{content.title && <h2 className="font-serif text-3xl leading-tight md:text-4xl">{content.title}</h2>}{content.description && <p className="max-w-md text-[10px] leading-relaxed text-neutral-600">{content.description}</p>}{content.secondaryImageUrl && <PageImage src={content.secondaryImageUrl} alt="" className="mt-1 aspect-[1.5/1] w-full object-cover md:max-w-sm" />}</div>
  </div></section>;

  if (section.variant === 'bio-spotlight') return <section className="w-full bg-[#0c0d0c] px-6 py-16 text-[#e9e7dc] sm:px-10 md:px-[8%] md:py-24">
    <div className="mx-auto grid max-w-5xl grid-cols-[0.75fr_1.25fr] items-start gap-3 sm:gap-8 md:gap-12">
      <div className="relative mt-1 overflow-hidden rounded-md shadow-2xl">
        <PageImage src={content.imageUrl} alt={content.imageAlt || content.title} className="aspect-[0.65/1] w-full object-cover" />
        {content.imageLabel && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-8 font-serif text-[clamp(1.5rem,6vw,4rem)] leading-none tracking-[-0.06em] text-white">{content.imageLabel}</span>}
      </div>
      <div className="relative z-10 -ml-2 flex flex-col sm:-ml-5">
        {content.eyebrow && <p className="mb-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:text-[9px]">{content.eyebrow}</p>}
        <h2 className="max-w-[9ch] font-serif text-[clamp(1.4rem,5.5vw,3.8rem)] leading-[0.83] tracking-[-0.05em]">{content.title}</h2>
        <ul className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4">{content.checkpoints.map((item, i) => <li key={item.id} className="flex items-start gap-2 text-[7px] leading-[1.35] text-white/65 sm:gap-3 sm:text-[10px]"><span className="font-serif text-sm leading-none text-[#c7c6bb] sm:text-lg">✳</span><span>{item.text}</span></li>)}</ul>
        {content.secondaryImageUrl && <PageImage src={content.secondaryImageUrl} alt={content.secondaryImageAlt || content.imageAlt || 'A recent studio image'} className="mt-4 aspect-[1.65/1] w-[calc(100%+1rem)] -translate-x-4 rounded-sm object-cover shadow-lg sm:mt-7 sm:w-full sm:translate-x-0" />}
      </div>
    </div>
  </section>;

  if (section.variant === 'salon-arch' || section.variant === 'arch') {
    return (
      <section className="relative w-full overflow-hidden px-6 py-16 sm:px-10 md:py-24 text-current">
        <div className={cn(
          "mx-auto flex max-w-6xl flex-col items-center gap-12 md:gap-16",
          isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
        )}>
          {/* Arch Photo */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-3.5 rounded-t-full border border-[#c5a880]/30 pointer-events-none" />
              <span data-color-preserve className="absolute -top-5 right-6 text-sm text-[#c5a880]/70 select-none">✦</span>
              <span data-color-preserve className="absolute bottom-6 -left-3 text-xs text-[#c5a880]/50 select-none">✧</span>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full rounded-b-2xl bg-[#ede6dc] shadow-xl ring-1 ring-black/10">
                <PageImage
                  src={content.imageUrl}
                  alt={content.title || ''}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            {content.eyebrow && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b89562] mb-3">
                {content.eyebrow}
              </span>
            )}
            <h2 className="mb-5 font-serif text-3xl font-normal leading-tight tracking-tight text-current md:text-5xl">
              {content.title}
            </h2>
            {content.description && (
              <p className="mb-8 font-sans text-base leading-relaxed text-current/80 max-w-lg">
                {content.description}
              </p>
            )}
            {content.buttonText && content.buttonUrl && (
              <PageLink
                href={content.buttonUrl}
                data-page-button
                className="inline-flex items-center justify-center rounded-full bg-[#b89562] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#a68352] hover:shadow-md"
              >
                {content.buttonText}
              </PageLink>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full px-6 py-16 sm:px-10 md:py-20 ${portfolioPortrait ? 'border-y border-neutral-400' : ''} ${editorial ? 'text-current' : 'bg-white lg:px-24'}`}>
      <div className={cn(
        "mx-auto flex max-w-6xl flex-col items-center gap-10 md:gap-16",
        isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
      )}>

        {/* Image Side */}
        <div className="w-full lg:w-1/2">
          {content.imageUrl ? (
            <div className={`relative w-full overflow-hidden ${portfolioPortrait ? 'aspect-[3/4] max-w-sm' : editorial ? 'aspect-square' : 'aspect-square rounded-xl shadow-2xl'}`}>
              <PageImage src={content.imageUrl} alt={content.imageAlt || content.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-400">
              No Image
            </div>
          )}
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          {content.eyebrow && (
            <span className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: theme.primaryColor }}>
              {content.eyebrow}
            </span>
          )}
          <h2 className={`mb-5 text-3xl font-semibold leading-tight tracking-tight md:text-4xl ${editorial ? 'text-current' : 'text-slate-900 lg:text-5xl'}`}>
            {content.title}
          </h2>
          {content.description && (
            <p className={`mb-7 text-base leading-relaxed ${editorial ? 'text-current/75' : 'text-slate-600 text-lg'}`}>
              {content.description}
            </p>
          )}

          {content.checkpoints && content.checkpoints.length > 0 && (
            <ul className="flex flex-col gap-4 mb-10 w-full">
              {content.checkpoints.map((cp: any) => (
                <li key={cp.id} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-green-100/50" style={{ color: theme.primaryColor }}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className={editorial ? 'text-current/85' : 'text-slate-700 text-lg'}>{cp.text}</span>
                </li>
              ))}
            </ul>
          )}

          {content.buttonText && content.buttonUrl && (
            <PageLink
              href={content.buttonUrl}
              data-page-button
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white rounded-lg transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius === 'none' ? '0' : theme.radius === 'small' ? '0.375rem' : theme.radius === 'medium' ? '0.5rem' : theme.radius === 'large' ? '0.75rem' : '9999px' }}
            >
              {content.buttonText}
            </PageLink>
          )}
        </div>

      </div>
    </section>
  );
}

function ValueCardsSection({ section, theme }: { section: z.infer<typeof ValueCardsSectionSchema>; theme: ThemeConfig }) {
  const { content } = section;

  return (
    <section className="w-full bg-[#F7F5F0] py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {(content.title || content.description) && (
          <div className="max-w-3xl mb-16">
            {content.title && (
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-6">
                {content.title}
              </h2>
            )}
            {content.description && (
              <p className="text-lg text-slate-600">
                {content.description}
              </p>
            )}
          </div>
        )}

        {content.cards && content.cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.cards.map((card: any) => (
              <div key={card.id} className="bg-white p-8 shadow-sm flex flex-col justify-between" style={{ borderRadius: theme.radius === 'none' ? '0' : theme.radius === 'small' ? '0.375rem' : theme.radius === 'medium' ? '0.5rem' : theme.radius === 'large' ? '1rem' : '1.5rem' }}>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    {card.avatarUrl && (
                      <PageImage src={card.avatarUrl} alt={card.author} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{card.author}</div>
                      {card.role && <div className="text-sm text-slate-500">{card.role}</div>}
                    </div>
                  </div>
                  <p className="text-slate-700 italic mb-10 text-lg">"{card.quote}"</p>
                </div>

                <div className="border-t border-slate-100 pt-8 mt-auto">
                  <div className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-2">
                    {card.metric}
                  </div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function renderSection(section: PageSection, theme: ThemeConfig, isPreview?: boolean, pageId?: string) {
  if (section.isHidden) return null;

  switch (section.type) {
    case 'hero': return <HeroSection key={section.id} section={section} theme={theme} isPreview={isPreview} />;
    case 'rich-text': return <RichTextSection key={section.id} section={section as any} theme={theme} />;
    case 'link-list': return <LinkListSection key={section.id} section={section as any} theme={theme} />;
    case 'site-navbar': return <SiteNavbar key={section.id} section={section as z.infer<typeof SiteNavbarSectionSchema>} theme={theme} />;
    case 'site-footer': return <SiteFooter key={section.id} section={section as z.infer<typeof SiteFooterSectionSchema>} />;
    case 'faq': return <FaqSection key={section.id} section={section as any} theme={theme} />;
    case 'url-button': return <UrlButtonSection key={section.id} section={section} theme={theme} />;
    case 'image-button': return <ImageButtonSection key={section.id} section={section} theme={theme} />;
    case 'email-button': return <EmailButtonSection key={section.id} section={section} theme={theme} />;
    case 'file-button': return <FileButtonSection key={section.id} section={section} theme={theme} />;
    case 'cta': return <CtaSection key={section.id} section={section} theme={theme} />;
    case 'social-links': return <SocialLinksSection key={section.id} section={section} theme={theme} />;
    case 'image': return <ImageSection key={section.id} section={section} theme={theme} />;
    case 'gallery': return <GallerySection key={section.id} section={section} theme={theme} />;
    case 'carousel': return <CarouselSection key={section.id} section={section} theme={theme} />;
    case 'video': return <VideoSection key={section.id} section={section} theme={theme} />;
    case 'audio': return <AudioSection key={section.id} section={section} theme={theme} />;
    case 'resume': return <ResumeSection key={section.id} section={section} theme={theme} />;
    case 'services': return <ServicesSection key={section.id} section={section} theme={theme} />;
    case 'products': return <ProductsSection key={section.id} section={section} theme={theme} />;
    case 'testimonials': return <TestimonialsSection key={section.id} section={section} theme={theme} />;
    case 'case-studies': return <CaseStudiesSection key={section.id} section={section} />;
    case 'blog-list': return <BlogListSection key={section.id} section={section as z.infer<typeof BlogListSectionSchema>} />;
    case 'announcement': return <AnnouncementSection key={section.id} section={section} theme={theme} />;
    case 'lead-form': return <LeadFormSection key={section.id} section={section} theme={theme} pageId={pageId} />;
    case 'collect-emails': return <CollectEmailsSection key={section.id} section={section} theme={theme} pageId={pageId} />;
    case 'booking': return <BookingSection key={section.id} section={section} theme={theme} />;
    case 'contact': return <ContactSection key={section.id} section={section} theme={theme} pageId={pageId} />;
    case 'quote': return <QuoteSection key={section.id} section={section} theme={theme} />;
    case 'marquee': return <MarqueeSection key={section.id} section={section} theme={theme} />;
    case 'donate': return <DonateSection key={section.id} section={section} theme={theme} />;
    case 'countdown': return <CountdownSection key={section.id} section={section} theme={theme} />;
    case 'stats': return <StatsSection key={section.id} section={section} theme={theme} />;
    case 'timeline': return <TimelineSection key={section.id} section={section} theme={theme} />;
    case 'divider': return <DividerSection key={section.id} section={section} theme={theme} />;
    case 'spacer': return <SpacerSection key={section.id} section={section} theme={theme} />;
    case 'feature-split': return <FeatureSplitSection key={section.id} section={section} theme={theme} />;
    case 'value-cards': return <ValueCardsSection key={section.id} section={section} theme={theme} />;
    default: {
      const _exhaustive: never = section;
      return <div key={(section as any).id} className="p-4 text-center text-red-500">Unknown: {(section as any).type}</div>;
    }
  }
}
