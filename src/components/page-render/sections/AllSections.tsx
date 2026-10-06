"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { z } from 'zod';
import { PageSection, ThemeConfig, FeatureSplitSectionSchema, ValueCardsSectionSchema, CaseStudiesSectionSchema, ContactSectionSchema, StatsSectionSchema } from '@/lib/page-engine/schemas';
import { HeroSection } from './HeroSection';
import { RichTextSection } from './RichTextSection';
import { LinkListSection } from './LinkListSection';
import { FaqSection } from './FaqSection';
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaYoutube, FaTiktok, FaDribbble, FaBehance, FaSpotify, FaFacebook, FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { Marquee } from '@/components/ui/marquee';
import { submitLead } from '@/actions/leads';

// --- React Bits Components ---
// @ts-ignore
import Carousel from '@/components/Carousel';
// @ts-ignore
import Masonry from '@/components/Masonry';
// @ts-ignore
import ChromaGrid from '@/components/ChromaGrid';
// @ts-ignore
import BounceCards from '@/components/BounceCards';
// @ts-ignore

// @ts-ignore
import ReflectiveCard from '@/components/ReflectiveCard';
// @ts-ignore
import SpotlightCard from '@/components/SpotlightCard';
// @ts-ignore
import BorderGlow from '@/components/BorderGlow';
// @ts-ignore
import GlareHover from '@/components/GlareHover';
// @ts-ignore
import ScrollReveal from '@/components/ScrollReveal';
// @ts-ignore
import GradualBlur from '@/components/GradualBlur';
// @ts-ignore
import Silk from '@/components/Silk';
// @ts-ignore
import GradientBlinds from '@/components/GradientBlinds';
// @ts-ignore
import Dock from '@/components/Dock';
// @ts-ignore
import CountUp from '@/components/CountUp';
// @ts-ignore
import Stepper from '@/components/Stepper';
import { MagicCard } from '@/components/ui/magic-card';
import { ShineBorder } from '@/components/ui/shine-border';
import { NumberTicker } from '@/components/ui/number-ticker';

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
      <a
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
      </a>
    </section>
  );
}

// ── Image Button ───────────────────────────────────────────────
export function ImageButtonSection({ section }: { section: any; theme: ThemeConfig }) {
  const { imageUrl, label, url } = section.content;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <a href={url} target="_blank" rel="noopener noreferrer" className="group block w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative">
        <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800">
          <img src={imageUrl} alt={label || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {label && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <span className="px-6 py-4 text-white font-bold text-lg">{label}</span>
          </div>
        )}
      </a>
    </section>
  );
}

// ── Email Button ───────────────────────────────────────────────
export function EmailButtonSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { label, email, subject } = section.content;
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <a href={href} data-page-button className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
        <span>{label}</span>
        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </a>
    </section>
  );
}

