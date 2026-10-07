import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Sparkles } from 'lucide-react';

export function TrialSuccess({ name, username, domain }: { name: string; username: string; domain: string }) {
  return <main className="trial-success"><div className="success-mark"><Check size={21}/></div><p className="onboard-kicker">A NEW PAGE, OUT IN THE WORLD</p><h1>You’re <em>live.</em></h1><p className="success-intro">{name ? `${name}’s` : 'Your'} Smart Page is ready to meet its first visitor.</p><a className="success-url" href={`/${username}`} target="_blank" rel="noreferrer"><span>YOUR PUBLIC ADDRESS</span><strong>{domain}<b>/{username}</b></strong><ExternalLink size={15}/></a><Link className="onboard-primary" href="/dashboard">Enter your Dashboard <ArrowRight size={16}/></Link><div className="success-note"><Sparkles size={14}/> Your setup checklist will be waiting inside.</div></main>;
}
