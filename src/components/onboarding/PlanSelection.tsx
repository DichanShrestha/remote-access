'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { requestPlanAccess, setOnboardingPricingMode } from '@/app/onboarding/actions';
import { createInternationalAffiliateCheckout, createManualAffiliatePurchase, validateAffiliateCode } from '@/app/actions/affiliate-actions';
import { getPlanPrice, getWhatsAppUrl, getPricingModeCookie, type PricingMode } from '@/lib/pricing';

interface PlanSelectionProps {
  username: string;
  domain: string;
  endsAt: string;
  trialEligible: boolean;
  trialIneligibleReason?: string;
  pricingMode: PricingMode;
  pricingLockedToNepal: boolean;
  pendingRequest: { id: string; requestType: string; planId: string } | null;
}

const BASE_FEATURES = [
  'Professional page templates',
  'Full customization & branding',
  'Unlimited links & components',
  'Custom profile URL & QR code',
  'Basic analytics (views, clicks, CTR)',
];

const AI_FEATURES = [
  'AI conversational chatbot',
  'Automated lead capture & inbox',
  'AI visual product responses',
  'Email notifications for new leads',
  'Knowledge base & FAQ builder',
];

export function PlanSelection({ username, domain, endsAt, trialEligible, trialIneligibleReason, pricingMode: initialPricingMode, pricingLockedToNepal, pendingRequest }: PlanSelectionProps) {
  const [pricingMode, setPricingMode] = useState<PricingMode>(initialPricingMode);
  const [selectedPlan, setSelectedPlan] = useState<'smart_page' | 'smart_page_ai'>('smart_page_ai');
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [codeResult, setCodeResult] = useState<{ valid: boolean; discountAvailable?: boolean; discountPercent?: number; message: string } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const router = useRouter();

  const endDate = new Date(endsAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const handleRequest = (planId: 'smart_page' | 'smart_page_ai', requestType: 'trial' | 'plan') => {
    if (requestType === 'trial' && !trialEligible) return;
    const actionName = `${requestType}_${planId}`;
    setPendingAction(actionName);
    setError('');
    if (requestType === 'plan') {
      startTransition(async () => {
        try {
          if (pricingMode === 'nepal') {
            const result = await createManualAffiliatePurchase(planId, affiliateCode.trim() || undefined);
            if ('error' in result) throw new Error(result.error);
            router.push(`/onboarding/payment/${result.purchaseId}`);
            return;
          }
          const result = await createInternationalAffiliateCheckout(planId, affiliateCode.trim() || undefined);
          if ('error' in result) throw new Error(result.error);
          window.location.href = result.checkoutUrl;
        } catch (requestError) {
          setError(requestError instanceof Error ? requestError.message : 'Could not start this purchase. Please try again.');
          setPendingAction(null);
        }
      });
      return;
    }
    const whatsappWindow = window.open('about:blank', '_blank');
    startTransition(async () => {
      try {
        const result = await requestPlanAccess(planId, requestType, affiliateCode.trim() || undefined);
        if (!result || 'error' in result) {
          if (whatsappWindow) whatsappWindow.close();
          setError(result?.error || 'Could not submit your request. Please try again.');
          setPendingAction(null);
          return;
        }
        const plan = planId === 'smart_page_ai' ? 'Growth' : 'Starter';
        const price = getPlanPrice(planId, pricingMode);
        const quote = requestType === 'trial' ? 'a free trial request' : `${price.currency} ${result.amount.toLocaleString()} per month${result.discountPercent ? ` after ${result.discountPercent}% referral discount` : ''}`;
        const message = `Hi, I would like to request ${requestType === 'trial' ? `a free trial of ${plan}` : `${plan} access`} (${quote}). My Pageory request ID is ${result.requestId}.${affiliateCode.trim() ? ` Referral code: ${affiliateCode.trim().toUpperCase()}.` : ''} Please review my request. I understand access starts only after Pageory approves it.`;
        const url = getWhatsAppUrl(message);
        if (!url) throw new Error('WhatsApp contact is not configured. Please contact Pageory support.');
        if (whatsappWindow) whatsappWindow.location.href = url;
        else window.location.href = url;
        setPendingAction(null);
      } catch (requestError) {
        if (whatsappWindow) whatsappWindow.close();
        setError(requestError instanceof Error ? requestError.message : 'Could not submit your request. Please try again.');
        setPendingAction(null);
      }
    });
  };

  const isLoading = isPending || !!pendingAction;

  return (
    <main className="plan-page" style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/onboarding/claim" style={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Back</span>
        </Link>
        <Link href="/" style={styles.brand}>
          <Image src="/logo.png" alt="Pageory" width={28} height={28} style={{ borderRadius: '6px', objectFit: 'contain' }} /> Pageory
        </Link>
        <div style={styles.statusBadge}>
          <span style={styles.statusDot} />
          Page ready
        </div>
      </header>

      <div style={styles.container}>
        {/* Title */}
        <div style={styles.titleSection}>
          <h1 style={styles.heading}>Choose your plan</h1>
          <p style={styles.subtitle}>
            Your page at <strong style={styles.urlHighlight}>{domain}/{username}</strong> is ready to go live.
          </p>
        </div>

        {pendingRequest && <section role="status" style={{ ...styles.trialCard, marginBottom: 22 }}><strong>Your access request is pending review</strong><p style={{ margin: '7px 0', fontSize: 13, color: '#62645E' }}>Request {pendingRequest.id} · {pendingRequest.requestType === 'trial' ? 'free trial' : pendingRequest.planId === 'smart_page_ai' ? 'Growth' : 'Starter'}. Your plan will not activate until Pageory approves it.</p><button type="button" onClick={() => { const plan = pendingRequest.planId === 'smart_page_ai' ? 'Growth' : 'Starter'; const message = `Hi, I submitted Pageory access request ${pendingRequest.id} for ${pendingRequest.requestType === 'trial' ? `a free trial of ${plan}` : `${plan} access`}. Please review my request.`; const url = getWhatsAppUrl(message); if (url) window.open(url, '_blank', 'noopener,noreferrer'); }} style={{ ...styles.trialBtn, padding: '9px 12px' }}><MessageCircle size={14} /> Continue in WhatsApp</button></section>}

        <section style={{ ...styles.trialCard, marginBottom: 22 }} aria-label="Billing location">
          <strong style={{ display: 'block', fontSize: 14, marginBottom: 9 }}>Billing location</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <button type="button" aria-pressed={pricingMode === 'nepal'} onClick={async () => { try { await setOnboardingPricingMode('nepal'); document.cookie = getPricingModeCookie('nepal'); setPricingMode('nepal'); setCodeResult(null); } catch (error) { setError(error instanceof Error ? error.message : 'Could not update billing location.'); } }} style={{ ...styles.trialBtn, padding: '8px 12px', opacity: pricingMode === 'nepal' ? 1 : 0.7 }}>🇳🇵 Nepal · NPR</button>
            {!pricingLockedToNepal && <button type="button" aria-pressed={pricingMode === 'international'} onClick={async () => { try { await setOnboardingPricingMode('international'); document.cookie = getPricingModeCookie('international'); setPricingMode('international'); setCodeResult(null); } catch (error) { setError(error instanceof Error ? error.message : 'Could not update billing location.'); } }} style={{ ...styles.trialBtn, padding: '8px 12px', opacity: pricingMode === 'international' ? 1 : 0.7 }}>International · USD</button>}
            {pricingLockedToNepal && <span style={{ fontSize: 12, color: '#777972' }}>Nepal pricing is selected based on your location.</span>}
          </div>
        </section>

        {error && (
          <div style={styles.errorBanner}>{error}</div>
        )}

        <section style={{ ...styles.trialCard, marginBottom: 22 }}>
          <label htmlFor="affiliate-code" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Have an affiliate referral code?</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input id="affiliate-code" value={affiliateCode} onChange={(event) => { setAffiliateCode(event.target.value.toUpperCase()); setCodeResult(null); }} placeholder="Enter code (optional)" maxLength={40} style={{ minWidth: 220, flex: 1, border: '1px solid #d9d6ce', borderRadius: 9, padding: '10px 12px', background: '#fff' }} />
            <button type="button" disabled={!affiliateCode.trim() || checkingCode} onClick={async () => { setCheckingCode(true); setError(''); const result = await validateAffiliateCode(affiliateCode); setCodeResult(result); setCheckingCode(false); }} style={{ ...styles.trialBtn, padding: '10px 14px' }}>{checkingCode ? 'Checking…' : 'Apply code'}</button>
          </div>
          {codeResult && <p style={{ margin: '8px 0 0', fontSize: 13, color: codeResult.valid ? '#475b3b' : '#a33b32' }}>{codeResult.message}{codeResult.valid && codeResult.discountAvailable && codeResult.discountPercent ? ` ${codeResult.discountPercent}% will be taken off the first eligible purchase.` : ''}</p>}
          {codeResult?.valid && <p style={{ margin: '10px 0 0', fontSize: 13, color: '#292A25' }}><strong>{selectedPlan === 'smart_page_ai' ? 'Growth' : 'Starter'}:</strong> {getPlanPrice(selectedPlan, pricingMode).currency} {getPlanPrice(selectedPlan, pricingMode).amount.toLocaleString()} original · {getPlanPrice(selectedPlan, pricingMode).currency} {(getPlanPrice(selectedPlan, pricingMode).amount * (codeResult.discountAvailable ? codeResult.discountPercent || 0 : 0) / 100).toFixed(2)} discount · <strong>{getPlanPrice(selectedPlan, pricingMode).currency} {(getPlanPrice(selectedPlan, pricingMode).amount * (1 - (codeResult.discountAvailable ? codeResult.discountPercent || 0 : 0) / 100)).toFixed(2)} payable</strong></p>}
        </section>

        {/* Plan Cards */}
        <div style={styles.cardsGrid}>

          {/* Starter */}
          <div
            style={{
              ...styles.card,
              ...(selectedPlan === 'smart_page' ? styles.cardSelected : {}),
            }}
            onClick={() => !isLoading && setSelectedPlan('smart_page')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && setSelectedPlan('smart_page')}
          >
            {/* Selection indicator */}
            <div style={styles.radioRow}>
              <div style={{
                ...styles.radio,
                ...(selectedPlan === 'smart_page' ? styles.radioChecked : {}),
              }}>
                {selectedPlan === 'smart_page' && <div style={styles.radioInner} />}
              </div>
              <span style={styles.planLabel}>Starter</span>
            </div>

            <div style={styles.planNameRow}>
              <h2 style={styles.planName}>Starter</h2>
            </div>

            <div style={styles.priceRow}>
              <span style={styles.priceAmount}>{getPlanPrice('smart_page', pricingMode).display}</span>
              <span style={styles.pricePeriod}>/month</span>
            </div>

            <p style={styles.planDescription}>
              Everything you need to present your work professionally and give visitors a clear way to connect with you.
            </p>

            <div style={styles.divider} />

            <ul style={styles.featureList}>
              {BASE_FEATURES.map((f) => (
                <li key={f} style={styles.featureItem}>
                  <Check size={14} style={styles.checkIcon} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => { e.stopPropagation(); handleRequest('smart_page', 'plan'); }}
              disabled={isLoading || !!pendingRequest}
              style={{
                ...styles.subscribeBtn,
                ...(isLoading ? styles.btnDisabled : {}),
              }}
            >
              {pendingAction === 'plan_smart_page' ? (pricingMode === 'nepal' ? 'Preparing payment…' : 'Opening checkout…') : pricingMode === 'nepal' ? 'Continue to payment' : `Subscribe — ${getPlanPrice('smart_page', pricingMode).display}/month`}
              {pricingMode === 'nepal' ? null : <ArrowRight size={14} />}
            </button>
          </div>

          {/* Growth */}
          <div
            style={{
              ...styles.card,
              ...styles.cardDark,
              ...(selectedPlan === 'smart_page_ai' ? styles.cardDarkSelected : {}),
            }}
            onClick={() => !isLoading && setSelectedPlan('smart_page_ai')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && setSelectedPlan('smart_page_ai')}
          >
            {/* Recommended badge */}
            <div style={styles.recommendedBadge}>
              <Sparkles size={11} />
              Recommended
            </div>

            {/* Selection indicator */}
            <div style={styles.radioRow}>
              <div style={{
                ...styles.radio,
                ...styles.radioDark,
                ...(selectedPlan === 'smart_page_ai' ? styles.radioDarkChecked : {}),
              }}>
                {selectedPlan === 'smart_page_ai' && <div style={styles.radioInnerDark} />}
              </div>
              <span style={{ ...styles.planLabel, color: '#A1A299' }}>AI-Powered</span>
            </div>

            <div style={styles.planNameRow}>
              <h2 style={{ ...styles.planName, color: '#FDFCF8' }}>Growth</h2>
            </div>

            <div style={styles.priceRow}>
              <span style={{ ...styles.priceAmount, color: '#FDFCF8' }}>{getPlanPrice('smart_page_ai', pricingMode).display}</span>
              <span style={{ ...styles.pricePeriod, color: '#A1A299' }}>/month</span>
            </div>

            <p style={{ ...styles.planDescription, color: '#9B9C94' }}>
              Add an AI chatbot that answers visitor questions from your knowledge and helps interested visitors take the next step.
            </p>

            <div style={{ ...styles.divider, borderColor: '#3C3D37' }} />

            <div style={styles.includesLabel}>
              Everything in Starter, plus:
            </div>

            <ul style={styles.featureList}>
              {AI_FEATURES.map((f) => (
                <li key={f} style={styles.featureItem}>
                  <Sparkles size={13} style={styles.aiIcon} />
                  <span style={{ color: '#D8D7D0' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => { e.stopPropagation(); handleRequest('smart_page_ai', 'plan'); }}
              disabled={isLoading || !!pendingRequest}
              style={{
                ...styles.subscribeBtnLight,
                ...(isLoading ? styles.btnDisabled : {}),
              }}
            >
              {pendingAction === 'plan_smart_page_ai' ? (pricingMode === 'nepal' ? 'Preparing payment…' : 'Opening checkout…') : pricingMode === 'nepal' ? 'Continue to payment' : `Subscribe — ${getPlanPrice('smart_page_ai', pricingMode).display}/month`}
              {pricingMode === 'nepal' ? null : <ArrowRight size={14} />}
            </button>
          </div>
        </div>

        {/* Trial Section */}
        {trialEligible && (
          <div style={styles.trialSection}>
            <div style={styles.trialCard}>
              <div style={styles.trialContent}>
                <div style={styles.trialInfo}>
                  <h3 style={styles.trialTitle}>Not ready to commit?</h3>
                  <p style={styles.trialDescription}>
                    Request a <strong>14-day free trial</strong> of the <strong>{selectedPlan === 'smart_page_ai' ? 'Growth' : 'Starter'}</strong> plan. It will start only after Pageory reviews and approves your request.
                  </p>
                </div>
                <button
                  onClick={() => handleRequest(selectedPlan, 'trial')}
                  disabled={isLoading || !!pendingRequest}
                  style={{
                    ...styles.trialBtn,
                    ...(isLoading ? styles.btnDisabled : {}),
                  }}
                >
                  {pendingAction === `trial_${selectedPlan}` ? 'Preparing request…' : (
                    <>
                      Request Free Trial on WhatsApp
                      <MessageCircle size={14} />
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {!trialEligible && trialIneligibleReason && (
          <div style={styles.trialUsedNotice}>
            <ShieldCheck size={15} style={{ color: '#898A82', flexShrink: 0 }} />
            <span>{trialIneligibleReason}</span>
          </div>
        )}

        {/* Trust footer */}
        <div style={styles.trustFooter}>
          <ShieldCheck size={15} style={{ color: '#898A82', flexShrink: 0 }} />
          <span>
            {trialEligible
              ? `No access begins until your free trial request is approved. Estimated start information: ${endDate}.`
              : 'Sending a request does not activate a plan. Pageory reviews every request before access starts.'}
          </span>
        </div>
      </div>
    </main>
  );
}

/* ---------- Inline Styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8F7F2',
    color: '#292A25',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    paddingBottom: 80,
  },
  header: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E8E7E1',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#777970',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  brand: {
    fontSize: 14,
    fontWeight: 600,
    color: '#292A25',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
  },
  brandMark: {
    color: '#16a34a',
    fontWeight: 700,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#898A82',
    fontWeight: 500,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '0 24px',
  },
  titleSection: {
    textAlign: 'center' as const,
    paddingTop: 48,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: '#292A25',
    margin: '0 0 12px',
    lineHeight: 1.15,
  },
  subtitle: {
    fontSize: 15,
    color: '#777970',
    margin: 0,
    lineHeight: 1.5,
  },
  urlHighlight: {
    color: '#292A25',
    fontWeight: 600,
  },
  errorBanner: {
    maxWidth: 480,
    margin: '0 auto 24px',
    padding: '12px 16px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 12,
    fontSize: 13,
    textAlign: 'center' as const,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
    marginBottom: 32,
  },
  card: {
    position: 'relative' as const,
    backgroundColor: '#FDFCF8',
    border: '2px solid #E8E7E1',
    borderRadius: 16,
    padding: '28px 28px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  cardSelected: {
    borderColor: '#292A25',
    boxShadow: '0 0 0 1px #292A25',
  },
  cardDark: {
    backgroundColor: '#292A25',
    border: '2px solid #3C3D37',
    color: '#FDFCF8',
  },
  cardDarkSelected: {
    borderColor: '#FDFCF8',
    boxShadow: '0 0 0 1px #FDFCF8',
  },
  recommendedBadge: {
    position: 'absolute' as const,
    top: -1,
    right: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#292A25',
    backgroundColor: '#F5D04E',
    padding: '4px 10px',
    borderRadius: '0 0 8px 8px',
  },
  radioRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '2px solid #D1CFB5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s',
    flexShrink: 0,
  },
  radioChecked: {
    borderColor: '#292A25',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#292A25',
  },
  radioDark: {
    borderColor: '#555650',
  },
  radioDarkChecked: {
    borderColor: '#FDFCF8',
  },
  radioInnerDark: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#FDFCF8',
  },
  planLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#898A82',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  planNameRow: {
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.015em',
    margin: 0,
    color: '#292A25',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 10,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: '#292A25',
  },
  pricePeriod: {
    fontSize: 13,
    color: '#898A82',
    fontWeight: 500,
  },
  planDescription: {
    fontSize: 13,
    color: '#777970',
    lineHeight: 1.5,
    margin: '0 0 16px',
  },
  divider: {
    borderTop: '1px solid #E8E7E1',
    margin: '0 0 16px',
  },
  includesLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#777970',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 10,
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 9,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    lineHeight: 1.3,
  },
  checkIcon: {
    color: '#16a34a',
    flexShrink: 0,
  },
  aiIcon: {
    color: '#D9A520',
    flexShrink: 0,
  },
  subscribeBtn: {
    marginTop: 'auto',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#292A25',
    color: '#FDFCF8',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background-color 0.15s',
  },
  subscribeBtnLight: {
    marginTop: 'auto',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#FDFCF8',
    color: '#292A25',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background-color 0.15s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  /* Trial Section */
  trialSection: {
    marginBottom: 24,
  },
  trialCard: {
    backgroundColor: '#FDFCF8',
    border: '1px solid #E8E7E1',
    borderRadius: 14,
    padding: '20px 24px',
  },
  trialContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap' as const,
  },
  trialInfo: {
    flex: 1,
    minWidth: 240,
  },
  trialTitle: {
    fontSize: 15,
    fontWeight: 650,
    color: '#292A25',
    margin: '0 0 4px',
    letterSpacing: '-0.01em',
  },
  trialDescription: {
    fontSize: 13,
    color: '#777970',
    margin: 0,
    lineHeight: 1.5,
  },
  trialBtn: {
    padding: '11px 22px',
    backgroundColor: '#16a34a',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap' as const,
    transition: 'background-color 0.15s',
    flexShrink: 0,
  },
  trialUsedNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    fontSize: 13,
    color: '#777970',
    marginBottom: 24,
  },
  trustFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    fontSize: 12,
    color: '#898A82',
    textAlign: 'center' as const,
    paddingTop: 8,
  },
};
