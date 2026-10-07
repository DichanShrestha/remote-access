'use client'

import { useEffect, useState } from 'react'
import { ReactLenis } from 'lenis/react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Sparkles } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'

type User = { id: string; email?: string } | null

const templates = [
  { id: 'creator-profile', name: 'The Creator', type: 'Creator · Editorial', color: 'rose' },
  { id: 'beauty-brand', name: 'Soft Ritual', type: 'Beauty · Commerce', color: 'cream' },
  { id: 'creator-portfolio', name: 'Jordan Lee', type: 'Portfolio · Studio', color: 'blue' },
  { id: 'restaurant', name: 'Casa Nera', type: 'Hospitality · Menu', color: 'olive' },
  { id: 'luxury-skincare', name: 'Form & Field', type: 'Beauty · Product', color: 'lavender' },
]

const faqs = [
  ['What is Smart Page?', 'Smart Page turns the link in your social bio into a polished, interactive home for your work, offers, and audience.'],
  ['Do I need to know how to code?', 'No. Choose a template, personalize it in the visual editor, and publish when it feels right.'],
  ['How does the AI conversation work?', 'Your page can answer visitor questions using the information you provide, then guide interested people toward the next step.'],
  ['Can I collect leads and bookings?', 'Yes. Add forms and booking links to give visitors a direct way to get in touch or schedule with you.'],
  ['Can I change my page later?', 'Absolutely. Update your content, layout, and styling whenever you need to.'],
]

