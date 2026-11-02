"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Zap,
  Calendar,
  AtSign,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  Database,
  HardDrive,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle
} from "lucide-react";
import {
  updateAccountProfile,
  deleteUserPage,
  deleteUserAccount,
  checkUsernameAvailability,
  exportAccountData
} from "@/app/actions/settings-actions";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  cancelManualSubscription,
  startFreeTrial
} from "@/app/actions/billing-actions";
import { createInternationalAffiliateCheckout, createManualAffiliatePurchase, validateAffiliateCode } from "@/app/actions/affiliate-actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getPlanPrice, getPricingModeCookie, PAID_PLANS, type PricingMode } from "@/lib/pricing";

export interface UsageMetrics {
  plan: "trial" | "smart_page" | "smart_page_ai";
  isTrial: boolean;
  isPaidActive?: boolean;
  trialDaysRemaining: number;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  aiReplies: {
    used: number;
    limit: number;
    included: boolean;
  };
  knowledgeSources: {
    used: number;
    limit: number;
    included: boolean;
  };
  faqEntries: {
    used: number;
    limit: number;
    included: boolean;
  };
  aiImages: {
    used: number;
    limit: number;
    included: boolean;
  };
  knowledgeStorage: {
    usedBytes: number;
    limitBytes: number;
    included: boolean;
  };
  pageMediaStorage: {
    usedBytes: number;
    limitBytes: number;
    included: boolean;
  };
  indexedTokens: {
    used: number;
    limit: number;
    included: boolean;
  };
}

interface SettingsClientProps {
  initialTab?: "billing" | "account";
  accountOnly?: boolean;
  pricingMode: PricingMode;
  pricingLockedToNepal?: boolean;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    displayName: string | null;
    username: string | null;
  };
  hasPage: boolean;
  subscription: {
    id?: string;
    planId: string;
    tier?: string;
    status: string;
    billingMethod: string;
    currentPeriodEnd?: string | null;
    trialEnd?: string | null;
    cancelAtPeriodEnd: boolean;
    dodoCustomerId?: string | null;
    aiRepliesUsed?: number;
  } | null;
  usageMetrics: UsageMetrics;
}

