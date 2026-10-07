'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Circle, ClipboardCheck, Copy, ExternalLink, Globe2, MessageCircle, MousePointer2, Sparkles, Users, WandSparkles } from 'lucide-react';

type Recent = { id: string; kind: 'lead' | 'conversation'; title: string; detail: string; createdAt: Date };
type DashboardData = {
  name: string; username: string; bio: string | null; published: boolean; origin: string; tier: string;
  visitors: number | null; leads: number; conversations: number; bookingClicks: number;
  trained: boolean; hasBot: boolean; profileComplete: boolean; recent: Recent[]; conversationCount: number;
};

export function DashboardHome({ data }: { data: DashboardData }) {
  const [isOpen, setIsOpen] = useState(!(data.published && data.profileComplete && data.trained && data.conversationCount > 0));
  const [copied, setCopied] = useState(false);
  const url = `${data.origin}/${data.username}`;
  const tasks = useMemo(() => [
    { title: 'Publish your page', detail: 'Your page is live and ready to share.', complete: data.published, href: '/editor', action: 'Open page', icon: Globe2 },
    { title: 'Add a little more about you', detail: 'A short bio helps visitors understand what you do.', complete: data.profileComplete, href: '/editor', action: 'Complete your profile', icon: Users },
    { title: 'Give your assistant something to work with', detail: 'Add knowledge so your AI can answer with confidence.', complete: data.trained, href: '/dashboard/knowledge', action: data.hasBot ? 'Add knowledge' : 'Set up your assistant', icon: Sparkles, disabled: data.tier === 'expired' },
    { title: 'Welcome your first conversation', detail: 'Your assistant conversations will appear here as they happen.', complete: data.conversationCount > 0, href: '/dashboard/conversations', action: 'See conversations', icon: MessageCircle },
  ], [data]);
  const completeCount = tasks.filter((task) => task.complete).length;
  const isComplete = completeCount === tasks.length;
  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <div className="premium-dashboard">
    <header className="dash-welcome"><div><p className="dash-eyebrow"><span className="dash-live-dot"/> YOUR SMART PAGE IS LIVE</p><h1>You’re live, {data.name.split(' ')[0]}<em>.</em></h1><p className="dash-welcome-sub">Your corner of the internet is ready. Here’s what’s happening and where to go next.</p></div><div className="dash-welcome-actions"><a className="dash-button dash-button-quiet" href={`/${data.username}`} target="_blank" rel="noreferrer">View page <ExternalLink size={14}/></a><Link className="dash-button dash-button-primary" href="/editor">Edit page <ArrowRight size={15}/></Link></div></header>

    <section className={`activation-panel ${isComplete ? 'activation-complete' : ''}`} aria-label="Getting started checklist"><div className="activation-head"><div className="activation-title"><span className="activation-icon">{isComplete ? <ClipboardCheck size={18}/> : <WandSparkles size={18}/>}</span><div><p className="dash-eyebrow">A GOOD NEXT STEP</p><h2>{isComplete ? 'Setup complete' : 'Let’s get your Smart Page working for you.'}</h2><p>{isComplete ? 'Your page is set up. Keep this checklist nearby whenever you need it.' : 'A few small steps can make this page much more useful.'}</p></div></div><div className="activation-progress"><strong>{completeCount}<span>/{tasks.length}</span></strong><div className="progress-track"><i style={{ width: `${completeCount / tasks.length * 100}%` }}/></div><span>COMPLETE</span></div></div>{isComplete ? <button className="checklist-toggle" onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Hide setup checklist' : 'View setup checklist'}<ChevronDown size={15} className={isOpen ? 'rotate' : ''}/></button> : null}{isOpen && <div className="activation-tasks">{tasks.map((task, index) => { const Icon = task.icon; return <div className={`activation-task ${task.complete ? 'task-done' : ''}`} key={task.title}><div className="task-status">{task.complete ? <span className="task-check"><Check size={13}/></span> : <span className="task-number">0{index + 1}</span>}</div><div className="task-icon"><Icon size={16}/></div><div className="task-copy"><strong>{task.title}</strong><span>{task.detail}</span></div>{task.complete ? <span className="task-complete-label">Complete</span> : task.disabled ? <Link href="/dashboard/billing" className="task-action">Choose a plan <ArrowRight size={14}/></Link> : <Link href={task.href} className="task-action">{task.action}<ArrowRight size={14}/></Link>}</div> })}</div>}</section>

    <section className="dash-page-panel"><div className="dash-section-heading"><div><p className="dash-eyebrow">YOUR PAGE</p><h2>Made by you. Ready for them.</h2></div><span className="dash-status"><i/> {data.published ? 'LIVE' : 'DRAFT'}</span></div><div className="dash-page-content"><div className="dash-phone-wrap"><div className="dash-phone"><div className="dash-phone-notch"/><iframe src={`/${data.username}`} title={`${data.name} Smart Page preview`} loading="lazy"/></div><div className="dash-phone-shadow"/></div><div className="dash-page-details"><p className="dash-eyebrow">YOUR PUBLIC ADDRESS</p><a href={`/${data.username}`} target="_blank" rel="noreferrer" className="dash-public-url"><span>{data.origin.replace(/^https?:\/\//, '')}/</span><strong>{data.username}</strong><ArrowUpRight size={16}/></a><p className="dash-profile-note">{data.bio || 'Your public page is the first hello. Add a short introduction to make it feel more like you.'}</p><div className="dash-page-buttons"><button className="dash-button dash-button-quiet" onClick={copyUrl}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy link'}</button><Link className="dash-button dash-button-primary" href="/editor">Edit page <ArrowRight size={15}/></Link></div><p className="dash-page-foot">A good next move: <button onClick={copyUrl}>share your page with someone</button></p></div></div></section>

    <section className="dash-snapshot"><div className="dash-section-heading"><div><p className="dash-eyebrow">A QUICK PULSE</p><h2>Early signals</h2></div><Link href="/dashboard/analytics" className="dash-subtle-link">Explore analytics <ArrowRight size={14}/></Link></div><div className="snapshot-grid"><Metric icon={MousePointer2} label="Visitors" value={data.visitors === null ? '—' : data.visitors.toLocaleString()} foot={data.visitors === null ? 'Visitor totals aren’t tracked yet' : 'Page visits'} subdued={data.visitors === null}/><Metric icon={Users} label="Leads" value={data.leads.toLocaleString()} foot={data.leads ? 'People who reached out' : 'Captured through your page'} href="/dashboard/leads"/><Metric icon={MessageCircle} label="AI conversations" value={data.conversations.toLocaleString()} foot={data.conversations ? 'Visitor conversations' : 'Once your assistant is trained'} href="/dashboard/conversations"/><Metric icon={ArrowUpRight} label="Booking clicks" value={data.bookingClicks.toLocaleString()} foot={data.bookingClicks ? 'Visitors who opened booking' : 'When booking links are used'} href="/dashboard/analytics"/></div></section>

    <div className="dash-lower-grid"><section className="dash-activity"><div className="dash-section-heading"><div><p className="dash-eyebrow">FROM YOUR PAGE</p><h2>Recent activity</h2></div><Link href="/dashboard/conversations" className="dash-subtle-link">All activity <ArrowRight size={14}/></Link></div>{data.recent.length ? <div className="activity-list">{data.recent.map((item) => <div className="activity-item" key={item.id}><span className={`activity-icon activity-${item.kind}`}>{item.kind === 'lead' ? <Users size={15}/> : <MessageCircle size={15}/>}</span><div><strong>{item.title}</strong><p>{item.detail.length > 92 ? `${item.detail.slice(0, 92)}…` : item.detail}</p></div><time>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</time></div>)}</div> : <EmptyState icon={MessageCircle} title="Your next conversation starts with a share." body="When someone reaches out through your page or assistant, you’ll see it here." href="/dashboard/knowledge" action="Prepare your assistant"/>}</section>

      <section className="dash-assistant"><div className="dash-section-heading"><div><p className="dash-eyebrow">YOUR AI ASSISTANT</p><h2>{data.trained ? 'Ready to help.' : 'A little context goes a long way.'}</h2></div><span className={`assistant-state ${data.trained ? 'assistant-ready' : ''}`}><i/>{data.trained ? 'READY' : 'NEEDS TRAINING'}</span></div><div className="assistant-body"><span className="assistant-spark"><Sparkles size={19}/></span><p>{data.trained ? 'Your assistant has knowledge to draw from. Keep it current as your business changes.' : 'Add a few answers, a link, or a document. Your assistant will use what you provide to help visitors.'}</p><Link href="/dashboard/knowledge" className="dash-subtle-link">{data.trained ? 'Manage knowledge' : 'Train your assistant'} <ArrowRight size={14}/></Link></div><div className="assistant-foot"><span><Circle size={7} fill="currentColor"/> {data.hasBot ? 'Assistant created' : 'Not set up yet'}</span><Link href="/editor">Editor settings <ArrowUpRight size={13}/></Link></div></section></div>

    <section className="dash-bottom-nudge"><div><p className="dash-eyebrow">MAKE IT COUNT</p><h2>One share can start the whole thing.</h2><p>Your Smart Page is live. Add it to your bio and let the right people find you.</p></div><button className="dash-button dash-button-primary" onClick={copyUrl}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Link copied' : 'Copy your link'}</button></section>
  </div>;
}

function Metric({ icon: Icon, label, value, foot, href, subdued }: { icon: typeof Users; label: string; value: string; foot: string; href?: string; subdued?: boolean }) {
  const content = <><span className="metric-icon"><Icon size={16}/></span><span className="metric-label">{label}</span><strong className={subdued ? 'metric-subdued' : ''}>{value}</strong><span className="metric-foot">{foot}</span></>;
  return href ? <Link href={href} className="snapshot-card">{content}</Link> : <div className="snapshot-card">{content}</div>;
}

function EmptyState({ icon: Icon, title, body, href, action }: { icon: typeof Users; title: string; body: string; href: string; action: string }) {
  return <div className="dash-empty"><span><Icon size={18}/></span><strong>{title}</strong><p>{body}</p><Link href={href}>{action} <ArrowRight size={13}/></Link></div>;
}
