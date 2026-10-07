'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ImagePlus, Sparkles } from 'lucide-react';
import { saveOnboardingPersonalization } from '@/app/onboarding/actions';

export function PersonalizePageForm({ templateId, templateName, displayName, bio, avatarUrl }: { templateId: string; templateName: string; displayName: string; bio: string; avatarUrl: string }) {
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveOnboardingPersonalization({ templateId, displayName: form.get('displayName'), bio: form.get('bio'), avatarUrl: form.get('avatarUrl') });
      if (result?.error) setError(result.error);
    });
  }
  return <main className="personalize-page"><header className="onboard-top"><Link href={`/onboarding/template/${templateId}`} className="onboard-back"><ArrowLeft size={15}/> Back to template</Link><a href="/" className="onboard-brand"><span className="onboard-mark">s.</span> Smart Page</a><span>03 <i/> 04</span></header><div className="personalize-layout"><div className="personalize-heading"><p className="onboard-kicker">A FEW DETAILS, THEN YOU’RE IN</p><h1>Let’s make it<br/><em>feel like you.</em></h1><p>We’ve chosen the {templateName} template. Add the essentials now; everything can be adjusted later in the editor.</p><div className="personalize-template"><span>YOUR STARTING POINT</span><strong>{templateName}</strong><Link href={`/onboarding/template/${templateId}`}>Change <ArrowRight size={13}/></Link></div></div><form className="personalize-form" onSubmit={submit}><label htmlFor="displayName">Name or business name <span>Required</span></label><input id="displayName" name="displayName" defaultValue={displayName} placeholder="The name visitors should know" maxLength={80} required/><label htmlFor="bio">A short introduction <span>Optional</span></label><textarea id="bio" name="bio" defaultValue={bio} placeholder="What do you make, offer, or care about?" maxLength={180} rows={3}/><div className="field-counter">A sentence is plenty.</div><label htmlFor="avatarUrl">Profile photo or logo <span>Optional</span></label><div className="url-field"><ImagePlus size={17}/><input id="avatarUrl" name="avatarUrl" type="url" defaultValue={avatarUrl} placeholder="Paste an image URL"/></div><div className="personalize-hint"><Sparkles size={15}/><span>Skip anything you’re not ready to decide. You can personalize the rest in the editor.</span></div>{error && <p className="onboard-error">{error}</p>}<button className="onboard-primary" type="submit" disabled={pending}>{pending ? 'Preparing your editor…' : 'Continue to the editor'}<ArrowRight size={16}/></button></form></div></main>;
}
