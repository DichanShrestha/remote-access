"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageSection, ThemeConfig } from '@/lib/page-engine/schemas';
import { HeroSection } from './HeroSection';
import { RichTextSection } from './RichTextSection';
import { LinkListSection } from './LinkListSection';
import { AiChatSection } from './AiChatSection';
import { FaqSection } from './FaqSection';

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
      <a href={href} className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
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
      <a href={fileUrl} download className="group flex items-center justify-between w-full px-6 py-4 rounded-2xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
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
        <a href={buttonUrl} className="inline-block px-10 py-4 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          {buttonText}
        </a>
      </div>
    </section>
  );
}

// ── Social Links / Follow ──────────────────────────────────────
export function SocialLinksSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { links } = section.content;
  const { layout } = section;
  return (
    <section className="py-10 px-4 md:px-8 max-w-2xl mx-auto">
      <div className={`flex ${layout === 'grid' ? 'flex-wrap gap-3 justify-center' : 'flex-row gap-3 justify-center flex-wrap'}`}>
        {links.map((link: any) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-full border-2 font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
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
  const { layout } = section;
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
  if (!images || images.length === 0) {
    return <section className="py-10 px-4 text-center text-slate-400 text-sm">Add images to your gallery</section>;
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
export function VideoSection({ section }: { section: any; theme: ThemeConfig }) {
  const { url, title } = section.content;
  const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
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
  return (
    <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
      {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="group p-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">{item.description}</p>
            {item.price && <div className="font-bold text-lg" style={{ color: theme.primaryColor }}>{item.price}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Products ───────────────────────────────────────────────────
export function ProductsSection({ section }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
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
export function TestimonialsSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  return (
    <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
      {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item: any) => (
          <blockquote key={item.id} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute -top-2 -left-1 text-7xl leading-none font-serif opacity-10" style={{ color: theme.primaryColor }}>"</div>
            <p className="text-lg italic mb-6 relative z-10 leading-relaxed">{item.quote}</p>
            <div className="flex items-center gap-3 relative z-10">
              {item.avatarUrl && <img src={item.avatarUrl} className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" />}
              <div>
                <div className="font-bold text-sm">{item.author}</div>
                {item.role && <div className="text-xs text-slate-400">{item.role}</div>}
              </div>
            </div>
          </blockquote>
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
export function LeadFormSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, description, buttonText } = section.content;
  return (
    <section className="py-16 px-4 md:px-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && <p className="text-slate-400 text-sm mb-8">{description}</p>}
      <form className="flex flex-col gap-3" onSubmit={e => e.preventDefault()}>
        <input type="text" placeholder="Your name" className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2" style={{ ['--tw-ring-color' as any]: theme.primaryColor }} />
        <input type="email" placeholder="Your email" className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2" />
        <textarea placeholder="Your message" rows={3} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none focus:outline-none focus:ring-2" />
        <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ backgroundColor: theme.primaryColor }}>
          {buttonText}
        </button>
      </form>
    </section>
  );
}

// ── Collect Emails ─────────────────────────────────────────────
export function CollectEmailsSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, placeholder, buttonText } = section.content;
  return (
    <section className="py-12 px-4 md:px-8 max-w-md mx-auto text-center">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
        <input type="email" placeholder={placeholder || 'Your email'} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2" />
        <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all flex-shrink-0" style={{ backgroundColor: theme.primaryColor }}>
          {buttonText}
        </button>
      </form>
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
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: theme.primaryColor }}>
          Book Now
        </a>
      </div>
    </section>
  );
}

// ── Contact ────────────────────────────────────────────────────
export function ContactSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, email, phone, address } = section.content;
  return (
    <section className="py-16 px-4 md:px-8 max-w-2xl mx-auto text-center">
      {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}
      <div className="flex flex-col gap-4 text-base">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium" style={{ color: theme.primaryColor }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {email}
          </a>
        )}
        {phone && <div className="text-slate-500">{phone}</div>}
        {address && <div className="text-sm text-slate-400">{address}</div>}
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
  const direction = section.layout === 'right' ? 'marquee-right' : 'marquee-left';
  return (
    <section className="py-6 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />
      <div className={`flex gap-12 whitespace-nowrap animate-marquee`} style={{ animationDirection: section.layout === 'right' ? 'reverse' : 'normal' }}>
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-2xl md:text-4xl font-black uppercase tracking-widest opacity-15" style={{ color: theme.primaryColor }}>
            {text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; display: flex; width: max-content; }
      `}</style>
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
export function TimelineSection({ section, theme }: { section: any; theme: ThemeConfig }) {
  const { title, items } = section.content;
  return (
    <section className="py-16 px-4 md:px-8 max-w-2xl mx-auto">
      {title && <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>}
      <div className="flex flex-col gap-0">
        {items.map((item: any, i: number) => (
          <div key={item.id} className="flex gap-5 items-start">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md" style={{ backgroundColor: theme.primaryColor }}>
                {i + 1}
              </div>
              {i < items.length - 1 && <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700" />}
            </div>
            <div className="pb-8 flex-1">
              <div className="font-bold text-lg">{item.label}</div>
              {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>}
            </div>
          </div>
        ))}
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

// ── Central Dispatcher ─────────────────────────────────────────
export function renderSection(section: PageSection, theme: ThemeConfig) {
  if (section.isHidden) return null;

  switch (section.type) {
    case 'hero': return <HeroSection key={section.id} section={section} theme={theme} />;
    case 'rich-text': return <RichTextSection key={section.id} section={section as any} theme={theme} />;
    case 'link-list': return <LinkListSection key={section.id} section={section as any} theme={theme} />;
    case 'ai-chat': return <AiChatSection key={section.id} section={section as any} theme={theme} />;
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
    case 'announcement': return <AnnouncementSection key={section.id} section={section} theme={theme} />;
    case 'lead-form': return <LeadFormSection key={section.id} section={section} theme={theme} />;
    case 'collect-emails': return <CollectEmailsSection key={section.id} section={section} theme={theme} />;
    case 'booking': return <BookingSection key={section.id} section={section} theme={theme} />;
    case 'contact': return <ContactSection key={section.id} section={section} theme={theme} />;
    case 'quote': return <QuoteSection key={section.id} section={section} theme={theme} />;
    case 'marquee': return <MarqueeSection key={section.id} section={section} theme={theme} />;
    case 'donate': return <DonateSection key={section.id} section={section} theme={theme} />;
    case 'countdown': return <CountdownSection key={section.id} section={section} theme={theme} />;
    case 'timeline': return <TimelineSection key={section.id} section={section} theme={theme} />;
    case 'divider': return <DividerSection key={section.id} section={section} theme={theme} />;
    case 'spacer': return <SpacerSection key={section.id} section={section} theme={theme} />;
    default: {
      const _exhaustive: never = section;
      return <div key={(section as any).id} className="p-4 text-center text-red-500">Unknown: {(section as any).type}</div>;
    }
  }
}
