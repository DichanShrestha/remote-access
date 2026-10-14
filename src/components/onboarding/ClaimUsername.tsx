'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, X } from 'lucide-react';
import { checkUsernameAvailability, saveOnboardingUsername } from '@/app/onboarding/actions';

export function ClaimUsername({ currentUsername, domain, alreadyActivated = false }: { currentUsername: string; domain: string; alreadyActivated?: boolean }) {
  const [username, setUsername] = useState(currentUsername);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const value = username.trim().toLowerCase();
    if (!value) return;
    const timer = setTimeout(async () => setStatus((await checkUsernameAvailability(value)).state), 320);
    return () => clearTimeout(timer);
  }, [username]);
  const save = () => { setError(''); startTransition(async () => { const result = await saveOnboardingUsername(username); if (result?.error) setError(result.error); }); };
  return <main className="claim-page"><header className="onboard-top"><Link href="/editor" className="onboard-back"><ArrowLeft size={15}/> Back to editor</Link><Link href="/" className="onboard-brand"><span className="onboard-mark">s.</span> Pageory</Link><span>04 <i/> 04</span></header><section className="claim-content"><p className="onboard-kicker">YOUR PAGE IS READY FOR ITS NAME</p><h1>Claim your<br/><em>little corner.</em></h1><p className="claim-intro">Choose the address people will remember. You can change it later in settings.</p><div className="claim-field"><span>{domain}/</span><input aria-label="Choose your page username" value={username} onChange={(event) => { const nextUsername = event.target.value.replace(/\s/g, '').toLowerCase(); setUsername(nextUsername); setStatus(nextUsername ? 'checking' : 'invalid'); }} autoCapitalize="none" autoCorrect="off" maxLength={30}/>{status === 'checking' && <LoaderCircle className="spin" size={16}/>}{status === 'available' && <Check className="available-icon" size={17}/>}{status === 'unavailable' && <X className="unavailable-icon" size={17}/>}</div><div className={`claim-status status-${status}`}>{status === 'checking' ? 'Checking availability…' : status === 'available' ? 'This address is available.' : status === 'unavailable' ? 'This address is already in use.' : status === 'invalid' ? 'Use 3–30 letters, numbers, dashes, or underscores.' : 'Use 3–30 letters, numbers, dashes, or underscores.'}</div><div className="claim-result"><span>YOUR PAGE ADDRESS</span><strong>{domain}<b>/{username || 'your-name'}</b></strong><span className="claim-result-icon">↗</span></div>{error && <p className="onboard-error">{error}</p>}<button className="onboard-primary claim-continue" onClick={save} disabled={status !== 'available' || pending}>{pending ? 'Saving your address…' : alreadyActivated ? 'Continue to dashboard' : 'Continue to plan'}<ArrowRight size={16}/></button><p className="claim-reassurance">{alreadyActivated ? 'Your plan is active. Claiming this address will publish your page and open your dashboard.' : 'Your page won’t be public until you confirm your plan and start the trial.'}</p></section></main>;
}
