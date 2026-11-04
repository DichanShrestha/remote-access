'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { chooseOnboardingTemplate } from '@/app/onboarding/actions';
import { useTransition } from 'react';

export function TemplateShowcase({ templateId, name, category, description, preview }: { templateId: string; name: string; category: 'CREATOR' | 'BUSINESS'; description: string; preview: ReactNode }) {
  const [pending, startTransition] = useTransition();
  return <main className="showcase-page"><header className="showcase-nav"><Link href="/onboarding/templates" className="onboard-back"><ArrowLeft size={15}/> All templates</Link><Link href="/" className="onboard-brand"><Image src="/logo.png" alt="Pageory" width={28} height={28} className="rounded-md object-contain" /> Pageory</Link><span>LIVE TEMPLATE <i/></span></header><div className="showcase-layout"><section className="showcase-copy"><p className="onboard-kicker">{category === 'CREATOR' ? 'CREATOR' : 'BUSINESS'} TEMPLATE</p><h1>{name.split(' ').slice(0, -1).join(' ') || name}<br/><em>{name.split(' ').slice(-1)}</em></h1><p>{description}</p><div className="showcase-traits"><span><Check size={14}/> Fully editable</span><span><Check size={14}/> Built with Pageory</span></div><button className="onboard-primary" onClick={() => startTransition(() => chooseOnboardingTemplate(templateId))} disabled={pending}>{pending ? 'Preparing your page…' : 'Use this template'}<ArrowRight size={16}/></button><div className="showcase-note"><Sparkles size={15}/><span>Your page starts polished. Make it yours in the next step.</span></div></section><section className="showcase-stage"><div className="showcase-stage-label"><span>THE PAGE, IN FULL</span><span>SCROLL TO EXPLORE ↓</span></div><div className="showcase-render">{preview}</div><div className="showcase-stage-base"/></section></div></main>;
}
