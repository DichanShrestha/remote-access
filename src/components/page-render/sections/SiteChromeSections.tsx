"use client";

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SiteFooterSectionSchema, SiteNavbarSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
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

  if (restaurant) return <header className="absolute left-0 top-0 z-20 w-full px-5 py-4 text-white sm:px-8 md:px-12">
    <div className="mx-auto flex max-w-6xl items-center justify-between">
      <button type="button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="grid h-10 w-10 place-items-center"><span className="text-2xl font-light">{menuOpen ? '×' : '☰'}</span></button>
      <a href="#top" className="absolute left-1/2 -translate-x-1/2 whitespace-pre-line text-center font-serif text-sm leading-tight sm:text-base">{content.logoText}</a>
      <a href={content.primaryUrl || '#booking'} className="text-[8px] uppercase tracking-wide underline underline-offset-4 sm:text-[9px]">{content.primaryLabel || 'Prenotazioni'}</a>
    </div>
    {menuOpen && <nav aria-label="Main navigation" className="absolute left-5 top-14 flex min-w-40 flex-col gap-3 bg-black/80 p-5 text-xs backdrop-blur sm:left-8">{content.links.map(link => <a key={link.id} href={link.url} onClick={() => setMenuOpen(false)}>{link.label}</a>)}</nav>}
  </header>;

  return (
    <header className={`w-full px-5 py-3 text-current @md:px-8 ${pill ? 'absolute left-0 top-0 z-20 flex justify-center' : overlay ? 'absolute left-0 top-0 z-20' : ''}`}>
      <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 ${centered ? '@md:flex-col @md:justify-center' : ''} ${pill ? 'w-fit rounded-full border border-neutral-200/70 bg-white/90 px-1.5 py-1 text-[9px] shadow-sm backdrop-blur' : ''}`}>
        {!pill && <a href="#top" className="inline-flex min-h-9 items-center text-lg font-bold tracking-tight" aria-label={content.logoText}>
          {content.logoUrl ? <img src={content.logoUrl} alt={content.logoText} className="max-h-9 max-w-40 object-contain" /> : content.logoText}
        </a>}

        <button
          type="button"
          className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-current/20 ${pill ? 'hidden' : '@md:hidden'}`}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(value => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-4 py-4 @md:flex @md:w-auto @md:flex-row @md:items-center @md:gap-6 @md:py-0 ${centered ? '@md:mt-3' : '@md:ml-auto'} ${pill ? '!flex w-auto p-0' : ''}`}>
          <nav aria-label="Main navigation" className={`flex flex-col gap-1 @md:flex-row @md:items-center @md:gap-6 ${centered ? '@md:justify-center' : ''} ${pill ? 'flex-row gap-0 @md:gap-0' : ''}`}>
            {content.links.map(link => (
              <a key={link.id} href={link.url} onClick={() => setMenuOpen(false)} className={`rounded-sm py-2 text-sm font-medium transition-opacity hover:opacity-65 @md:py-1 ${pill ? 'rounded-full px-2.5 py-1 text-[9px] font-normal @md:py-1' : ''}`}>
                {link.label}
              </a>
            ))}
          </nav>
          {(content.secondaryLabel || content.primaryLabel) && (
            <div className="flex flex-col gap-2 @sm:flex-row @md:items-center">
              {!minimal && content.secondaryLabel && content.secondaryUrl && (
                <a href={content.secondaryUrl} className="inline-flex min-h-10 items-center justify-center border border-current/25 px-4 py-2 text-sm font-semibold transition-colors hover:bg-current/5">
                  {content.secondaryLabel}
                </a>
              )}
              {content.primaryLabel && content.primaryUrl && (
                <a href={content.primaryUrl} data-page-button className="inline-flex min-h-10 items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85" style={{ backgroundColor: theme.primaryColor }}>
                  {content.primaryLabel}
                </a>
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

  if (section.variant === 'restaurant') return <footer className="w-full bg-[#c8ad78] px-6 py-10 text-white sm:px-10 md:px-[10%] md:py-14"><div className="mx-auto max-w-6xl"><div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr_1.2fr]"><div className="font-serif text-2xl leading-[0.9]">{content.logoText}</div>{[...linkGroups.entries()].map(([name, links]) => <nav key={name} aria-label={name}><h2 className="mb-3 text-[8px] font-semibold uppercase tracking-wide">{name}</h2><ul className="space-y-2">{links.map(link => <li key={link.id}><a href={link.url} className="text-[9px] opacity-90 hover:opacity-100">{link.label}</a></li>)}</ul></nav>)}<div><p className="text-[9px] leading-relaxed">{content.description}</p>{content.socialLinks.length > 0 && <div className="mt-5 flex gap-2">{content.socialLinks.map(link => <a key={link.id} href={link.url} aria-label={link.label} className="grid h-7 w-7 place-items-center rounded-full border border-white/70 text-[9px]">{link.label.slice(0, 1)}</a>)}</div>}</div></div><div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/60 pt-4 text-[8px]"><span>{content.legalLinks[0]?.label || '© 2025 Osteria San Rocco'}</span><div className="flex gap-4">{content.legalLinks.slice(1).map(link => <a key={link.id} href={link.url}>{link.label}</a>)}</div></div></div></footer>;

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
                  {links.map(link => <li key={link.id}><a className="text-xs opacity-70 transition-opacity hover:opacity-100" href={link.url}>{link.label}</a></li>)}
                </ul>
              </nav>
            ))}
            {content.socialLinks.length > 0 && (
              <nav aria-label="Social links">
                <h2 className="mb-3 text-xs font-semibold">Follow us</h2>
                <ul className="flex flex-wrap gap-2">
                  {content.socialLinks.map(link => <li key={link.id}><a href={link.url} aria-label={link.label} className="inline-flex h-8 min-w-8 items-center justify-center border border-current/20 px-2 text-[10px] font-semibold transition-colors hover:bg-current/10">{link.label}</a></li>)}
                </ul>
              </nav>
            )}
          </div>
        </div>

        {content.legalLinks.length > 0 && (
          <nav aria-label="Legal" className="mt-10 flex flex-wrap justify-start gap-x-5 gap-y-2 border-t border-current/15 pt-5 text-right @md:justify-end">
            {content.legalLinks.map(link => <a key={link.id} href={link.url} className="text-[10px] opacity-70 transition-opacity hover:opacity-100">{link.label}</a>)}
          </nav>
        )}
      </div>
    </footer>
  );
}
