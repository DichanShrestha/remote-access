'use client';

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, X } from 'lucide-react';
import { checkUsernameAvailability, saveOnboardingPersonalization } from '@/app/onboarding/actions';

function suggestedUsername(name: string) {
  return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
}

export function PersonalizePageForm({ templateId, templateName, displayName, username: initialUsername, domain }: { templateId: string; templateName: string; displayName: string; username: string; domain: string }) {
  const [name, setName] = useState(displayName);
  const [username, setUsername] = useState(suggestedUsername(displayName) || initialUsername);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [checked, setChecked] = useState<{ username: string; state: 'available' | 'unavailable' } | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const displayedUsername = usernameEdited || name === displayName ? username : suggestedUsername(name);
  const normalized = useMemo(() => displayedUsername.trim().toLowerCase(), [displayedUsername]);
  const validUsername = /^[a-z0-9_-]{3,30}$/.test(displayedUsername.trim().toLowerCase());
  const availability = !validUsername ? 'invalid' : checked?.username === displayedUsername.trim().toLowerCase() ? checked.state : 'checking';

  useEffect(() => {
    let active = true;
    if (!/^[a-z0-9_-]{3,30}$/.test(normalized)) return;
    const timer = setTimeout(() => checkUsernameAvailability(normalized).then((result) => { if (active && (result.state === 'available' || result.state === 'unavailable')) setChecked({ username: normalized, state: result.state }); }).catch(() => {}), 350);
    return () => { active = false; clearTimeout(timer); };
  }, [normalized]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    startTransition(async () => {
      const result = await saveOnboardingPersonalization({ templateId, displayName: name, username: displayedUsername.trim().toLowerCase() });
      if (result?.error) setError(result.error);
    });
  }

  return <main className="personalize-page premium-personalize">
    <header className="onboard-top"><Link href="/onboarding/templates" className="onboard-back"><ArrowLeft size={15}/> Templates</Link><Link href="/" className="onboard-brand"><span className="onboard-mark">s.</span> Smart Page</Link><span>02 <i/> 02</span></header>
    <div className="personalize-layout"><div className="personalize-heading"><p className="onboard-kicker">A FEW DETAILS</p><h1>Make it <em>yours.</em></h1><p>Your {templateName} page is ready. Add a name and memorable address; you can personalize everything else in the editor.</p><div className="personalize-template"><span>YOUR TEMPLATE</span><strong>{templateName}</strong><Link href="/onboarding/templates">Change <ArrowRight size={13}/></Link></div></div>
      <form className="personalize-form" onSubmit={submit}>
        <label htmlFor="displayName">Page or business name</label><input id="displayName" name="displayName" value={name} onChange={(event) => setName(event.target.value)} placeholder="The name visitors will know" maxLength={80} required autoFocus />
        <label htmlFor="username">Your page address</label>
        <div className="premium-username-field"><span>{domain}/</span><input id="username" name="username" value={displayedUsername} onChange={(event) => { setUsername(event.target.value.replace(/\s/g, '').toLowerCase()); setUsernameEdited(true); }} autoCapitalize="none" autoCorrect="off" maxLength={30} required aria-describedby="username-status" />{availability === 'checking' && <LoaderCircle size={17} className="spin" aria-label="Checking"/>}{availability === 'available' && <Check size={18} className="available-icon" aria-label="Available"/>}{availability === 'unavailable' && <X size={18} className="unavailable-icon" aria-label="Unavailable"/>}</div>
        <p id="username-status" className={`premium-username-status status-${availability}`} aria-live="polite">{availability === 'checking' ? 'Checking availability…' : availability === 'available' ? 'This address is available.' : availability === 'unavailable' ? 'Already taken. Try another.' : availability === 'invalid' ? 'Use 3–30 letters, numbers, dashes, or underscores.' : 'We’ll check this address as you type.'}</p>
        <div className="personalize-hint">Your page stays private until you choose to publish.</div>{error && <p className="onboard-error" role="alert">{error}</p>}
        <button className="onboard-primary" type="submit" disabled={pending || availability !== 'available' || !name.trim()}>{pending ? 'Creating your draft…' : 'Continue to editor'}<ArrowRight size={16}/></button>
      </form>
    </div>
  </main>;
}