// ── File Button ────────────────────────────────────────────────
export function FileButtonSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { label, fileUrl } = section.content;
  return (
    <section className="py-4 px-4 md:px-8 max-w-xl mx-auto">
      <a href={fileUrl} download data-page-button className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
        <span>{label}</span>
        <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      </a>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────
export function CtaSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, text, buttonText, buttonUrl } = section.content;
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{title}</h2>
        {text && <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">{text}</p>}
          <a href={buttonUrl} data-page-button className="inline-block px-10 py-4 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          {buttonText}
        </a>
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
        <a href={link.url} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center rounded-full text-white text-lg font-bold" style={{ backgroundColor: theme.primaryColor }}>
          {link.platform.charAt(0).toUpperCase()}
        </a>
      ),
    }));
    return (
      <section className="py-8 px-4 flex justify-center w-full my-4">
        {/* @ts-ignore */}
        <Dock items={dockItems} size={56} magnification={72} />
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
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-neutral-400 hover:shadow-md dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
          >
            {getIcon(link.platform)}
            {link.platform}
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Image ──────────────────────────────────────────────────────
export function ImageSection({ section }: { section: any; theme: ThemeConfig }) {
  const { url, alt, caption } = section.content;
  const { layout, variant = 'default' } = section;

  if (variant === 'scroll-reveal') {
    return (
      <section className={`py-10 ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
        {/* @ts-ignore */}
        <ScrollReveal>
          <img src={url} alt={alt || caption || 'Image'} className={`w-full h-auto object-cover ${layout === 'full' ? '' : 'rounded-2xl shadow-lg'}`} />
        </ScrollReveal>
        {caption && <p className="text-center text-sm text-slate-400 mt-4 italic">{caption}</p>}
      </section>
    );
  }

  if (variant === 'gradual-blur') {
    return (
      <section className={`py-10 relative ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
        <img src={url} alt={alt || caption || 'Image'} className={`w-full h-auto object-cover ${layout === 'full' ? '' : 'rounded-2xl shadow-lg'}`} />
        {/* @ts-ignore */}
        <GradualBlur position="bottom" strength={5} height="40%" />
        {caption && <p className="text-center text-sm text-slate-400 mt-4 italic">{caption}</p>}
      </section>
    );
  }

  return (
    <section className={`py-10 ${layout === 'full' ? 'w-full' : 'px-4 md:px-8 max-w-5xl mx-auto'}`}>
      <figure className="w-full group">
        <div className={`overflow-hidden ${layout === 'full' ? '' : 'rounded-2xl'} shadow-lg`}>
          <img src={url} alt={alt || caption || 'Image'} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
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

  if (variant === 'masonry') {
    return (
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((img: any, i: number) => (
            <div key={img.id || i} className="break-inside-avoid group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
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
        <ChromaGrid items={urls.map((u: string) => ({ image: u }))} />
      </section>
    );
  }

  if (variant === 'bounce') {
    return (
      <section className="py-20 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[500px] overflow-hidden">
        <div className="relative w-full max-w-[800px] h-[400px] flex items-center justify-center scale-75 md:scale-100">
          {/* @ts-ignore */}
          <BounceCards images={urls} containerWidth="100%" containerHeight="100%" />
        </div>
      </section>
    );
  }



  return (
    <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className={`grid gap-3 ${section.layout === 'masonry' ? 'grid-cols-2 md:grid-cols-4 items-start' : 'grid-cols-2 md:grid-cols-3'}`}>
        {images.map((img: any) => (
          <div key={img.id} className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <img src={img.url} alt={img.caption || ''} className={`w-full ${section.layout === 'masonry' ? 'h-auto' : 'aspect-square object-cover'} group-hover:scale-105 transition-transform duration-500`} />
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
import { Check } from 'lucide-react';

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
        {/* @ts-ignore */}
        <Carousel items={formattedItems} />
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
        <img
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

// ── Video ──────────────────────────────────────────────────────
export function VideoSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { url, title } = section.content;
  const variant = section.variant || 'default';
  const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;

  if (variant === 'blur-fade') {
    return (
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-5xl mx-auto">
        <BlurFade delay={0.2} inView>
          <div className="relative group">
            {/* Soft decorative background shape */}
            <div className="absolute -inset-4 md:-inset-8 rounded-[2rem] opacity-[0.04]" style={{ backgroundColor: theme.primaryColor }} />
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-200/50 dark:border-slate-800/50">
              <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen title={title || 'Video'} />
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
        <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen title={title || 'Video'} />
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
        <Stepper steps={steps} activeStep={0} />
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

  if (variant === 'glare') {
    return (
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((item: any) => (
            // @ts-ignore
            <GlareHover key={item.id} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {item.imageUrl && (
                <div className="aspect-square overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-1 line-clamp-2">{item.description}</p>
                <div className="font-bold text-sm" style={{ color: theme.primaryColor }}>{item.price}</div>
              </div>
            </GlareHover>
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
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </MagicCard>
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-lg font-serif">{item.title}</h3>
                  <div className="font-medium text-slate-500 whitespace-nowrap">{item.price}</div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                <a href={item.url || '#'} className="inline-block mt-3 text-sm font-semibold tracking-wide uppercase border-b border-transparent hover:border-slate-800 transition-colors self-start pb-0.5">Shop Now</a>
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
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          <img src={item.avatarUrl} alt={item.author} className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-slate-700" />
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

  if (variant === 'marquee') {
    // Split items into two rows
    const firstRow = items.slice(0, Math.ceil(items.length / 2));
    const secondRow = items.slice(Math.ceil(items.length / 2));

    return (
      <section className="py-20 px-0 md:px-0 w-full overflow-hidden">
        {title && <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white text-center mb-16">{title}</h2>}

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((item: any) => (
              <TestimonialCard key={item.id} item={item} isMarquee />
            ))}
          </Marquee>

          {secondRow.length > 0 && (
            <Marquee reverse pauseOnHover className="[--duration:40s] mt-6">
              {secondRow.map((item: any) => (
                <TestimonialCard key={item.id} item={item} isMarquee />
              ))}
            </Marquee>
          )}
        </div>
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
      {url && <a href={url} className="ml-3 underline underline-offset-2 opacity-80 hover:opacity-100">{buttonText || 'Learn More →'}</a>}
    </div>
  );
}

// ── Lead Form ──────────────────────────────────────────────────
function LeadFormFields({ buttonText, theme, pageId, sectionId }: { buttonText: string; theme: ThemeConfig; pageId?: string; sectionId: string }) {
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    await submitLead({
      pageId,
      componentId: sectionId,
      componentType: 'lead-form',
      name,
      email,
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
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
      {/* Service Pills */}
      <div className="flex flex-wrap gap-2 mb-1">
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
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Full Name</label>
        <input name="name" type="text" required placeholder="John Doe" className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm" />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Email Address</label>
        <input name="email" type="email" required placeholder="john@company.com" className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm" />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">Your Message</label>
        <textarea name="message" required placeholder="Tell us about your project..." rows={4} className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent hover:border-neutral-400 dark:hover:border-slate-500 transition-all shadow-sm resize-none" />
      </div>

      {/* CTA Button */}
      <button type="submit" data-page-button disabled={loading} style={{ backgroundColor: theme.primaryColor }} className="w-full bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-1 disabled:opacity-70">
        {loading ? 'Sending...' : buttonText || 'Send Message'}
        {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
      </button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-5 mt-1">
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">⚡ Avg. response: &lt; 24h</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">🔒 100% Privacy. No spam.</span>
      </div>
    </form>
  );
}

export function LeadFormSection({ section, theme, pageId }: { section: any; theme: ThemeConfig; pageId?: string }) {
  const { title, description, buttonText } = section.content;
  const variant = section.variant || 'card-centered';

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
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input name="email" type="email" required placeholder={placeholder || 'Your email'} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2" />
          <button type="submit" data-page-button disabled={loading} className="px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all flex-shrink-0 disabled:opacity-70" style={{ backgroundColor: theme.primaryColor }}>
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
  return (
    <section className="py-16 px-4 md:px-8 max-w-xl mx-auto text-center">
      <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        {description && <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">{description}</p>}
        <a href={link} target="_blank" rel="noopener noreferrer" data-page-button className="inline-block px-10 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          Book Now
        </a>
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

  if (variant === 'minimal-footer') {
    return (
      <footer className="py-16 px-8 mt-12 border-t border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 items-center">
            {address && <span>{address}</span>}
            {email && <a href={`mailto:${email}`} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">{email}</a>}
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
                  <a href={`mailto:${email}`} className="text-lg font-medium text-neutral-900 dark:text-white hover:underline decoration-neutral-300 underline-offset-4">{email}</a>
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
        <Marquee reverse={section.layout === 'right'} pauseOnHover className="[--duration:25s]">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm md:text-base font-bold uppercase tracking-[0.3em] mx-12 opacity-80" style={{ color: theme.primaryColor }}>
              {text}
            </span>
          ))}
        </Marquee>
      </section>
    );
  }

  return (
    <section className="py-6 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-100 dark:from-slate-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-100 dark:from-slate-950 to-transparent z-10" />
      <Marquee reverse={section.layout === 'right'} pauseOnHover className="[--duration:20s]">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-2xl md:text-4xl font-black uppercase tracking-widest mx-4 opacity-30" style={{ color: theme.primaryColor }}>
            {text}
          </span>
        ))}
      </Marquee>
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
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold text-sm border border-slate-200 dark:border-slate-700">
            {link.platform === 'PayPal' && <span className="text-lg">₱</span>}
            {link.platform === 'Venmo' && <span className="text-lg font-black">V</span>}
            {link.platform === 'Cash App' && <span className="text-lg font-black">$</span>}
            {!['PayPal', 'Venmo', 'Cash App'].includes(link.platform) && <span>💰</span>}
            {link.platform}
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────
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
            <CountUp from={0} to={timeLeft.days} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} />
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">days</div>
          </div>
          <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
          <div className="flex flex-col items-center">
            {/* @ts-ignore */}
            <CountUp from={0} to={timeLeft.hours} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} />
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">hours</div>
          </div>
          <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
          <div className="flex flex-col items-center">
            {/* @ts-ignore */}
            <CountUp from={0} to={timeLeft.mins} duration={2} className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }} />
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">mins</div>
          </div>
        </div>
      </section>
    );
  }

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.primaryColor }}>{String(value).padStart(2, '0')}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );

  return (
    <section className="py-16 px-4 md:px-8 max-w-lg mx-auto text-center">
      {title && <h2 className="text-xl font-bold mb-8">{title}</h2>}
      <div className="flex justify-center gap-6 md:gap-10">
        <Unit value={timeLeft.days} label="days" />
        <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
        <Unit value={timeLeft.hours} label="hours" />
        <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 self-start mt-2">:</span>
        <Unit value={timeLeft.mins} label="mins" />
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

export function TimelineSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  const layout = section.layout || 'vertical';

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
  const { title, description, items } = section.content;
  if (section.variant === 'editorial-band') {
    return (
      <section className="w-full px-6 py-16 md:px-10 md:py-20 text-current">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <span className="mb-3 inline-flex rounded-sm bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">Commitment</span>
              {title && <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{title}</h2>}
            </div>
            <div>
              <div className="mb-3 flex gap-2 text-[10px] font-semibold">
                <span className="rounded-sm bg-white px-3 py-2 text-slate-900">Expertise</span>
                <span className="rounded-sm bg-white/10 px-3 py-2">Innovation</span>
                <span className="rounded-sm bg-white/10 px-3 py-2">Accountability</span>
              </div>
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
  return (
    <section className="w-full px-6 py-16 text-current md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{title}</h2>
          {description && <p className="max-w-md text-xs leading-relaxed text-current/70">{description}</p>}
          {actionText && <a href={actionUrl || '#'} className="justify-self-start border border-current/40 px-4 py-2 text-[10px] font-semibold transition hover:bg-white hover:text-slate-900">{actionText}</a>}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item: any) => (
            <article key={item.id} className="min-w-0">
              <a href={item.url || '#'} className="group block aspect-[4/3] overflow-hidden bg-white/10">
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </a>
              <h3 className="mt-4 text-sm font-semibold leading-snug">{item.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-current/70">{item.description}</p>
              {item.url && <a href={item.url} className="mt-3 inline-block text-[10px] font-semibold underline decoration-current/40 underline-offset-4">{item.buttonText || 'Read more'}</a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Central Dispatcher ─────────────────────────────────────────
function FeatureSplitSection({ section, theme }: { section: z.infer<typeof FeatureSplitSectionSchema>; theme: ThemeConfig }) {
  const { content, layout = 'image-left' } = section;
  const isImageLeft = layout === 'image-left';
  const editorial = section.variant === 'editorial';

  return (
    <section className={`w-full px-6 py-16 sm:px-10 md:py-20 ${editorial ? 'text-current' : 'bg-white lg:px-24'}`}>
      <div className={cn(
        "mx-auto flex max-w-6xl flex-col items-center gap-10 md:gap-16",
        isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
      )}>

        {/* Image Side */}
        <div className="w-full lg:w-1/2">
          {content.imageUrl ? (
            <div className={`relative w-full overflow-hidden ${editorial ? 'aspect-square' : 'aspect-square rounded-xl shadow-2xl'}`}>
              <img src={content.imageUrl} alt={content.imageAlt || content.title} className="w-full h-full object-cover" />
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
            <a
              href={content.buttonUrl}
              data-page-button
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white rounded-lg transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius === 'none' ? '0' : theme.radius === 'small' ? '0.375rem' : theme.radius === 'medium' ? '0.5rem' : theme.radius === 'large' ? '0.75rem' : '9999px' }}
            >
              {content.buttonText}
            </a>
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
                      <img src={card.avatarUrl} alt={card.author} className="w-12 h-12 rounded-full object-cover" />
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
