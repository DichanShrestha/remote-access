"use client";

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SiteFooterSectionSchema, SiteNavbarSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { PageImage } from '@/components/page-render/PageImage';
import { PageLink } from '@/components/page-render/PageLink';
import { readableTextColor } from '@/lib/color-contrast';
import { z } from 'zod';

type NavbarSection = z.infer<typeof SiteNavbarSectionSchema>;
type FooterSection = z.infer<typeof SiteFooterSectionSchema>;

export function SiteNavbar({ section, theme }: { section: NavbarSection; theme: ThemeConfig }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { content } = section;
  const centered = section.variant === 'centered';
  const minimal = section.variant === 'minimal';
  const pill = section.variant === 'pill';
  const overlay = section.variant === 'overlay';
  const restaurant = section.variant === 'restaurant-overlay';
  const centeredLogoLinks = section.variant === 'centered-logo-links';
  const floatingFill = section.buttonColor || section.textColor || '#e9e7dc';
  const floatingText = readableTextColor(floatingFill);

  if (centeredLogoLinks) return <header className="absolute left-0 top-0 z-30 w-full px-5 py-4 text-white sm:px-8 md:px-10">
    <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4">
      <nav aria-label="Main navigation" className="hidden items-center justify-end gap-5 @lg:flex @xl:gap-8">{content.links.slice(0, Math.ceil(content.links.length / 2)).map(link => <PageLink key={link.id} href={link.url} className="whitespace-nowrap font-[Impact,'Arial_Narrow',sans-serif] text-sm uppercase tracking-wide text-white/90 transition-colors hover:text-white">{link.label}</PageLink>)}</nav>
      <a href="#top" aria-label={content.logoText} className="relative z-10 flex h-20 min-w-28 flex-col items-center justify-center text-center font-[Impact,'Arial_Narrow',sans-serif] text-2xl font-black uppercase leading-[0.8] tracking-[-0.06em] sm:h-24 sm:min-w-32 sm:text-3xl">{content.logoUrl ? <PageImage src={content.logoUrl} alt={content.logoText} className="h-16 w-16 object-contain" /> : <><svg aria-hidden="true" className="absolute inset-0 h-full w-full text-white/90" viewBox="0 0 128 96" fill="none"><path d="M8 27 Q64 -5 120 27 M16 68 Q64 100 112 68 M16 27 L16 68 M112 27 L112 68 M8 27 L22 31 M120 27 L106 31 M16 68 L28 64 M112 68 L100 64" stroke="currentColor" strokeWidth="1.7"/><path d="M64 10 L68 19 L78 20 L70 27 L72 37 L64 32 L56 37 L58 27 L50 20 L60 19 Z M64 59 L72 70 L64 85 L56 70 Z" stroke="currentColor" strokeWidth="1.6"/></svg><span className="relative mt-1">{content.logoText}</span><span aria-hidden="true" className="relative mt-1 font-serif text-[9px] font-normal tracking-[0.25em]">✦ ✦ ✦</span></>}</a>
      <nav aria-label="More navigation" className="hidden items-center justify-start gap-5 @lg:flex @xl:gap-8">{content.links.slice(Math.ceil(content.links.length / 2)).map(link => <PageLink key={link.id} href={link.url} className="whitespace-nowrap font-[Impact,'Arial_Narrow',sans-serif] text-sm uppercase tracking-wide text-white/90 transition-colors hover:text-white">{link.label}</PageLink>)}{content.primaryLabel && <PageLink href={content.primaryUrl || '#contact'} data-page-button className="ml-2 inline-flex min-h-[100px] min-w-[210px] items-center justify-center bg-white px-7 font-[Impact,'Arial_Narrow',sans-serif] text-xl uppercase text-black">{content.primaryLabel}</PageLink>}</nav>
      <button type="button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="pageory-centered-navigation" className="col-start-3 row-start-1 ml-auto grid h-10 w-10 place-items-center border border-white/35 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    {menuOpen && <nav id="pageory-centered-navigation" aria-label="Main navigation" className="absolute left-5 right-5 top-full mt-2 grid gap-1 border border-white/20 bg-black/95 p-3 text-sm shadow-2xl backdrop-blur md:left-8 md:right-8 lg:hidden">{content.links.map(link => <PageLink key={link.id} href={link.url} onClick={() => setMenuOpen(false)} className="px-3 py-3 font-[Impact,'Arial_Narrow',sans-serif] uppercase tracking-wide hover:bg-white/10">{link.label}</PageLink>)}{content.primaryLabel && <PageLink href={content.primaryUrl || '#contact'} data-page-button className="mt-2 bg-white px-4 py-3 text-center font-[Impact,'Arial_Narrow',sans-serif] uppercase text-black">{content.primaryLabel}</PageLink>}</nav>}
  </header>;

  if (restaurant) return <header className="absolute left-0 top-0 z-20 w-full px-5 py-4 text-white sm:px-8 md:px-12">
    <div className="mx-auto flex max-w-6xl items-center justify-between">
      <button type="button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="pageory-overlay-navigation" className="grid h-11 w-11 place-items-center rounded-full border border-current/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><span aria-hidden="true" className="text-2xl font-light">{menuOpen ? '×' : '☰'}</span></button>
      <a href="#top" className="absolute left-1/2 -translate-x-1/2 whitespace-pre-line text-center font-serif text-base leading-tight sm:text-lg">{content.logoText}</a>
      <PageLink href={content.primaryUrl || '#booking'} className="min-h-10 inline-flex items-center text-[11px] font-medium uppercase tracking-wide underline underline-offset-4 sm:text-xs">{content.primaryLabel || 'Prenotazioni'}</PageLink>
    </div>
    {menuOpen && <nav id="pageory-overlay-navigation" aria-label="Main navigation" className="absolute left-5 right-5 top-16 flex flex-col gap-1 border border-white/15 bg-black/90 p-3 text-sm backdrop-blur sm:left-8 sm:right-auto sm:min-w-56 sm:p-5">{content.links.map(link => <PageLink key={link.id} href={link.url} onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{link.label}</PageLink>)}</nav>}
  </header>;

  if (section.variant === 'floating-clean') return <header className="absolute left-0 top-0 z-30 w-full px-3 py-3 text-current sm:px-6 sm:py-5">
    <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3">
      <a href="#top" className="min-h-10 shrink-0 self-center text-[10px] font-bold tracking-[0.08em] sm:text-xs">{content.logoText}</a>
      <button type="button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="pageory-floating-navigation" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-current/30 bg-black/30 md:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      <nav id="pageory-floating-navigation" aria-label="Main navigation" className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full mt-2 flex-col gap-1 rounded-xl border border-current/15 bg-black/90 p-2 text-sm shadow-xl backdrop-blur md:static md:mt-0 md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:text-xs md:shadow-none md:backdrop-blur-0`}>{content.links.map(link => <PageLink key={link.id} href={link.url} onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 text-current/75 hover:bg-white/10 hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-current md:whitespace-nowrap md:px-0 md:py-2">{link.label}</PageLink>)}</nav>
      {content.primaryLabel && <PageLink href={content.primaryUrl || '#contact'} data-page-button style={{ backgroundColor: floatingFill, color: floatingText }} className="hidden min-h-10 shrink-0 items-center rounded-full px-4 py-2 text-xs font-medium md:inline-flex">{content.primaryLabel}</PageLink>}
    </div>
  </header>;

  return (
    <header className={`w-full px-5 py-3 text-current @md:px-8 ${pill ? 'absolute left-0 top-0 z-20 flex justify-center mt-2' : overlay ? 'absolute left-0 top-0 z-20' : ''}`}>
      <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 ${centered ? '@md:flex-col @md:justify-center' : ''} ${pill ? `relative w-fit transition-all duration-300 border border-neutral-200/70 bg-white/90 px-1.5 py-1 text-sm shadow-sm backdrop-blur ${menuOpen ? 'rounded-[2rem] @md:rounded-full' : 'rounded-full'}` : ''}`}>
        {!pill && <a href="#top" className="inline-flex min-h-9 items-center text-lg font-bold tracking-tight" aria-label={content.logoText}>
          {content.logoUrl ? <PageImage src={content.logoUrl} alt={content.logoText} className="max-h-9 max-w-40 object-contain" /> : content.logoText}
        </a>}

        <button
          type="button"
          className={`min-h-10 min-w-10 items-center justify-center border border-current/20 @md:hidden ${pill ? 'flex rounded-full border-none' : 'inline-flex rounded-md'}`}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(value => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-4 py-4 @md:flex @md:w-auto @md:flex-row @md:items-center @md:gap-6 @md:py-0 ${centered ? '@md:mt-3' : '@md:ml-auto'} ${pill ? 'w-auto px-4 pb-4 pt-2 @md:px-0 @md:py-0' : ''}`}>
          <nav aria-label="Main navigation" className={`flex flex-col gap-3 @md:flex-row @md:items-center @md:gap-6 ${centered ? '@md:justify-center' : ''} ${pill ? 'gap-2 @md:gap-0' : ''}`}>
            {content.links.map(link => (
              <PageLink key={link.id} href={link.url} onClick={() => setMenuOpen(false)} className={`rounded-sm py-2 text-sm font-medium transition-opacity hover:opacity-65 @md:py-1 ${pill ? 'rounded-full px-4 py-2 text-sm font-normal hover:bg-neutral-100 @md:px-3 @md:py-1.5 @md:hover:bg-transparent' : ''}`}>
                {link.label}
              </PageLink>
            ))}
          </nav>
          {(content.secondaryLabel || content.primaryLabel) && (
            <div className={`flex flex-col gap-2 @sm:flex-row @md:items-center ${pill ? 'mt-2 border-t border-neutral-200 pt-4 @md:mt-0 @md:ml-2 @md:border-none @md:pt-0' : ''}`}>
              {!minimal && content.secondaryLabel && content.secondaryUrl && (
                <PageLink href={content.secondaryUrl} className={`inline-flex min-h-10 items-center justify-center border border-current/25 px-4 py-2 text-sm font-semibold transition-colors hover:bg-current/5 ${pill ? 'rounded-full' : ''}`}>
                  {content.secondaryLabel}
                </PageLink>
              )}
              {content.primaryLabel && content.primaryUrl && (
                <PageLink href={content.primaryUrl} data-page-button className={`inline-flex min-h-10 items-center justify-center px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85 ${pill || theme.radius === 'full' ? 'rounded-full' : 'rounded-md'}`} style={{ backgroundColor: theme.primaryColor }}>
                  {content.primaryLabel}
                </PageLink>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ section }: { section: FooterSection }) {
  const { content } = section;
  const linkGroups = content.links.reduce<Map<string, typeof content.links>>((groups, link) => {
    const group = groups.get(link.group) || [];
    group.push(link);
    groups.set(link.group, group);
    return groups;
  }, new Map());

  if (section.variant === 'footer-bar') return <footer className="relative w-full overflow-hidden bg-[#050606] px-6 pb-10 pt-16 text-white sm:px-10 md:px-[8%] md:pb-12 md:pt-20">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-12 bg-white" style={{ clipPath: 'polygon(0 0,100% 0,100% 42%,97% 24%,94% 60%,90% 31%,87% 56%,83% 20%,79% 55%,75% 26%,70% 62%,66% 24%,61% 54%,56% 26%,52% 64%,47% 30%,42% 57%,38% 22%,34% 61%,30% 32%,25% 58%,20% 21%,16% 55%,12% 28%,8% 60%,4% 32%,0 58%)' }} />
    <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 border-t border-white/15 pt-8 md:grid-cols-[0.7fr_1.8fr_1fr]">
      <div><a href="#top" className="font-[Impact,'Arial_Narrow',sans-serif] text-3xl font-black uppercase tracking-[-0.05em]">{content.logoText}</a><p className="mt-4 text-xs text-white/60">{content.legalLinks[0]?.label || '© 2026. All rights reserved.'}</p></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-7 gap-y-3">{content.links.map(link => <PageLink key={link.id} href={link.url} className="font-[Impact,'Arial_Narrow',sans-serif] text-sm uppercase text-white/85 hover:text-white">{link.label}</PageLink>)}</nav>
      <div className="text-right">{content.description && <p className="text-sm font-semibold">{content.description}</p>}{content.socialLinks.map(link => <PageLink key={link.id} href={link.url} aria-label={link.label} className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-xs">◎</PageLink>)}</div>
    </div>
  </footer>;

  if (section.variant === 'giant-wordmark') return <footer className="w-full px-6 pb-8 pt-12 text-current sm:px-10 md:px-[7%]">
    <div className="mx-auto max-w-6xl border-t border-current/15 pt-6">
      <div className="mb-5 flex items-center justify-between gap-4 text-[9px] text-current/45"><span>{content.legalLinks[0]?.label || '© 2026. All rights reserved.'}</span><nav className="flex gap-4">{content.legalLinks.slice(1).map(link => <PageLink key={link.id} href={link.url}>{link.label}</PageLink>)}</nav></div>
      <a href="#top" className="block overflow-hidden whitespace-nowrap text-[clamp(2.8rem,12vw,10rem)] font-sans font-black leading-[0.82] tracking-[-0.075em] text-current/80">{content.logoText}</a>
      {content.description && <p className="mt-5 text-[10px] text-current/50">{content.description}</p>}
    </div>
  </footer>;

  if (section.variant === 'restaurant') return <footer className="w-full bg-transparent px-6 py-10 text-inherit sm:px-10 md:px-[10%] md:py-14"><div className="mx-auto max-w-6xl"><div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr_1.2fr]"><div className="whitespace-pre-line font-serif text-2xl leading-[0.9]">{content.logoText}</div>{[...linkGroups.entries()].map(([name, links]) => <nav key={name} aria-label={name}><h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">{name}</h2><ul className="space-y-2">{links.map(link => <li key={link.id}><PageLink href={link.url} className="text-xs opacity-90 hover:opacity-100">{link.label}</PageLink></li>)}</ul></nav>)}<div><p className="whitespace-pre-line text-xs leading-relaxed">{content.description}</p>{content.socialLinks.length > 0 && <div className="mt-5 flex gap-2">{content.socialLinks.map(link => <PageLink key={link.id} href={link.url} aria-label={link.label} className="grid h-9 w-9 place-items-center rounded-full border border-current/70 text-xs">{link.label.slice(0, 1)}</PageLink>)}</div>}</div></div><div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-current/40 pt-4 text-xs"><span>{content.legalLinks[0]?.label || '© 2025 Osteria San Rocco'}</span><div className="flex gap-4">{content.legalLinks.slice(1).map(link => <PageLink key={link.id} href={link.url}>{link.label}</PageLink>)}</div></div></div></footer>;

  return (
    <footer className="w-full px-6 py-12 text-current @md:px-10 @md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className={`grid gap-x-8 gap-y-10 ${section.variant === 'compact' ? '@md:grid-cols-[2fr_3fr]' : '@md:grid-cols-[2fr_repeat(3,minmax(0,1fr))]'}`}>
          <div className="max-w-sm">
            <a href="#top" className="text-base font-semibold tracking-tight">{content.logoText}</a>
            <p className="mt-3 text-xs leading-relaxed opacity-70">{content.description}</p>
          </div>

          <div className={`grid grid-cols-2 gap-7 ${section.variant === 'compact' ? '@md:grid-cols-2' : '@md:col-span-3 @md:grid-cols-3'}`}>
            {[...linkGroups.entries()].map(([groupName, links]) => (
              <nav key={groupName} aria-label={groupName}>
                <h2 className="mb-3 text-xs font-semibold">{groupName}</h2>
                <ul className="space-y-2">
                  {links.map(link => <li key={link.id}><PageLink className="text-xs opacity-70 transition-opacity hover:opacity-100" href={link.url}>{link.label}</PageLink></li>)}
                </ul>
              </nav>
            ))}
            {content.socialLinks.length > 0 && (
              <nav aria-label="Social links">
                <h2 className="mb-3 text-xs font-semibold">Follow us</h2>
                <ul className="flex flex-wrap gap-2">
                  {content.socialLinks.map(link => <PageLink key={link.id} href={link.url} aria-label={link.label} className="inline-flex h-8 min-w-8 items-center justify-center border border-current/20 px-2 text-[10px] font-semibold transition-colors hover:bg-current/10">{link.label}</PageLink>)}
                </ul>
              </nav>
            )}
          </div>
        </div>

        {content.legalLinks.length > 0 && (
          <nav aria-label="Legal" className="mt-10 flex flex-wrap justify-start gap-x-5 gap-y-2 border-t border-current/15 pt-5 text-right @md:justify-end">
            {content.legalLinks.map(link => <PageLink key={link.id} href={link.url} className="text-[10px] opacity-70 transition-opacity hover:opacity-100">{link.label}</PageLink>)}
          </nav>
        )}
      </div>
    </footer>
  );
}
