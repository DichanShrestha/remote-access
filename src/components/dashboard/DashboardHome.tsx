'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  ChevronDown, 
  Circle, 
  ClipboardCheck, 
  Copy, 
  ExternalLink, 
  Globe2, 
  MessageCircle, 
  MousePointer2, 
  QrCode, 
  Sparkles, 
  Users, 
  WandSparkles,
  X,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';

type Recent = { id: string; kind: 'lead' | 'conversation'; title: string; detail: string; createdAt: Date };
type DashboardData = {
  name: string; username: string; bio: string | null; published: boolean; origin: string; tier: string;
  visitors: number | null; leads: number; conversations: number; bookingClicks: number;
  trained: boolean; hasBot: boolean; profileComplete: boolean; recent: Recent[]; conversationCount: number;
};

export function DashboardHome({ data }: { data: DashboardData }) {
  const [isOpen, setIsOpen] = useState(!(data.published && data.profileComplete && data.trained && data.conversationCount > 0));
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgUrl, setQrSvgUrl] = useState<string>('');

  const url = `${data.origin}/${data.username}`;

  useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: '#171717',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);

      QRCode.toString(url, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#171717',
          light: '#FFFFFF'
        }
      }).then((svgString) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        setQrSvgUrl(URL.createObjectURL(blob));
      }).catch(console.error);
    }
  }, [url]);

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

  return (
    <div className="premium-dashboard max-w-[1240px] mx-auto space-y-6 pb-16">
      {/* Main Page Welcome Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E8E5DF] gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Dashboard</h1>
          <p className="text-sm text-[#737373] mt-1">Your page performance and active lead status.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <a 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E5DF] bg-white text-xs font-medium text-[#565850] hover:bg-[#FBF9F5] hover:text-[#171717] transition-colors shadow-2xs" 
            href={`/${data.username}`} 
            target="_blank" 
            rel="noreferrer"
          >
            View page <ExternalLink size={13}/>
          </a>
          <Link 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-[#262626] transition-colors shadow-xs" 
            href="/editor"
          >
            Edit page <ArrowRight size={14}/>
          </Link>
        </div>
      </header>

      {/* Card 1: Setup Checklist */}
      <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6" aria-label="Getting started checklist">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="w-9 h-9 rounded-xl bg-[#F2EFE9] text-[#171717] flex items-center justify-center flex-shrink-0">
              {isComplete ? <ClipboardCheck size={18}/> : <WandSparkles size={18}/>}
            </span>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">
                {isComplete ? 'STATUS COMPLETE' : 'A GOOD NEXT STEP'}
              </p>
              <h2 className="text-lg font-bold text-[#171717]">Setup Checklist</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                {isComplete ? 'Your page is set up. Keep this checklist nearby whenever you need it.' : 'A few small steps make your Smart Page convert effectively.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <strong className="text-base font-bold text-[#171717]">
                {completeCount}<span className="text-xs text-[#8C8D85] font-normal">/{tasks.length}</span>
              </strong>
              <div className="w-24 h-1.5 rounded-full bg-[#E8E5DF] overflow-hidden">
                <div className="h-full bg-[#171717] rounded-full transition-all duration-500" style={{ width: `${(completeCount / tasks.length) * 100}%` }}/>
              </div>
            </div>
            {isComplete && (
              <button 
                className="text-xs text-[#737373] hover:text-[#171717] flex items-center gap-1 transition-colors" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? 'Hide' : 'View'} <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}/>
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="mt-5 pt-4 border-t border-[#F2EFE9] space-y-2.5">
            {tasks.map((task, index) => {
              const Icon = task.icon;
              return (
                <div 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    task.complete ? 'bg-[#FBF9F5]/60 border-[#F2EFE9]' : 'bg-white border-[#E8E5DF]'
                  }`} 
                  key={task.title}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      {task.complete ? (
                        <span className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center">
                          <Check size={11} strokeWidth={3}/>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-[#D5D3CB] text-[10px] text-[#8C8D85] flex items-center justify-center font-medium">
                          0{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <strong className={`block text-xs font-semibold ${task.complete ? 'text-[#8C8D85] line-through' : 'text-[#171717]'}`}>
                        {task.title}
                      </strong>
                      <span className="text-[11px] text-[#737373] truncate block">{task.detail}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {task.complete ? (
                      <span className="text-[11px] font-medium text-[#8C8D85]">Done</span>
                    ) : task.disabled ? (
                      <Link href="/dashboard/settings?tab=billing" className="text-xs text-[#171717] font-medium hover:underline flex items-center gap-1">
                        Choose plan <ArrowRight size={12}/>
                      </Link>
                    ) : (
                      <Link href={task.href} className="inline-flex items-center gap-1 text-xs text-[#171717] font-medium hover:underline">
                        {task.action} <ArrowRight size={12}/>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Card 2: Public Page (Your Public Address & Live Preview) */}
      <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F2EFE9]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">Public Page</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F2EFE9] text-[#171717] border border-[#E8E5DF]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"/>
            {data.published ? 'LIVE' : 'DRAFT'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6">
          {/* Phone Mockup Preview */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-[130px] h-[220px] rounded-[24px] border-[4px] border-[#171717] overflow-hidden bg-white shadow-md flex-shrink-0">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-2 bg-[#171717] rounded-full z-10"/>
              <iframe 
                src={`/${data.username}`} 
                title={`${data.name} Smart Page preview`} 
                loading="lazy"
                className="w-[390px] h-[660px] border-0 origin-top-left transform scale-[0.31] pointer-events-none bg-white"
              />
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#8C8D85] mb-1">YOUR PUBLIC ADDRESS</p>
              <a 
                href={`/${data.username}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-[#171717] hover:text-[#565850] transition-colors"
              >
                <span>{data.origin.replace(/^https?:\/\//, '')}/</span>
                <span className="text-[#171717]">{data.username}</span>
                <ArrowUpRight size={18} className="text-[#8C8D85]"/>
              </a>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                {data.bio || 'Your public page is ready for visitors. Add a short bio in the editor to introduce your work.'}
              </p>
            </div>

            {/* Buttons: Copy Link, Download QR Code, Edit Page */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button 
                onClick={copyUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E5DF] bg-white text-xs font-medium text-[#171717] hover:bg-[#FBF9F5] transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600"/> : <Copy size={14}/>}
                {copied ? 'Copied' : 'Copy link'}
              </button>

              <button 
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E5DF] bg-white text-xs font-medium text-[#171717] hover:bg-[#FBF9F5] transition-colors shadow-2xs cursor-pointer"
              >
                <QrCode size={14}/>
                Download QR Code
              </button>

              <Link 
                href="/editor" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-[#262626] transition-colors shadow-xs"
              >
                Edit page <ArrowRight size={14}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Card 3: Analytics Stats (Quick Pulse) */}
      <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F2EFE9]">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-0.5">INSIGHTS</p>
            <h2 className="text-base font-bold text-[#171717]">Page Performance</h2>
          </div>
          <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#171717] font-medium transition-colors">
            Explore analytics <ArrowRight size={13}/>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          <Metric 
            icon={MousePointer2} 
            label="Visitors" 
            value={data.visitors === null ? '—' : data.visitors.toLocaleString()} 
            foot={data.visitors === null ? 'Tracking active' : 'Total unique visits'} 
            subdued={data.visitors === null}
          />
          <Metric 
            icon={Users} 
            label="Leads" 
            value={data.leads.toLocaleString()} 
            foot={data.leads ? 'Captured inquiries' : 'Ready to capture'} 
            href="/dashboard/leads"
          />
          <Metric 
            icon={MessageCircle} 
            label="AI Conversations" 
            value={data.conversations.toLocaleString()} 
            foot={data.conversations ? 'Active chats' : 'Trained and listening'} 
            href="/dashboard/conversations"
          />
          <Metric 
            icon={ArrowUpRight} 
            label="Booking Clicks" 
            value={data.bookingClicks.toLocaleString()} 
            foot={data.bookingClicks ? 'Appointments started' : 'Calendar triggers'} 
            href="/dashboard/analytics"
          />
        </div>
      </section>

      {/* Grid: Recent Activity & AI Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 4: Recent Activity */}
        <section className="lg:col-span-7 bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2EFE9]">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-0.5">ACTIVITY STREAM</p>
              <h2 className="text-base font-bold text-[#171717]">Recent Activity</h2>
            </div>
            <Link href="/dashboard/conversations" className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#171717] font-medium transition-colors">
              All activity <ArrowRight size={13}/>
            </Link>
          </div>

          <div className="flex-1 mt-3">
            {data.recent.length ? (
              <div className="divide-y divide-[#F2EFE9]">
                {data.recent.map((item) => (
                  <div className="py-3 flex items-start justify-between gap-3" key={item.id}>
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] text-[#171717] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.kind === 'lead' ? <Users size={14}/> : <MessageCircle size={14}/>}
                      </span>
                      <div className="min-w-0">
                        <strong className="block text-xs font-semibold text-[#171717] truncate">{item.title}</strong>
                        <p className="text-[11px] text-[#737373] truncate max-w-sm mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    <time className="text-[10px] text-[#8C8D85] whitespace-nowrap flex-shrink-0 mt-0.5">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <span className="w-10 h-10 rounded-xl bg-[#F2EFE9] text-[#8C8D85] flex items-center justify-center mb-2.5">
                  <MessageCircle size={18}/>
                </span>
                <strong className="text-xs font-semibold text-[#171717]">No activity yet</strong>
                <p className="text-[11px] text-[#737373] max-w-xs mt-1">When visitors start conversations or submit forms, inquiries appear here.</p>
              </div>
            )}
          </div>
        </section>

        {/* Card 5: AI Status */}
        <section className="lg:col-span-5 bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EFE9]">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-0.5">ASSISTANT</p>
                <h2 className="text-base font-bold text-[#171717]">AI Assistant Status</h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                data.trained ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data.trained ? 'bg-emerald-600' : 'bg-amber-500'}`}/>
                {data.trained ? 'READY' : 'NEEDS TRAINING'}
              </span>
            </div>

            <div className="py-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#F2EFE9] text-[#171717] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={16}/>
                </span>
                <p className="text-xs text-[#737373] leading-relaxed">
                  {data.trained 
                    ? 'Your assistant has knowledge to answer visitor inquiries with accuracy. Keep it updated as your offerings evolve.' 
                    : 'Add knowledge sources or Q&A pairs so your assistant can answer questions and capture client leads.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
            <span className="text-[#8C8D85] flex items-center gap-1.5 text-[11px]">
              <Circle size={6} fill="currentColor" className="text-emerald-600"/>
              {data.hasBot ? 'Assistant active' : 'Pending configuration'}
            </span>
            <Link 
              href="/dashboard/knowledge" 
              className="inline-flex items-center gap-1 font-medium text-[#171717] hover:underline"
            >
              {data.trained ? 'Manage knowledge' : 'Train assistant'} <ArrowRight size={12}/>
            </Link>
          </div>
        </section>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C8D85] hover:text-[#171717] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
            >
              <X size={18}/>
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">PUBLIC ADDRESS</span>
              <h3 className="text-lg font-bold text-[#171717]">Page QR Code</h3>
              <p className="text-xs text-[#737373]">Scan with a mobile camera to open your Smart Page.</p>
            </div>

            <div className="my-6 p-4 bg-[#FBF9F5] border border-[#E8E5DF] rounded-xl flex items-center justify-center">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${url}`} 
                  className="w-56 h-56 rounded-lg object-contain bg-white p-2 shadow-2xs"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-[#8C8D85]">
                  Generating QR code...
                </div>
              )}
            </div>

            <div className="text-center mb-5">
              <code className="text-xs bg-[#F2EFE9] px-2.5 py-1 rounded-md text-[#565850] font-mono select-all">
                {url}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {qrDataUrl && (
                <a 
                  href={qrDataUrl} 
                  download={`${data.username}-qr-code.png`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-[#262626] transition-colors shadow-xs"
                >
                  <Download size={13}/>
                  Download PNG
                </a>
              )}
              {qrSvgUrl && (
                <a 
                  href={qrSvgUrl} 
                  download={`${data.username}-qr-code.svg`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#E8E5DF] bg-white text-[#171717] text-xs font-medium hover:bg-[#FBF9F5] transition-colors shadow-2xs"
                >
                  <Download size={13}/>
                  Download SVG
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, foot, href, subdued }: { icon: typeof Users; label: string; value: string; foot: string; href?: string; subdued?: boolean }) {
  const content = (
    <div className="p-4 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5]/50 hover:bg-[#FBF9F5] transition-colors h-full flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#8C8D85] mb-2">
        <span className="text-xs font-medium text-[#737373]">{label}</span>
        <Icon size={15}/>
      </div>
      <div>
        <strong className={`block text-2xl font-bold tracking-tight text-[#171717] ${subdued ? 'text-[#8C8D85]' : ''}`}>
          {value}
        </strong>
        <span className="text-[11px] text-[#8C8D85] block mt-0.5 truncate">{foot}</span>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}
