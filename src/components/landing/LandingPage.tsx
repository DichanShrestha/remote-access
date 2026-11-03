'use client'

import { useEffect, useState } from 'react'
import { ReactLenis } from 'lenis/react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Sparkles } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import { getPlanPrice, getPricingModeCookie, getWhatsAppUrl, NEPAL_TRIAL_MESSAGE, PAID_PLANS, type PricingMode, WHATSAPP_NUMBER } from '@/lib/pricing'

type User = { id: string; email?: string } | null

const templates = [
  { id: 'creator-fashion', name: 'The Creator', type: 'Creator · Fashion', color: 'rose' },
  { id: 'restaurant', name: 'Casa Nera', type: 'Restaurant · Menu', color: 'olive' },
  { id: 'luxury-skincare', name: 'Form & Field', type: 'Beauty · Product', color: 'lavender' },
  { id: 'editorial-portfolio', name: 'Nandini Jaryal', type: 'Developer · Designer', color: 'cream' },
  { id: 'corporate-consulting', name: 'Corporate Consulting', type: 'Corporate · Consulting', color: 'blue' },
  { id: 'point-architecture', name: 'Point Architecture', type: 'Architecture · Studio', color: 'gray' }
]

const faqs = [
  ['What is Pageory?', 'Pageory helps creators and professionals turn their online presence into opportunities. Create one beautiful page to showcase your work, offers, and story. An AI chatbot answers visitor questions using information you provide, helping interested people take the next step toward an inquiry, booking, or collaboration.'],
  ['Do I need to know how to code?', 'No. Choose a template, personalize it in the visual editor, and publish when it feels right.'],
  ['How does the AI chatbot work?', 'You provide information about your work, services, offers, and other relevant details. Your AI chatbot uses that knowledge to answer visitor questions and help them understand what you offer. Its answers depend on the information you provide.'],
  ['Can I collect leads and bookings?', 'Pageory gives visitors a clear way to express interest, contact you, or move to a booking destination. The goal is to make the next step easier when someone is interested in your work.'],
  ['Can I change my page later?', 'Absolutely. Update your content, layout, and styling whenever you need to.'],
]

const planDescriptions = {
  smart_page: 'Everything you need to present your work professionally and give visitors a clear way to connect with you.',
  smart_page_ai: 'Add an AI chatbot that answers visitor questions from your knowledge and helps interested visitors take the next step.',
}