export function SettingsClient({
  initialTab = "billing",
  accountOnly = false,
  pricingMode: initialPricingMode,
  pricingLockedToNepal = false,
  user,
  hasPage: initialHasPage,
  subscription,
  usageMetrics
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [pricingMode, setPricingMode] = useState<PricingMode>(initialPricingMode);

  // Tab State
  const [activeTab, setActiveTab] = useState<"billing" | "account">(initialTab);

  const handleTabChange = (tab: "billing" | "account") => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `/dashboard/settings?tab=${tab}`);
  };

  // Account State
  const [name, setName] = useState(user.name || user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "current" | "available" | "unavailable" | "invalid"
  >("current");
  const [isUpdatingAccount, startAccountTransition] = useTransition();
  const [accountFeedback, setAccountFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Billing State
  const [isBillingPending, startBillingTransition] = useTransition();
  const [billingError, setBillingError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountAvailable?: boolean; discountPercent?: number; message: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  // Danger Zone State
  const [hasPage, setHasPage] = useState(initialHasPage);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [isDeletingPage, startDeletePageTransition] = useTransition();
  const [deletePageError, setDeletePageError] = useState<string | null>(null);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, startDeleteAccountTransition] = useTransition();
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Debounced username availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase();

    if (!clean || clean.length < 3 || clean.length > 30) {
      setUsernameStatus("invalid");
      return;
    }

    if (clean === (user.username || "").toLowerCase()) {
      setUsernameStatus("current");
      return;
    }

    const validCharsRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validCharsRegex.test(clean)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(clean);
        setUsernameStatus(res.state);
      } catch {
        setUsernameStatus("unavailable");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user.username]);

  // Account Name & Username Save Handler
  const handleSaveAccountProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFeedback(null);

    if (!accountOnly && usernameStatus === "unavailable") {
      setAccountFeedback({
        type: "error",
        message: "That username is taken or reserved. Please pick another."
      });
      return;
    }

    if (!accountOnly && usernameStatus === "invalid") {
      setAccountFeedback({
        type: "error",
        message: "Username must be 3–30 letters, numbers, dashes, or underscores."
      });
      return;
    }

    startAccountTransition(async () => {
      const res = await updateAccountProfile({ name, username: accountOnly ? "" : username });
      if (res.error) {
        setAccountFeedback({ type: "error", message: res.error });
      } else {
        setAccountFeedback({
          type: "success",
          message: "Account profile updated successfully."
        });
        setTimeout(() => setAccountFeedback(null), 3500);
        router.refresh();
      }
    });
  };

  // Billing Action Handlers
  const handleManagePortal = () => {
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        const res = await createCustomerPortalSession();
        if (res?.url) {
          window.location.href = res.url;
        } else {
          setBillingError("Could not open billing portal.");
        }
      } catch (err: any) {
        setBillingError(err.message || "Failed to launch billing portal.");
      }
    });
  };

  const handleCheckoutPlan = (productIdEnv: string, planId: string) => {
    if (pricingMode === "nepal") return;
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        if (promoCode.trim() && !promoResult?.valid) {
          setBillingError("Apply a valid promo code before continuing, or clear the code field.");
          return;
        }
        if (promoCode.trim() && promoResult?.valid) {
          const result = await createInternationalAffiliateCheckout(planId as "smart_page" | "smart_page_ai", promoCode.trim());
          if (result.error) { setBillingError(result.error); return; }
          if (result.checkoutUrl) { window.location.href = result.checkoutUrl; return; }
        }
        const res = await createCheckoutSession(productIdEnv || undefined, planId);
        if (res.payment_link) {
          window.location.href = res.payment_link;
        } else {
          setBillingError("Could not initiate checkout session.");
        }
      } catch (err: any) {
        setBillingError(err.message || "Failed to start checkout.");
      }
    });
  };

  const handleNepalPurchase = (planId: "smart_page" | "smart_page_ai") => {
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        if (promoCode.trim() && !promoResult?.valid) {
          setBillingError("Apply a valid promo code before continuing, or clear the code field.");
          return;
        }
        const result = await createManualAffiliatePurchase(planId, promoResult?.valid ? promoCode.trim() || undefined : undefined);
        if (result.error) { setBillingError(result.error); return; }
        if (result.purchaseId) router.push(`/onboarding/payment/${result.purchaseId}`);
      } catch (err: unknown) {
        setBillingError(err instanceof Error ? err.message : "Could not start the payment.");
      }
    });
  };

  const handleValidatePromo = async () => {
    setCheckingPromo(true);
    setPromoResult(null);
    try { setPromoResult(await validateAffiliateCode(promoCode)); }
    catch { setPromoResult({ valid: false, message: "Could not check this promo code. Please try again." }); }
    finally { setCheckingPromo(false); }
  };

  const handlePricingMode = (mode: PricingMode) => {
    if (pricingLockedToNepal && mode !== "nepal") return;
    setPricingMode(mode);
    document.cookie = getPricingModeCookie(mode);
    setBillingError(null);
  };

  const handleStartTrial = (planId: string) => {
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        await startFreeTrial(planId);
        router.refresh();
      } catch (err: any) {
        setBillingError(err.message || "Failed to start trial.");
      }
    });
  };

  const handleCancelManual = () => {
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        await cancelManualSubscription();
        router.refresh();
      } catch (err: any) {
        setBillingError(err.message || "Failed to cancel subscription.");
      }
    });
  };

  // Delete Page Handler
  const handleConfirmDeletePage = () => {
    setDeletePageError(null);
    startDeletePageTransition(async () => {
      const res = await deleteUserPage();
      if (res.error) {
        setDeletePageError(res.error);
      } else {
        setHasPage(false);
        setShowDeletePageModal(false);
        router.refresh();
      }
    });
  };

  // Delete Account Handler
  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      setDeleteAccountError("Please type DELETE to confirm.");
      return;
    }

    setDeleteAccountError(null);
    startDeleteAccountTransition(async () => {
      const res = await deleteUserAccount();
      if (res.error) {
        setDeleteAccountError(res.error);
      } else {
        await supabase.auth.signOut();
        window.location.href = "/";
      }
    });
  };

  // Compute Subscription Display Info
  let planTitle = "Free";
  let statusBadgeText = "No Active Subscription";
  let statusBadgeClass = "bg-[#F2EFE9] text-[#737373] border-[#E8E5DF]";

  if (subscription) {
    const rawPlan = (subscription.planId || subscription.tier || "").toLowerCase();
    if (rawPlan.includes("ai") || rawPlan.includes("knowchat")) {
      planTitle = `Growth (${getPlanPrice("smart_page_ai", pricingMode).display}/month)`;
    } else {
      planTitle = `Starter (${getPlanPrice("smart_page", pricingMode).display}/month)`;
    }

    if (subscription.status === "trialing" && subscription.trialEnd) {
      const daysLeft = usageMetrics.trialDaysRemaining;
      statusBadgeText =
        daysLeft > 0
          ? `14-Day Free Trial (${daysLeft} days remaining)`
          : "Trial Expired";
      statusBadgeClass =
        daysLeft > 0
          ? "bg-[#171717] text-white border-[#171717]"
          : "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
    } else if (subscription.status === "active") {
      if (subscription.cancelAtPeriodEnd) {
        const endDateStr = subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
          : "";
        statusBadgeText = endDateStr
          ? `Cancels on ${endDateStr}`
          : "Cancels at period end";
        statusBadgeClass = "bg-[#F2EFE9] text-[#737373] border-[#E8E5DF]";
      } else {
        statusBadgeText = "Active Subscription";
        statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }
    } else if (subscription.status === "past_due") {
      statusBadgeText = "Past Due";
      statusBadgeClass = "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "cancelled" ||
      subscription.status === "expired"
    ) {
      statusBadgeText = "Canceled";
      statusBadgeClass = "bg-[#F2EFE9] text-[#737373] border-[#E8E5DF]";
    } else if (subscription.status === "paused") {
      statusBadgeText = "Paused";
      statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  // Quota Calculations
  const aiRepliesPercent =
    usageMetrics.aiReplies.included && usageMetrics.aiReplies.limit > 0
      ? Math.min(
          100,
          Math.round(
            (usageMetrics.aiReplies.used / usageMetrics.aiReplies.limit) * 100
          )
        )
      : 0;

  const aiRepliesRemaining = Math.max(
    0,
    usageMetrics.aiReplies.limit - usageMetrics.aiReplies.used
  );

  const knowledgeSourcesPercent =
    usageMetrics.knowledgeSources.included &&
    usageMetrics.knowledgeSources.limit > 0
      ? Math.min(
          100,
          Math.round(
            (usageMetrics.knowledgeSources.used /
              usageMetrics.knowledgeSources.limit) *
              100
          )
        )
      : 0;

  const faqEntriesPercent =
    usageMetrics.faqEntries.included && usageMetrics.faqEntries.limit > 0
      ? Math.min(
          100,
          Math.round(
            (usageMetrics.faqEntries.used / usageMetrics.faqEntries.limit) * 100
          )
        )
      : 0;

  const aiImagesPercent =
    usageMetrics.aiImages.included && usageMetrics.aiImages.limit > 0
      ? Math.min(
          100,
          Math.round(
            (usageMetrics.aiImages.used / usageMetrics.aiImages.limit) * 100
          )
        )
      : 0;

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

  const knowledgeStorageFormatted = formatBytes(
    usageMetrics.knowledgeStorage.usedBytes
  );
  const knowledgeStorageLimitMb = Math.round(
    usageMetrics.knowledgeStorage.limitBytes / 1048576
  );
  const knowledgeStoragePercent =
    usageMetrics.knowledgeStorage.included &&
    usageMetrics.knowledgeStorage.limitBytes > 0
      ? Math.min(
          100,
          Math.max(
            usageMetrics.knowledgeStorage.usedBytes > 0 ? 1 : 0,
            Math.round(
              (usageMetrics.knowledgeStorage.usedBytes /
                usageMetrics.knowledgeStorage.limitBytes) *
                100
            )
          )
        )
      : 0;

  const mediaStorageFormatted = formatBytes(
    usageMetrics.pageMediaStorage.usedBytes
  );
  const mediaStoragePercent =
    usageMetrics.pageMediaStorage.usedBytes > 0
      ? Math.max(
          1,
          Math.round(
            (usageMetrics.pageMediaStorage.usedBytes / (250 * 1048576)) * 100
          )
        )
      : 0;

  const isNearAnyLimit =
    (usageMetrics.aiReplies.included && aiRepliesPercent >= 80) ||
    (usageMetrics.knowledgeSources.included && knowledgeSourcesPercent >= 80) ||
    (usageMetrics.faqEntries.included && faqEntriesPercent >= 80) ||
    (usageMetrics.aiImages.included && aiImagesPercent >= 80) ||
    (usageMetrics.knowledgeStorage.included && knowledgeStoragePercent >= 80) ||
    mediaStoragePercent >= 80;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E8E5DF] gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
            {accountOnly ? "Account Settings" : "Settings & Billing"}
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            {accountOnly ? "Manage your account profile." : "Manage your plan subscription, resource limits, and account profile."}
          </p>
        </div>
      </header>

      {/* Segmented Navigation Tabs */}
      {!accountOnly && <div className="flex items-center gap-1.5 p-1 bg-[#F2EFE9] border border-[#E8E5DF] rounded-xl w-fit">
        <button
          onClick={() => handleTabChange("billing")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === "billing"
              ? "bg-white text-[#171717] shadow-2xs"
              : "text-[#737373] hover:text-[#171717]"
          )}
        >
          <CreditCard size={14} />
          <span>Billing & Tier Limits</span>
          {usageMetrics.isTrial && (
            <span className="text-[10px] font-medium bg-[#F2EFE9] text-[#565850] px-1.5 py-0.5 rounded-full border border-[#E8E5DF]">
              Trial
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("account")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === "account"
              ? "bg-white text-[#171717] shadow-2xs"
              : "text-[#737373] hover:text-[#171717]"
          )}
        >
          <UserIcon size={14} />
          <span>Account Profile</span>
        </button>
      </div>}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: BILLING & TIER LIMITS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!accountOnly && activeTab === "billing" && (
        <div className="space-y-6">
          {/* Warning Banner if Near Limit */}
          {isNearAnyLimit && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block mb-0.5">
                  Approaching Plan Limit (80%+)
                </span>
                <span>
                  You have used 80% or more of your allocated quotas. Consider
                  upgrading to Growth to ensure visitor chat and storage
                  are never interrupted.
                </span>
              </div>
            </div>
          )}

          {/* SECTION: TIER LIMITS & RESOURCE CONSUMPTION (MAIN FOCUS) */}
          <section className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#F2EFE9]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#171717]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#171717]">
                    Tier Limits & Resource Usage
                  </h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Real-time tracking of AI messages, knowledge, and assets
                    included in your plan.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8D85]">
                  {usageMetrics.isTrial
                    ? `Trial ends in ${usageMetrics.trialDaysRemaining} days`
                    : subscription?.currentPeriodEnd
                    ? `Resets ${new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}`
                    : "Active Tier Quotas"}
                </span>
              </div>
            </div>

            {/* Spotlight AI Replies Card */}
            <div className="mt-6 p-6 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white border border-[#E8E5DF] flex items-center justify-center text-[#171717] shadow-2xs">
                    <MessageSquare size={16} />
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-[#8C8D85] uppercase tracking-wider block">
                      Primary AI Quota
                    </span>
                    <h3 className="text-base font-bold text-[#171717]">
                      AI Chatbot Replies
                    </h3>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  {usageMetrics.aiReplies.included ? (
                    <>
                      <span className="text-2xl font-bold text-[#171717] tabular-nums">
                        {usageMetrics.aiReplies.used}
                      </span>
                      <span className="text-sm font-medium text-[#8C8D85]">
                        / {usageMetrics.aiReplies.limit} replies used
                      </span>
                      <span
                        className={cn(
                          "ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums",
                          aiRepliesPercent >= 90
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : aiRepliesPercent >= 80
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-white text-[#171717] border border-[#E8E5DF]"
                        )}
                      >
                        {aiRepliesPercent}% used
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#F2EFE9] text-[#737373] border border-[#E8E5DF]">
                      Not included in Starter
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {usageMetrics.aiReplies.included ? (
                <>
                  <div className="h-2.5 w-full bg-[#E8E5DF] rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        aiRepliesPercent >= 90
                          ? "bg-red-600"
                          : aiRepliesPercent >= 80
                          ? "bg-amber-500"
                          : "bg-[#171717]"
                      )}
                      style={{
                        width: `${Math.max(aiRepliesPercent, 2)}%`
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#737373] gap-1">
                    <span>
                      {aiRepliesRemaining} replies remaining in this billing
                      period.
                    </span>
                    <span>
                      Visitor questions and automated bookings consume 1 reply
                      each.
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-[#737373]">
                    Upgrade to Growth to unlock 800 monthly assistant
                    replies, automatic lead qualification, and booking triggers.
                  </p>
                  <button
                    onClick={() =>
                      handleCheckoutPlan(
                        process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE_AI ||
                          "",
                        "smart_page_ai"
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-[#171717] hover:bg-[#262626] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    Upgrade to Growth
                  </button>
                </div>
              )}
            </div>

            {/* Quota Cards Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Knowledge Sources */}
              <ResourceCard
                title="Knowledge Sources"
                icon={<BookOpen size={16} />}
                used={usageMetrics.knowledgeSources.used}
                limit={usageMetrics.knowledgeSources.limit}
                unit="sources"
                percent={knowledgeSourcesPercent}
                included={usageMetrics.knowledgeSources.included}
                description="Custom URLs, uploaded PDFs & text files."
              />

              {/* Card 2: FAQ Pairs */}
              <ResourceCard
                title="FAQs & Q&A Pairs"
                icon={<HelpCircle size={16} />}
                used={usageMetrics.faqEntries.used}
                limit={usageMetrics.faqEntries.limit}
                unit="FAQs"
                percent={faqEntriesPercent}
                included={usageMetrics.faqEntries.included}
                description="Instant verified answers for your AI bot."
              />

              {/* Card 3: AI Catalog Images */}
              <ResourceCard
                title="AI Catalog Images"
                icon={<ImageIcon size={16} />}
                used={usageMetrics.aiImages.used}
                limit={usageMetrics.aiImages.limit}
                unit="images"
                percent={aiImagesPercent}
                included={usageMetrics.aiImages.included}
                description="Visual product cards sent inside chatbot."
              />

              {/* Card 4: Knowledge Embeddings Storage */}
              <ResourceCard
                title="Knowledge Storage"
                icon={<Database size={16} />}
                customValue={`${knowledgeStorageFormatted} / ${knowledgeStorageLimitMb} MB`}
                percent={knowledgeStoragePercent}
                included={usageMetrics.knowledgeStorage.included}
                description="Shared storage for documents, crawled URLs & AI images."
              />

              {/* Card 5: Page Media Storage */}
              <ResourceCard
                title="Page Media Storage"
                icon={<HardDrive size={16} />}
                customValue={`${mediaStorageFormatted} / 250 MB`}
                percent={mediaStoragePercent}
                included={true}
                description={
                  usageMetrics.pageMediaStorage.usedBytes > 0
                    ? `${mediaStorageFormatted} used across uploaded page assets.`
                    : "Hero photos, logos, and custom gallery media."
                }
              />

              {/* Card 6: Indexed Tokens */}
              <ResourceCard
                title="Indexed AI Tokens"
                icon={<Sparkles size={16} />}
                customValue={
                  usageMetrics.indexedTokens.included
                    ? `${usageMetrics.indexedTokens.used.toLocaleString()} / ${usageMetrics.indexedTokens.limit.toLocaleString()}`
                    : "Not included"
                }
                percent={
                  usageMetrics.indexedTokens.limit > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (usageMetrics.indexedTokens.used /
                            usageMetrics.indexedTokens.limit) *
                            100
                        )
                      )
                    : 0
                }
                included={usageMetrics.indexedTokens.included}
                description="Token capacity across knowledge docs."
              />
            </div>
          </section>

          {/* SECTION: CURRENT SUBSCRIPTION & PORTAL */}
          <section className="bg-white border border-[#E8E7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-[#F2EFE9] mb-6">
              <span className="w-9 h-9 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#171717]">
                <CreditCard size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Active Plan & Billing
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  Subscription status, renewal cycle, and payment method
                  management.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#FBF9F5] border border-[#E8E5DF] rounded-xl mb-6">
              <div>
                <span className="text-[11px] font-semibold text-[#8C8D85] uppercase tracking-wider block mb-1">
                  Active Subscription
                </span>
                <div className="text-xl font-bold text-[#171717]">
                  {planTitle}
                </div>
                <p className="text-xs text-[#737373] mt-1">
                  {subscription?.billingMethod === "dodo"
                    ? "Subscribed via Dodo Payments portal."
                    : subscription?.billingMethod === "manual"
                    ? "Manually managed billing."
                    : "14-day cardless trial active."}
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full border",
                    statusBadgeClass
                  )}
                >
                  {statusBadgeText}
                </span>

                {subscription?.currentPeriodEnd && (
                  <span className="text-[11px] text-[#737373] flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> Next cycle renewal:{" "}
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {billingError && (
              <div className="p-3 mb-6 bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{billingError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {subscription?.billingMethod === "dodo" && (
                <button
                  onClick={handleManagePortal}
                  disabled={isBillingPending}
                  className="px-4 py-2.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isBillingPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ExternalLink size={14} />
                  )}
                  Manage Subscription & Invoices in Portal
                </button>
              )}

              {subscription?.billingMethod === "manual" &&
                subscription?.status === "active" &&
                !subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancelManual}
                    disabled={isBillingPending}
                    className="px-4 py-2.5 bg-[#FDF3F3] hover:bg-[#FADCDC] text-[#D14F4F] text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                )}
            </div>
          </section>

          {/* SECTION: AVAILABLE PLANS (PLAN COMPARISON & UPGRADE) */}
          <section className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="pb-6 border-b border-[#F2EFE9] mb-6">
              <h2 className="text-lg font-bold text-[#171717]">
                Available Plans & Upgrades
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Switch plans or add AI capabilities as your brand grows.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Billing location">
              <span className="mr-1 text-xs font-semibold text-[#737373]">Billing location</span>
              <button type="button" aria-pressed={pricingMode === "nepal"} onClick={() => handlePricingMode("nepal")} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${pricingMode === "nepal" ? "border-[#292A25] bg-[#292A25] text-white" : "border-[#D8D5CD]"}`}>🇳🇵 Nepal · NPR</button>
              {!pricingLockedToNepal && <button type="button" aria-pressed={pricingMode === "international"} onClick={() => handlePricingMode("international")} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${pricingMode === "international" ? "border-[#292A25] bg-[#292A25] text-white" : "border-[#D8D5CD]"}`}>International · USD</button>}
              {pricingLockedToNepal && <span className="text-xs text-[#737373]">Pricing is based on your Nepal location.</span>}
            </div>

            <div className="mb-6 rounded-2xl border border-[#E8E5DF] bg-[#FBF9F5] p-5">
                <label htmlFor="billing-promo-code" className="block text-sm font-semibold text-[#171717]">Have a promo code?</label>
                <p className="mt-1 text-xs text-[#737373]">An account can use one promo code once. A used discount cannot be applied again on a later purchase.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input id="billing-promo-code" value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setPromoResult(null); }} maxLength={40} placeholder="Enter promo code" className="min-w-0 flex-1 rounded-xl border border-[#D8D5CD] bg-white px-3 py-2.5 text-sm" />
                  <button type="button" disabled={!promoCode.trim() || checkingPromo} onClick={handleValidatePromo} className="rounded-xl border border-[#D8D5CD] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{checkingPromo ? "Checking…" : "Apply code"}</button>
                </div>
                {promoResult && <p role="status" className={`mt-2 text-sm ${promoResult.valid ? "text-green-700" : "text-red-700"}`}>{promoResult.message}{promoResult.valid && promoResult.discountAvailable && promoResult.discountPercent ? ` ${promoResult.discountPercent}% off your first eligible purchase.` : ""}</p>}
                {promoResult?.valid && (() => { const percent = promoResult.discountAvailable ? promoResult.discountPercent || 0 : 0; return <div className="mt-2 space-y-1 text-xs text-[#565850]">{(["smart_page", "smart_page_ai"] as const).map((planId) => { const price = getPlanPrice(planId, pricingMode); return <p key={planId}><strong>{PAID_PLANS[planId].name}:</strong> {price.currency} {price.amount.toLocaleString()} original · {price.currency} {(price.amount * percent / 100).toFixed(2)} discount · <strong>{price.currency} {(price.amount * (1 - percent / 100)).toFixed(2)} payable</strong></p>; })}</div>; })()}
            </div>
            {billingError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{billingError}</p>}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Plan 1: Pageory */}
              <div className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#E8E5DF] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#171717]">Starter</h3>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Everything you need to present your work professionally and give visitors a clear way to connect with you.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#171717]">
                        {getPlanPrice("smart_page", pricingMode).display}
                      </span>
                      <span className="text-xs text-[#8C8D85]"> / month</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 my-6 text-xs text-[#565850]">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#171717] shrink-0" />
                      1 Custom live page with instant deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#171717] shrink-0" />
                      250 MB Page media & image storage
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#171717] shrink-0" />
                      Custom handle URL & QR code generator
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#171717] shrink-0" />
                      Core analytics & visitor tracking
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => pricingMode === "nepal" ? handleNepalPurchase("smart_page") :
                    handleCheckoutPlan(process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE || "", "smart_page")}
                  disabled={
                    isBillingPending ||
                    (pricingMode !== "nepal" && usageMetrics.plan === "smart_page" && !usageMetrics.isTrial && usageMetrics.isPaidActive)
                  }
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E8E5DF] bg-white hover:bg-[#F2EFE9] text-[#171717] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {pricingMode === "nepal" ? isBillingPending ? "Preparing payment…" : "Continue to Nepal payment" : usageMetrics.plan === "smart_page" && !usageMetrics.isTrial && usageMetrics.isPaidActive
                    ? "Current Active Plan"
                    : `Switch to Starter (${getPlanPrice("smart_page", pricingMode).display}/month)`}
                </button>
              </div>

              {/* Plan 2: Growth (Recommended) */}
              <div className="p-6 rounded-2xl bg-[#171717] text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#171717] uppercase tracking-wider">
                    Recommended
                  </span>
                </div>

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Growth</h3>
                    <p className="text-xs text-[#B0AFA7] mt-0.5">
                      Add an AI chatbot that answers visitor questions from your knowledge and helps interested visitors take the next step.
                    </p>
                    <div className="mt-3">
                      <span className="text-2xl font-bold">{getPlanPrice("smart_page_ai", pricingMode).display}</span>
                      <span className="text-xs text-[#B0AFA7]"> / month</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 my-6 text-xs text-[#E8E5DF]">
                    <li className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      <strong>800 AI Chatbot replies</strong> every month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      20 Knowledge sources (URLs, PDFs, Docs)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      200 Verified FAQs & instant Q&A answers
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      50 AI Catalog product images in chat
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      Automated lead capture & email alerts
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => pricingMode === "nepal" ? handleNepalPurchase("smart_page_ai") :
                    handleCheckoutPlan(process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE_AI || "", "smart_page_ai")}
                  disabled={
                    isBillingPending ||
                    (pricingMode !== "nepal" && usageMetrics.plan === "smart_page_ai" && !usageMetrics.isTrial && usageMetrics.isPaidActive)
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F2EFE9] text-[#171717] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {pricingMode === "nepal" ? isBillingPending ? "Preparing payment…" : "Continue to Nepal payment" : usageMetrics.plan === "smart_page_ai" && !usageMetrics.isTrial && usageMetrics.isPaidActive
                    ? "Current Active Plan"
                    : `Upgrade to Growth (${getPlanPrice("smart_page_ai", pricingMode).display}/month)`}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: ACCOUNT PROFILE & DANGER ZONE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(accountOnly || activeTab === "account") && (
        <div className="space-y-6">
          {/* SECTION: ACCOUNT PROFILE */}
          <section className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-[#F2EFE9] mb-6">
              <span className="w-9 h-9 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#171717]">
                <UserIcon size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  {accountOnly ? "Account Profile" : "Account Information"}
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  {accountOnly ? "Update your personal details." : "Update your personal details and custom URL handle."}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveAccountProfile}
              className="space-y-6 max-w-lg"
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#8C8D85] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#E8E5DF] rounded-xl text-xs text-[#737373] cursor-not-allowed"
                />
                <p className="text-[11px] text-[#8C8D85] mt-1.5">
                  Email is managed via your authentication provider.
                </p>
              </div>

              <div>
                <label
                  htmlFor="account-name"
                  className="block text-[11px] font-semibold text-[#171717] uppercase tracking-wider mb-2"
                >
                  Full Name / Display Name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#E8E5DF] focus:border-[#171717] rounded-xl text-xs text-[#171717] focus:outline-hidden transition-colors"
                />
              </div>

              {!accountOnly && <div>
                <label
                  htmlFor="account-username"
                  className="block text-[11px] font-semibold text-[#171717] uppercase tracking-wider mb-2"
                >
                  Username / Page Handle
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-[#8C8D85] flex items-center gap-0.5 select-none">
                    <AtSign size={13} />
                  </span>
                  <input
                    id="account-username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().trim())
                    }
                    placeholder="username"
                    required
                    className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-xl text-xs text-[#171717] focus:outline-hidden transition-colors font-mono ${
                      usernameStatus === "available"
                        ? "border-emerald-500 focus:border-emerald-600"
                        : usernameStatus === "unavailable"
                        ? "border-[#D14F4F] focus:border-[#D14F4F]"
                        : "border-[#E8E5DF] focus:border-[#171717]"
                    }`}
                  />
                </div>

                {/* Real-time Debounced Availability Feedback */}
                <div className="mt-2 text-xs">
                  {usernameStatus === "checking" && (
                    <span className="text-[#737373] flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-[#171717]" />{" "}
                      Checking availability in database…
                    </span>
                  )}

                  {usernameStatus === "available" && (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check size={13} /> Available! Your page will go live at
                      /{username.toLowerCase()}
                    </span>
                  )}

                  {usernameStatus === "unavailable" && (
                    <span className="text-[#D14F4F] font-medium flex items-center gap-1">
                      <X size={13} /> Username is taken or reserved. Please choose
                      another.
                    </span>
                  )}

                  {usernameStatus === "invalid" && (
                    <span className="text-[#737373]">
                      Use 3–30 letters, numbers, dashes, or underscores.
                    </span>
                  )}

                  {usernameStatus === "current" && (
                    <span className="text-[#737373]">
                      Your current live URL:{" "}
                      <strong className="text-[#171717]">
                        /{user.username}
                      </strong>
                    </span>
                  )}
                </div>
              </div>}

              {accountFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    accountFeedback.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F]"
                  }`}
                >
                  {accountFeedback.type === "success" && <Check size={14} />}
                  <span>{accountFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isUpdatingAccount ||
                  (!accountOnly && (usernameStatus === "checking" || usernameStatus === "unavailable"))
                }
                className="px-5 py-2.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isUpdatingAccount ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving
                    Changes…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </section>

          {!accountOnly && <>
          {/* SECTION: DATA EXPORT */}
          <section className="bg-white border border-[#E8E7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-6 border-b border-[#F2EFE9] mb-6">
              <span className="w-9 h-9 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#171717]">
                <Download size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Account Data Portability
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  Export and download all your profile data, knowledge chunks,
                  conversations, and captured leads in JSON format.
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                setIsExporting(true);
                try {
                  const data = await exportAccountData();
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json"
                    })
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "smart-page-account-export.json";
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  alert(
                    error instanceof Error
                      ? error.message
                      : "Your export could not be prepared."
                  );
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] bg-white hover:bg-[#F2EFE9] text-xs font-semibold text-[#171717] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Preparing
                  Export…
                </>
              ) : (
                <>
                  <Download size={14} /> Download Account Data (.json)
                </>
              )}
            </button>
          </section>

          {/* SECTION: DANGER ZONE */}
          <section className="bg-[#FDF3F3]/40 border border-[#FADCDC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#FADCDC]">
              <span className="w-9 h-9 rounded-xl bg-[#FDF3F3] flex items-center justify-center text-[#D14F4F]">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#D14F4F]">
                  Danger Zone
                </h2>
                <p className="text-xs text-[#9E4040]">
                  Irreversible and destructive account actions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Delete website */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#FADCDC] rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">
                    Delete Website
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5 max-w-md">
                    Permanently unpublish and remove your website and all its
                    pages. Your account and login remain active.
                  </p>
                </div>

                <button
                  onClick={() => setShowDeletePageModal(true)}
                  disabled={!hasPage}
                  className="px-4 py-2 bg-[#FDF3F3] hover:bg-[#FADCDC] text-[#D14F4F] border border-[#FADCDC] text-xs font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {hasPage ? "Delete Website" : "No Website to Delete"}
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#FADCDC] rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-[#D14F4F]">
                    Delete Account
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5 max-w-md">
                    Permanently delete your user account, page, analytics,
                    leads, and all knowledge bases.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDeleteConfirmationText("");
                    setDeleteAccountError(null);
                    setShowDeleteAccountModal(true);
                  }}
                  className="px-4 py-2 bg-[#D14F4F] hover:bg-[#B83E3E] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
          </>}
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE PAGE */}
      {showDeletePageModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#FDF3F3] text-[#D14F4F] flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>

            <h3 className="text-lg font-bold text-[#171717] mb-2">
              Delete Your Website?
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed mb-6">
              This will permanently delete every page on your website and
              unpublish your site. This action cannot be undone.
            </p>

            {deletePageError && (
              <div className="mb-4 p-3 bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F] text-xs rounded-xl">
                {deletePageError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeletePageModal(false)}
                disabled={isDeletingPage}
                className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] bg-[#F2EFE9] hover:bg-[#E8E5DF] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePage}
                disabled={isDeletingPage}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D14F4F] hover:bg-[#B83E3E] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingPage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Confirm Delete Website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE ACCOUNT */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#FADCDC] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#FDF3F3] text-[#D14F4F] flex items-center justify-center mb-4">
              <ShieldAlert size={20} />
            </div>

            <h3 className="text-lg font-bold text-[#D14F4F] mb-2">
              Delete Entire Account?
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed mb-4">
              This action will permanently delete your user profile, published
              page, leads, subscriptions, and all stored data. You will be
              immediately logged out.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#8C8D85] uppercase tracking-wider mb-1.5">
                Type <span className="text-[#D14F4F] font-mono">DELETE</span> to
                confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E5DF] focus:border-[#D14F4F] rounded-xl text-xs text-[#171717] font-mono focus:outline-hidden"
              />
            </div>

            {deleteAccountError && (
              <div className="mb-4 p-3 bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F] text-xs rounded-xl">
                {deleteAccountError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={isDeletingAccount}
                className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] bg-[#F2EFE9] hover:bg-[#E8E5DF] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={
                  isDeletingAccount ||
                  deleteConfirmationText.trim().toUpperCase() !== "DELETE"
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D14F4F] hover:bg-[#B83E3E] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isDeletingAccount ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* RESOURCE CARD SUBCOMPONENT */
/* ────────────────────────────────────────────────────────────────────────── */

function ResourceCard({
  title,
  icon,
  used,
  limit,
  unit,
  customValue,
  percent,
  included = true,
  description
}: {
  title: string;
  icon: React.ReactNode;
  used?: number;
  limit?: number;
  unit?: string;
  customValue?: string;
  percent: number;
  included?: boolean;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-[#E8E5DF] bg-white shadow-2xs flex flex-col justify-between hover:border-[#D5D3CB] transition-colors">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#565850]">
              {icon}
            </span>
            <span className="text-xs font-bold text-[#171717]">{title}</span>
          </div>

          {included && (
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums",
                percent >= 90
                  ? "bg-red-50 text-red-700"
                  : percent >= 80
                  ? "bg-amber-50 text-amber-700"
                  : "bg-[#FBF9F5] text-[#8C8D85]"
              )}
            >
              {percent}%
            </span>
          )}
        </div>

        <div className="mb-2">
          {included ? (
            <div className="text-sm font-bold text-[#171717] tabular-nums">
              {customValue || `${used} / ${limit} ${unit || ""}`}
            </div>
          ) : (
            <div className="text-xs font-medium text-[#8C8D85] italic">
              Not included in plan
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {included ? (
          <div className="h-1.5 w-full bg-[#F2EFE9] rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                percent >= 90
                  ? "bg-red-600"
                  : percent >= 80
                  ? "bg-amber-500"
                  : "bg-[#171717]"
              )}
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>
        ) : (
          <div className="h-1.5 w-full bg-[#F2EFE9] rounded-full mb-2 opacity-50" />
        )}
      </div>

      <p className="text-[11px] text-[#737373] mt-1 leading-snug">
        {description}
      </p>
    </div>
  );
}