export function LandingPage({ user }: { user: User }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

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
      <main className="landing-page">
        <nav className="lp-nav">
          <a href="#top" className="lp-brand" aria-label="Smart Page home"><span className="brand-mark"><i /><i /><i /></span><span>smart<span className="brand-light">page</span></span></a>
          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#templates" onClick={() => setMenuOpen(false)}>Templates</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          </div>
          <div className="lp-nav-actions">{user ? <a className="lp-login" href="/dashboard">Dashboard</a> : <AuthButton user={user} label="Login" className="login-button" />}<a className="button button-dark nav-cta" href={startHref}>Get started <ArrowUpRight size={15} /></a></div>
          <button className="lp-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
        </nav>

        <section className="hero" id="top">
          <div className="hero-wash" /><div className="hero-grain" />
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A better place to land</div>
            <h1>Your whole world,<br />in <em>one</em> beautiful place.</h1>
            <p className="hero-description">A page that looks like you, answers like you, and turns passing visits into real connections.</p>
            <div className="hero-actions"><a className="button button-dark" href={startHref}>Create your Smart Page <ArrowRight size={16} /></a><a className="text-link" href="#templates">Explore the templates <ArrowDown size={14} /></a></div>
            <div className="hero-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>A</span><span>+</span></div><span>Made for people building<br />something worth finding.</span></div>
          </div>
          <div className="hero-stage" aria-label="Examples of Smart Page mobile templates">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-note note-top"><Sparkles size={14} /> One link. More possibility.</div>
            <PhoneFrame template="creator-profile" className="hero-phone hero-phone-back" label="Creator profile template" />
            <PhoneFrame template="beauty-brand" className="hero-phone hero-phone-left" label="Beauty brand template" />
            <PhoneFrame template="creator-portfolio" className="hero-phone hero-phone-main" label="Creator portfolio template" />
            <div className="hero-note note-bottom"><span className="online-dot" /> Your page is ready when they are.</div>
            <span className="stage-index">01 — 03</span>
          </div>
          <div className="hero-bottom"><span>THE NEW HOME FOR YOUR BIO</span><span>SCROLL TO SEE WHAT’S POSSIBLE ↓</span></div>
        </section>

        <div className="benefit-marquee" aria-label="Premium templates, AI chat, lead capture, analytics, built for social"><div className="marquee-track">{Array.from({ length: 2 }, (_, repeat) => <span key={repeat}>PREMIUM TEMPLATES <b>✳</b> AI THAT ANSWERS <b>✳</b> LEAD CAPTURE <b>✳</b> REAL ANALYTICS <b>✳</b> MADE FOR SOCIAL <b>✳</b> A PAGE THAT CONVERTS <b>✳</b></span>)}</div></div>

        <section className="templates-section section-pad" id="templates">
          <div className="section-heading reveal"><div><p className="kicker">01 / MADE WITH SMART PAGE</p><h2>First impressions,<br /><em>beautifully handled.</em></h2></div><div className="heading-aside"><p>Not another list of links. A small, considered world that makes your work feel unmistakably yours.</p><a href={startHref} className="under-link">Find your starting point <ArrowUpRight size={15} /></a></div></div>
          <div className="template-gallery"><div className="gallery-track">{[...templates, ...templates].map((item, index) => <article className={`template-card template-${item.color}`} key={`${item.id}-${index}`}><div className="template-phone"><PhoneFrame template={item.id} label={`${item.name} template`} /><span className="template-number">0{index % templates.length + 1}</span></div><div className="template-caption"><div><p>{item.type}</p><h3>{item.name}</h3></div><a href={`/template-preview?id=${item.id}`} target="_blank" rel="noreferrer" aria-label={`Preview ${item.name}`}><ArrowUpRight size={17} /></a></div></article>)}</div></div>
          <div className="gallery-footer"><span>THE RIGHT FEEL, BEFORE YOU WRITE A WORD.</span><div><span className="gallery-line" /><span>01 — 05</span></div></div>
        </section>

        <section className="editor-section section-pad" id="editor">
          <div className="section-heading reveal"><div><p className="kicker">02 / EDIT IT LIVE</p><h2>Made personal.<br /><em>Made simple.</em></h2></div><div className="heading-aside"><p>Your page takes shape as you work. Choose a starting point, adjust the details, and see it come together in real time.</p><a href="/editor?demo=creator-profile" className="under-link">Try the live editor <ArrowUpRight size={15} /></a></div></div>
          <div className="editor-showcase reveal"><div className="editor-browser-bar"><div className="browser-dots"><i /><i /><i /></div><span>smartpage.app / editor</span><span className="browser-live"><i /> LIVE PREVIEW</span></div><iframe src="/editor?demo=creator-profile" title="Smart Page interactive editor demo" loading="lazy" className="editor-frame" /><div className="editor-steps"><span><b>01</b> Choose a template</span><span><b>02</b> Make it yours</span><span><b>03</b> Publish beautifully</span></div></div>
        </section>

        <section className="journey-section section-pad" id="features">
          <div className="journey-top reveal"><p className="kicker">03 / MORE THAN A PRETTY PAGE</p><h2>Your page doesn’t just<br /><em>look good.</em></h2><p>It keeps the conversation going after the scroll.</p></div>
          <div className="journey-flow reveal"><div className="journey-line" /><div className="journey-step"><span className="step-no">01</span><div className="step-icon social-icon"><span>◎</span></div><h3>They find you</h3><p>One tap from your social bio.</p><span className="step-tag">SOCIAL VISITOR</span></div><div className="journey-step"><span className="step-no">02</span><div className="step-icon page-icon"><span className="brand-mark"><i /><i /><i /></span></div><h3>They get the picture</h3><p>Your work, offers, and story in one place.</p><span className="step-tag">SMART PAGE</span></div><div className="journey-step"><span className="step-no">03</span><div className="step-icon ai-icon"><Sparkles size={21} /></div><h3>They ask. It answers.</h3><p>A helpful AI conversation, shaped by you.</p><span className="step-tag">AI CONVERSATION</span></div><div className="journey-step"><span className="step-no">04</span><div className="step-icon lead-icon"><Check size={22} /></div><h3>You meet the right people</h3><p>Interest becomes an inquiry, booking, or lead.</p><span className="step-tag">LEAD CAPTURED</span></div></div>
          <div className="journey-footnote"><span>*</span> Your AI answers from the information you choose to share.</div>
        </section>

        <section className="outcomes-section section-pad">
          <div className="outcomes-intro reveal"><p className="kicker">04 / BUILT AROUND YOUR NEXT STEP</p><h2>Everything in its<br /><em>right place.</em></h2><p>Thoughtful tools that help the right people understand what you do — and do something about it.</p></div>
          <div className="outcome-list">
            {[
              ['A page with presence', 'Premium templates that feel designed around you, not poured into a preset.', '01'],
              ['Answers while you’re away', 'AI responds to visitor questions using the knowledge you provide.', '02'],
              ['A clear path to connect', 'Capture inquiries, collect details, or send people straight to booking.', '03'],
              ['Know what’s working', 'Understand how people find and move through your page.', '04'],
              ['Change your mind freely', 'Adjust sections, colors, and content without starting over.', '05'],
            ].map(([title, text, number]) => <div className="outcome-row reveal" key={number}><span className="outcome-no">{number}</span><h3>{title}</h3><p>{text}</p><ArrowUpRight size={18} /></div>)}
          </div>
        </section>

        <section className="comparison-section section-pad" id="comparison"><div className="comparison-intro reveal"><p className="kicker">05 / THE DIFFERENCE IS THE WHOLE POINT</p><h2>Less link list.<br /><em>More you.</em></h2><p>A quick way to see where Smart Page fits.</p></div><div className="comparison-table reveal"><div className="compare-head"><span>WHAT MATTERS</span><span>SMART PAGE</span><span>LINK DIRECTORY</span><span>TRADITIONAL SITE</span></div>{[['Designed page templates', true, 'Varies', true], ['AI answers from your content', true, false, 'Add-on'], ['Built-in lead capture', true, 'Varies', true], ['Purpose-built for social bios', true, true, false], ['Visual editing, no code', true, true, 'Varies']].map(([label, a, b, c]) => <div className="compare-row" key={String(label)}><span>{label}</span><span>{a === true ? <Check size={16} /> : a}</span><span>{b === true ? <Check size={16} /> : b === false ? '—' : b}</span><span>{c === true ? <Check size={16} /> : c === false ? '—' : c}</span></div>)}<p className="comparison-note">Features vary by provider and plan. Comparison focuses on common product formats.</p></div></section>

        <section className="pricing-section section-pad" id="pricing"><div className="pricing-card reveal"><div className="pricing-art"><div className="pricing-orb orb-a"/><div className="pricing-orb orb-b"/><div className="pricing-note">Less friction.<br /><em>More connection.</em></div><div className="pricing-mini-phone"><PhoneFrame template="creator-profile" label="Smart Page sample" /></div></div><div className="pricing-copy"><p className="kicker">06 / YOUR NEXT CHAPTER</p><h2>Start with a page<br />that feels like <em>you.</em></h2><p>Bring your work, your story, and your next opportunity together in one link worth opening.</p><ul><li><Check size={15} /> 14-day free trial</li><li><Check size={15} /> Choose from real, editable templates</li><li><Check size={15} /> Add AI, forms, and analytics as you grow</li></ul><a href={startHref} className="button button-dark">Create your Smart Page <ArrowRight size={16} /></a><span className="pricing-foot">Start creating, then choose the tools that fit.</span></div></div></section>

        <section className="faq-section section-pad" id="faq"><div className="faq-title reveal"><p className="kicker">A FEW GOOD QUESTIONS</p><h2>Good to <em>know.</em></h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${faqOpen === index ? 'active' : ''}`} key={question}><button onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}><span>{question}</span><ChevronDown size={18} /></button>{faqOpen === index && <p>{answer}</p>}</div>)}</div></section>

        <section className="final-cta"><div className="final-glow"/><p className="kicker">YOUR BIO CAN DO MORE</p><h2>Make the next click<br /><em>mean something.</em></h2><a href={startHref} className="button button-light">Build your Smart Page <ArrowRight size={16} /></a><span>One link. A world of possibility.</span></section>

        <footer className="lp-footer"><a href="#top" className="lp-brand"><span className="brand-mark"><i/><i/><i/></span><span>smart<span className="brand-light">page</span></span></a><span className="footer-note">A little more than a link in bio.</span><div className="footer-links"><a href="#features">Features</a><a href="#templates">Templates</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href="mailto:hello@smartpage.app">Contact</a></div><span className="copyright">© {new Date().getFullYear()} Smart Page</span></footer>
      </main>
    </ReactLenis>
  )
}

function PhoneFrame({ template, className = '', label }: { template: string; className?: string; label: string }) {
  return <div className={`phone-frame ${className}`}><div className="phone-hardware"><span className="phone-camera"/><iframe src={`/template-preview?id=${template}`} title={label} loading="lazy" tabIndex={-1} /></div></div>
}
