'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

type Category = 'CREATOR' | 'BUSINESS';
type Template = { id: string; name: string; description: string; mood: string; category: Category };

export function TemplateLibrary({ templates }: { templates: Template[] }) {
  const [filter, setFilter] = useState<'ALL' | Category>('ALL');
  const visible = useMemo(() => filter === 'ALL' ? templates : templates.filter((template) => template.category === filter), [filter, templates]);
  return <main className="onboard-library premium-library">
    <header className="onboard-top"><Link href="/" className="onboard-brand"><span className="onboard-mark">s.</span> Smart Page</Link><span>01 <i/> 02</span></header>
    <section className="library-intro"><p className="onboard-kicker">A BEAUTIFUL PLACE TO BEGIN</p><h1>Choose your <em>starting point.</em></h1>
      <div className="template-filter" role="tablist" aria-label="Filter templates">
        {(['ALL', 'CREATOR', 'BUSINESS'] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value === 'ALL' ? 'All' : value === 'CREATOR' ? 'Creator' : 'Business'}</button>)}
      </div>
    </section>
    <div className="onboard-template-grid">{visible.map((template, index) => <article key={template.id} className="onboard-template-card">
      <Link href={`/onboarding/personalize?template=${template.id}`} className="onboard-template-visual" aria-label={`Choose ${template.name}`}>
        <div className="template-device"><iframe src={`/template-preview?id=${template.id}`} title={`${template.name} preview`} loading={index < 4 ? 'eager' : 'lazy'} tabIndex={-1}/></div>
        <span className="template-seq">{template.category === 'CREATOR' ? 'CREATOR' : 'BUSINESS'}</span><span className="template-preview-affordance">Choose template <ArrowUpRight size={14}/></span><span className={`template-halo halo-${index % 5}`}/>
      </Link>
      <div className="onboard-template-info"><div><p>{template.mood}</p><h2>{template.name}</h2><span>{template.description}</span></div></div>
      <Link className="premium-template-choose" href={`/onboarding/personalize?template=${template.id}`}>Use this template <ArrowRight size={15}/></Link>
    </article>)}</div>
  </main>;
}