export function LandingPage({ user, initialPricingMode, pricingLockedToNepal = false }: { user: User; initialPricingMode: PricingMode; pricingLockedToNepal?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [pricingMode, setPricingMode] = useState<PricingMode>(initialPricingMode)

  const selectPricingMode = (mode: PricingMode) => {
    if (pricingLockedToNepal && mode !== 'nepal') return
    setPricingMode(mode)
    document.cookie = getPricingModeCookie(mode)
  }

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const startHref = user ? '/dashboard' : '/editor'
  return (
    <ReactLenis root options={{ lerp: 0.085, smoothWheel: true }}>
      <main className="landing-page bg-[#FFFEFB]">
        <nav className="lp-nav">
          <a href="#top" className="lp-brand" aria-label="Pageory home"><Image src="/logo.png" alt="Pageory" width={28} height={28} className="rounded-lg object-contain" priority /><span>Pageory</span></a>
          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#templates" onClick={() => setMenuOpen(false)}>Templates</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          </div>
          <div className="lp-nav-actions"><Link className="lp-login" href="/affiliate/apply">Become an Affiliate</Link>{user ? <Link className="lp-login" href="/dashboard">Dashboard</Link> : <AuthButton user={user} label="Login" className="login-button" />}<Link className="button button-dark nav-cta" href={startHref}>Get started <ArrowUpRight size={15} /></Link></div>
          <button className="lp-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
        </nav>

        <section className="hero relative overflow-hidden bg-[#FFFEFB]" id="top">
          {/* Rich Warm Luxury Ambient Glows (Background Only) */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Primary Golden-Amber Glow centered behind Phone Mockups */}
            <div
              className="absolute top-[45%] right-[-8%] sm:right-[2%] md:right-[8%] -translate-y-1/2 w-[720px] md:w-[900px] h-[720px] md:h-[900px] rounded-full blur-[75px] md:blur-[95px] opacity-95"
              style={{
                background: 'radial-gradient(circle, rgba(248, 212, 142, 0.9) 0%, rgba(242, 185, 102, 0.6) 35%, rgba(249, 225, 172, 0.25) 60%, transparent 75%)'
              }}
            />

            {/* Upper Warm Halo behind the Top of Mockups */}
            <div
              className="absolute top-[10%] right-[3%] w-[520px] h-[520px] rounded-full blur-[70px] opacity-80"
              style={{
                background: 'radial-gradient(circle, rgba(250, 220, 155, 0.85) 0%, rgba(244, 192, 115, 0.45) 45%, transparent 70%)'
              }}
            />

            {/* Soft Ambient Transition Glow behind Headline */}
            <div
              className="absolute top-[38%] left-[-8%] md:left-[0%] -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[110px] opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(248, 222, 170, 0.7) 0%, rgba(243, 200, 138, 0.3) 50%, transparent 75%)'
              }}
            />
          </div>

          <div className="hero-grain" />

          <div className="hero-copy relative z-10">
            <div className="eyebrow border border-[#E8E5DF] bg-[#FFFEFB]/80 backdrop-blur-sm rounded-full px-3 py-1 w-fit"><span className="eyebrow-dot" /> TURN ATTENTION INTO OPPORTUNITY</div>
            <h1 className="text-[#171717] [text-shadow:none] [filter:none]">Turn your online presence<br />into <em>opportunities.</em></h1>
            <p className="hero-description text-[#171717]/85 !max-w-[450px] [text-shadow:none] [filter:none]">
              Showcase what you do on one beautiful page. An AI chatbot answers visitor questions and helps turn interest into client inquiries, booked calls, and brand deals.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href={startHref}>Create your page <ArrowRight size={16} /></Link>
              <a className="text-link" href="#templates">Explore templates <ArrowDown size={14} /></a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars"><span>C</span><span>F</span><span>B</span><span>+</span></div>
              <span>For creators, freelancers,<br />and businesses.</span>
            </div>
          </div>
          <div className="hero-stage relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)]" aria-label="Examples of Pageory mobile templates">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-note note-top border border-[#E8E5DF] rounded-full"> <span className="online-dot" /> One link. More possibility.</div>
            <PhoneFrame template="creator-fashion" className="hero-phone hero-phone-back relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)]" label="Creator profile template" />
            <PhoneFrame template="creator-profile" className="hero-phone hero-phone-left relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)]" label="Beauty brand template" />
            <PhoneFrame template="corporate-consulting" className="hero-phone hero-phone-main relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)]" label="Creator portfolio template" />
            <div className="hero-note note-bottom border border-[#E8E5DF] rounded-full"><span className="online-dot" /> Your page is ready when they are.</div>
            <span className="stage-index">01 — 03</span>
          </div>
          <div className="hero-bottom relative z-10"><span>YOUR ONLINE PRESENCE, WORKING HARDER</span><span>SCROLL TO SEE WHAT’S POSSIBLE ↓</span></div>
        </section>

        <div className="benefit-marquee" aria-label="Premium templates, AI chat, lead capture, analytics, built for social"><div className="marquee-track">{Array.from({ length: 2 }, (_, repeat) => <span key={repeat}>PREMIUM TEMPLATES <b>✳</b> AI THAT ANSWERS <b>✳</b> LEAD CAPTURE <b>✳</b> REAL ANALYTICS <b>✳</b> MADE FOR SOCIAL <b>✳</b> A PAGE THAT CONVERTS <b>✳</b></span>)}</div></div>

        <section className="templates-section section-pad" id="templates">
          <div className="section-heading reveal"><div><p className="kicker">01 / MADE WITH PAGEORY</p><h2>First impressions,<br /><em>beautifully handled.</em></h2></div><div className="heading-aside"><p>Not another list of links. A small, considered world that makes your work feel unmistakably yours.</p><Link href={startHref} className="under-link">Find your starting point <ArrowUpRight size={15} /></Link></div></div>
          <div className="template-gallery"><div className="gallery-track">{[...templates, ...templates].map((item, index) => <article className={`template-card template-${item.color}`} key={`${item.id}-${index}`}><div className="template-phone"><PhoneFrame template={item.id} label={`${item.name} template`} /><span className="template-number">0{index % templates.length + 1}</span></div><div className="template-caption"><div><p>{item.type}</p><h3>{item.name}</h3></div><a href={`/template-preview?id=${item.id}`} target="_blank" rel="noreferrer" aria-label={`Preview ${item.name}`}><ArrowUpRight size={17} /></a></div></article>)}</div></div>
          <div className="gallery-footer"><span>THE RIGHT FEEL, BEFORE YOU WRITE A WORD.</span><div><span className="gallery-line" /><span>01 — 05</span></div></div>
        </section>

        <section className="editor-section section-pad" id="editor">
          <div className="section-heading reveal"><div><p className="kicker">02 / EDIT IT LIVE</p><h2>Made personal.<br /><em>Made simple.</em></h2></div><div className="heading-aside"><p>Your page takes shape as you work. Choose a starting point, adjust the details, and see it come together in real time.</p><Link href="/editor?demo=creator-profile" className="under-link">Try the live editor <ArrowUpRight size={15} /></Link></div></div>
          <div className="editor-showcase reveal">
            <div className="editor-browser-bar">
              <div className="browser-dots"><i /><i /><i /></div>
              <span>pageory.app / editor</span>
              <span className="browser-live"><i /> LIVE PREVIEW</span>
            </div>
            <video
              src="/personalized_editing.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="editor-frame !h-auto aspect-video w-full object-cover"
            />
            <div className="editor-steps"><span><b>01</b> Choose a template</span><span><b>02</b> Make it yours</span><span><b>03</b> Publish beautifully</span></div>
          </div>
        </section>

        <section className="journey-section section-pad " id="features">
          <div className="journey-top reveal">
            <p className="kicker !text-[#d4b194] text-xs font-semibold tracking-[0.2em]">03 / MORE THAN A PRETTY PAGE</p>
            <h2 className="!text-[#FDFCF8]">
              Your page doesn’t just<br />
              <em className="!text-white">look good.</em>
            </h2>
            <p className="!text-[#d6d5ce]">It keeps the conversation going after the scroll.</p>
          </div>
          <div className="journey-flow reveal"><div className="journey-line" /><div className="journey-step"><span className="step-no">01</span><div className="step-icon social-icon"><span>◎</span></div><h3>They find you</h3><p>One tap from your social bio.</p><span className="step-tag">SOCIAL VISITOR</span></div><div className="journey-step"><span className="step-no">02</span><div className="step-icon page-icon"><Image src="/logo.png" alt="Pageory" width={32} height={32} className="object-contain rounded-md" /></div><h3>They get the picture</h3><p>Your work, offers, and story in one place.</p><span className="step-tag">PAGEORY PAGE</span></div><div className="journey-step"><span className="step-no">03</span><div className="step-icon ai-icon"><Sparkles size={21} /></div><h3>They ask. It answers.</h3><p>A helpful AI conversation, shaped by you.</p><span className="step-tag">AI CONVERSATION</span></div><div className="journey-step"><span className="step-no">04</span><div className="step-icon lead-icon"><Check size={22} /></div><h3>You meet the right people</h3><p>Interest becomes an inquiry, booking, or lead.</p><span className="step-tag">LEAD CAPTURED</span></div></div>
          <div className="journey-footnote"><span>*</span> Your AI answers from the information you choose to share.</div>
        </section>

        <section className="outcomes-section section-pad">
          <div className="outcomes-intro reveal"><p className="kicker">04 / BUILT AROUND YOUR NEXT STEP</p><h2>Everything in its<br /><em>right place.</em></h2><p>Thoughtful tools that help the right people understand what you do — and do something about it.</p></div>
          <div className="outcome-list">
            {[
              ['A page that feels like you', 'Premium templates that bring your work, story, and offers together in one place—so visitors quickly understand what you do.', '01'],
              ['Answers while you’re away', 'Your AI chatbot answers visitor questions using the knowledge you provide, even when you’re not available.', '02'],
              ['Give interest somewhere to go', 'Help visitors take the next step with inquiries, contact details, or a direct path to booking.', '03'],
              ['Understand what gets attention', 'Use visitor and page analytics to understand how people discover and engage with your page.', '04'],
              ['Keep your page current', 'Update your sections, colors, and content as your work and offers evolve.', '05'],
            ].map(([title, text, number]) => <div className="outcome-row reveal" key={number}><span className="outcome-no">{number}</span><h3>{title}</h3><p>{text}</p><ArrowUpRight size={18} /></div>)}
          </div>
        </section>

        <section className="comparison-section section-pad" id="comparison"><div className="comparison-intro reveal"><p className="kicker">05 / THE DIFFERENCE IS THE WHOLE POINT</p><h2>More than a page.<br /><em>A path to opportunity.</em></h2><p>A quick way to see where Pageory fits.</p></div><div className="comparison-table reveal"><div className="compare-head"><span>WHAT MATTERS</span><span>PAGEORY</span><span>LINK DIRECTORY</span><span>TRADITIONAL SITE</span></div>{[['Designed page templates', true, 'Varies', true], ['AI answers from your content', true, false, 'Add-on'], ['Built-in lead capture', true, 'Varies', true], ['Purpose-built for social bios', true, true, false], ['Visual editing, no code', true, true, 'Varies']].map(([label, a, b, c]) => <div className="compare-row" key={String(label)}><span>{label}</span><span>{a === true ? <Check size={16} /> : a}</span><span>{b === true ? <Check size={16} /> : b === false ? '—' : b}</span><span>{c === true ? <Check size={16} /> : c === false ? '—' : c}</span></div>)}<p className="comparison-note">Features vary by provider and plan. Comparison focuses on common product formats.</p></div></section>

        <section className="pricing-section section-pad" id="pricing"><div className="pricing-card reveal"><div className="pricing-art"><div className="pricing-orb orb-a" /><div className="pricing-orb orb-b" /><div className="pricing-note">Less friction.<br /><em>More connection.</em></div><div className="pricing-mini-phone"><PhoneFrame template="creator-profile" label="Pageory sample" /></div></div><div className="pricing-copy"><p className="kicker">06 / YOUR NEXT CHAPTER</p><h2>Plans that grow<br />with <em>you.</em></h2><div className="pricing-mode" role="group" aria-label="Choose pricing location"><button type="button" aria-pressed={pricingMode === 'nepal'} onClick={() => selectPricingMode('nepal')}>🇳🇵 Nepal (NPR)</button>{!pricingLockedToNepal && <button type="button" aria-pressed={pricingMode === 'international'} onClick={() => selectPricingMode('international')}>🌍 International (USD)</button>}</div><p>Fixed monthly pricing. Annual billing isn’t supported right now.</p><div className="pricing-plans">{(['smart_page', 'smart_page_ai'] as const).map((planId) => { const plan = PAID_PLANS[planId]; const price = getPlanPrice(planId, pricingMode); const features = planId === 'smart_page' ? ['1 custom live page', '250 MB page media and image storage', 'Custom handle URL and QR code', 'Core analytics and visitor tracking'] : ['Everything in Starter', '10 static pages and 20 blog posts', '20 AI article generations each month', '40 AI writing credits each month', '800 AI replies each month', '20 knowledge sources', '200 verified FAQs', '50 catalog product images in chat']; return <article className="pricing-plan" key={planId}><div><h3>{plan.name}</h3><p className="pricing-price">{price.display}<span>/month</span></p><p className="text-[10px] text-[#777972] mt-1.5 leading-snug">{planDescriptions[planId]}</p></div><ul>{features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><Link className="button button-dark" href={user ? '/dashboard/settings?tab=billing' : startHref}>Choose {plan.name} <ArrowRight size={15} /></Link></article> })}</div>{pricingMode === 'nepal' ? (() => { const trialUrl = getWhatsAppUrl(NEPAL_TRIAL_MESSAGE, WHATSAPP_NUMBER); return trialUrl ? <a className="pricing-trial" href={trialUrl} target="_blank" rel="noopener noreferrer">Request Free Trial on WhatsApp</a> : <Link className="pricing-trial" href={startHref}>Start your 14-day free trial</Link> })() : <p className="pricing-foot">14-day free trial</p>}</div></div></section>

        <section className="faq-section section-pad" id="faq"><div className="faq-title reveal"><p className="kicker">A FEW GOOD QUESTIONS</p><h2>Good to <em>know.</em></h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${faqOpen === index ? 'active' : ''}`} key={question}><button onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}><span>{question}</span><ChevronDown size={18} /></button>{faqOpen === index && <p>{answer}</p>}</div>)}</div></section>

        <section className="final-cta">
          <div className="final-glow" />
          <p className="kicker !text-[#d4b194] text-xs font-semibold tracking-[0.2em]">YOUR ONLINE PRESENCE CAN DO MORE</p>
          <h2 className="!text-[#FDFCF8]">
            Make the next click<br />
            <em className="!text-white">mean something.</em>
          </h2>
          <p className="text-[13px] md:text-sm text-[#d6d5ce] max-w-[520px] mt-4 leading-relaxed">
            Bring your work, your offers, and your next opportunity together on one beautiful page—with an AI chatbot ready to answer visitor questions.
          </p>
          <div className="flex items-center gap-5 mt-7 flex-wrap justify-center">
            <Link href={startHref} className="button button-light !mt-0">Create your page <ArrowRight size={16} /></Link>
            <a href="#templates" className="text-link !text-[#d6d5ce] hover:!text-white">Explore templates <ArrowDown size={14} /></a>
          </div>
        </section>

        <footer className="lp-footer"><a href="#top" className="lp-brand"><Image src="/logo.png" alt="Pageory" width={24} height={24} className="rounded-md object-contain" /><span>Pageory</span></a><span className="footer-note">One beautiful page. More ways to connect.</span><div className="footer-links"><a href="#features">Features</a><a href="#templates">Templates</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div></footer>
      </main>
    </ReactLenis>
  )
}

function PhoneFrame({ template, className = '', label }: { template: string; className?: string; label: string }) {
  return <div className={`phone-frame ${className}`}><div className="phone-hardware"><span className="phone-camera" /><iframe src={`/template-preview?id=${template}`} title={label} loading="lazy" tabIndex={-1} /></div></div>
}
