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
  AtSign
} from "lucide-react";
import { updateAccountProfile, deleteUserPage, deleteUserAccount, checkUsernameAvailability } from "@/app/actions/settings-actions";
import { createCheckoutSession, createCustomerPortalSession, cancelManualSubscription } from "@/app/actions/billing-actions";
import { createClient } from "@/lib/supabase/client";

interface SettingsClientProps {
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
  } | null;
}

export function SettingsClient({ user, hasPage: initialHasPage, subscription }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Account State
  const [name, setName] = useState(user.name || user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "current" | "available" | "unavailable" | "invalid">("current");
  const [isUpdatingAccount, startAccountTransition] = useTransition();
  const [accountFeedback, setAccountFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Billing State
  const [isBillingPending, startBillingTransition] = useTransition();
  const [billingError, setBillingError] = useState<string | null>(null);

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

  // 1. Account Name & Username Save Handler
  const handleSaveAccountProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFeedback(null);

    if (usernameStatus === "unavailable") {
      setAccountFeedback({ type: "error", message: "That username is taken or reserved. Please pick another." });
      return;
    }

    if (usernameStatus === "invalid") {
      setAccountFeedback({ type: "error", message: "Username must be 3–30 letters, numbers, dashes, or underscores." });
      return;
    }

    startAccountTransition(async () => {
      const res = await updateAccountProfile({ name, username });
      if (res.error) {
        setAccountFeedback({ type: "error", message: res.error });
      } else {
        setAccountFeedback({ type: "success", message: "Account profile updated successfully." });
        setTimeout(() => setAccountFeedback(null), 3500);
        router.refresh();
      }
    });
  };

  // 2. Billing Action Handlers
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
    setBillingError(null);
    startBillingTransition(async () => {
      try {
        const productId = productIdEnv || (planId === "smart_page_ai" ? "prod_smart_page_ai" : "prod_smart_page");
        const res = await createCheckoutSession(productId, planId);
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

  // 3. Delete Page Handler
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

  // 4. Delete Account Handler
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
  const now = new Date();
  let planTitle = "Free";
  let statusBadgeText = "No Active Subscription";
  let statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";

  if (subscription) {
    const rawPlan = (subscription.planId || subscription.tier || "").toLowerCase();
    if (rawPlan.includes("ai") || rawPlan.includes("knowchat")) {
      planTitle = "Smart Page + AI ($29/mo)";
    } else {
      planTitle = "Smart Page ($9/mo)";
    }

    if (subscription.status === "trialing" && subscription.trialEnd) {
      const trialEnd = new Date(subscription.trialEnd);
      const diffMs = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      statusBadgeText = daysLeft > 0 ? `14-Day Free Trial (${daysLeft} days remaining)` : "Trial Expired";
      statusBadgeClass = daysLeft > 0 ? "bg-[#292A25] text-[#FDFCF8] border-[#292A25]" : "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
    } else if (subscription.status === "active") {
      if (subscription.cancelAtPeriodEnd) {
        const endDateStr = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "";
        statusBadgeText = endDateStr ? `Cancels on ${endDateStr}` : "Cancels at period end";
        statusBadgeClass = "bg-[#F3F2EA] text-[#777970] border-[#E8E7E1]";
      } else {
        statusBadgeText = "Active";
        statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }
    } else if (subscription.status === "past_due") {
      statusBadgeText = "Past Due";
      statusBadgeClass = "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
    } else if (subscription.status === "canceled" || subscription.status === "expired") {
      statusBadgeText = "Canceled";
      statusBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
    }
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#292A25] mb-2 font-serif">
          Settings
        </h1>
        <p className="text-[#777970] text-[15px]">
          Manage your account profile, subscription details, and page preferences.
        </p>
      </div>

      <div className="space-y-10">
        {/* SECTION 1: ACCOUNT */}
        <section className="bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8E7E1]">
            <div className="w-9 h-9 rounded-xl bg-[#F3F2EA] flex items-center justify-center text-[#292A25]">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#292A25] font-serif">Account Information</h2>
              <p className="text-xs text-[#777970]">Update your personal details and custom URL handle.</p>
            </div>
          </div>

          <form onSubmit={handleSaveAccountProfile} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-[#A1A299] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full px-4 py-2.5 bg-[#F3F2EA] border border-[#E8E7E1] rounded-xl text-sm text-[#777970] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#999A92] mt-1.5">
                Email is managed via your authentication provider.
              </p>
            </div>

            <div>
              <label htmlFor="account-name" className="block text-xs font-semibold text-[#292A25] uppercase tracking-wider mb-2">
                Full Name / Display Name
              </label>
              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-2.5 bg-[#FDFCF8] border border-[#E8E7E1] rounded-xl text-sm text-[#292A25] focus:outline-hidden focus:border-[#292A25] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="account-username" className="block text-xs font-semibold text-[#292A25] uppercase tracking-wider mb-2">
                Username / Page Handle
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-[#A1A299] flex items-center gap-0.5 select-none">
                  <AtSign size={13} />
                </span>
                <input
                  id="account-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="username"
                  required
                  className={`w-full pl-9 pr-4 py-2.5 bg-[#FDFCF8] border rounded-xl text-sm text-[#292A25] focus:outline-hidden transition-colors font-mono ${
                    usernameStatus === "available"
                      ? "border-emerald-500 focus:border-emerald-600"
                      : usernameStatus === "unavailable"
                      ? "border-[#D14F4F] focus:border-[#D14F4F]"
                      : "border-[#E8E7E1] focus:border-[#292A25]"
                  }`}
                />
              </div>

              {/* Real-time Debounced Availability Feedback */}
              <div className="mt-2 text-xs">
                {usernameStatus === "checking" && (
                  <span className="text-[#777970] flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-[#292A25]" /> Checking availability in database…
                  </span>
                )}

                {usernameStatus === "available" && (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check size={13} /> Available! Your page will go live at /{username.toLowerCase()}
                  </span>
                )}

                {usernameStatus === "unavailable" && (
                  <span className="text-[#D14F4F] font-medium flex items-center gap-1">
                    <X size={13} /> Username is taken or reserved. Please choose another.
                  </span>
                )}

                {usernameStatus === "invalid" && (
                  <span className="text-[#777970]">
                    Use 3–30 letters, numbers, dashes, or underscores.
                  </span>
                )}

                {usernameStatus === "current" && (
                  <span className="text-[#777970]">
                    Your current live URL: <strong className="text-[#292A25]">/{user.username}</strong>
                  </span>
                )}
              </div>
            </div>

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
              disabled={isUpdatingAccount || usernameStatus === "checking" || usernameStatus === "unavailable"}
              className="px-5 py-2.5 bg-[#292A25] hover:bg-[#3C3D37] text-[#FDFCF8] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingAccount ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Changes…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </section>

        {/* SECTION 2: BILLING */}
        <section className="bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8E7E1]">
            <div className="w-9 h-9 rounded-xl bg-[#F3F2EA] flex items-center justify-center text-[#292A25]">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#292A25] font-serif">Billing & Subscription</h2>
              <p className="text-xs text-[#777970]">View your current plan and manage subscription settings.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#FAF9F5] border border-[#E8E7E1] rounded-xl">
              <div>
                <span className="text-[11px] font-semibold text-[#A1A299] uppercase tracking-wider block mb-1">
                  Current Plan
                </span>
                <div className="text-xl font-bold text-[#292A25] font-serif">
                  {planTitle}
                </div>
                <p className="text-xs text-[#777970] mt-1">
                  {subscription?.billingMethod === "dodo"
                    ? "Subscribed via Dodo Payments."
                    : subscription?.billingMethod === "manual"
                    ? "Managed via local manual billing."
                    : "14-day cardless free trial active."}
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusBadgeClass}`}>
                  {statusBadgeText}
                </span>

                {subscription?.currentPeriodEnd && (
                  <span className="text-[11px] text-[#777970] flex items-center gap-1 mt-1">
                    <Calendar size={12} /> Next renewal: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {billingError && (
              <div className="p-3 bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F] rounded-xl text-xs">
                {billingError}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              {/* Manage in Dodo Portal Button */}
              {subscription?.billingMethod === "dodo" && (
                <button
                  onClick={handleManagePortal}
                  disabled={isBillingPending}
                  className="px-4 py-2.5 bg-[#292A25] hover:bg-[#3C3D37] text-[#FDFCF8] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isBillingPending ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                  Manage Subscription in Dodo Portal
                </button>
              )}

              {/* Cancel Manual Subscription Button */}
              {subscription?.billingMethod === "manual" && subscription?.status === "active" && !subscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancelManual}
                  disabled={isBillingPending}
                  className="px-4 py-2.5 bg-[#FDF3F3] hover:bg-[#FADCDC] text-[#D14F4F] text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}

              {/* Upgrade / Change Plan Buttons */}
              <button
                onClick={() => handleCheckoutPlan(process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE || "", "smart_page")}
                disabled={isBillingPending}
                className="px-4 py-2.5 bg-[#F3F2EA] hover:bg-[#E8E7E1] text-[#292A25] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} className="text-emerald-700" />
                Switch to Smart Page ($9/mo)
              </button>

              <button
                onClick={() => handleCheckoutPlan(process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE_AI || "", "smart_page_ai")}
                disabled={isBillingPending}
                className="px-4 py-2.5 bg-[#292A25] hover:bg-[#3C3D37] text-[#FDFCF8] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} className="text-amber-400" />
                Switch to Smart Page + AI ($29/mo)
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: DANGER ZONE */}
        <section className="bg-[#FDF3F3]/40 border border-[#FADCDC] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#FADCDC]">
            <div className="w-9 h-9 rounded-xl bg-[#FDF3F3] flex items-center justify-center text-[#D14F4F]">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#D14F4F] font-serif">Danger Zone</h2>
              <p className="text-xs text-[#9E4040]">Irreversible and destructive account actions.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Delete Page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#FDFCF8] border border-[#FADCDC] rounded-xl">
              <div>
                <h3 className="text-sm font-semibold text-[#292A25]">Delete Page</h3>
                <p className="text-xs text-[#777970] mt-0.5 max-w-md">
                  Permanently remove your published Smart Page and draft configuration. Your account remains intact.
                </p>
              </div>

              <button
                onClick={() => setShowDeletePageModal(true)}
                disabled={!hasPage}
                className="px-4 py-2 bg-[#FDF3F3] hover:bg-[#FADCDC] text-[#D14F4F] border border-[#FADCDC] text-xs font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {hasPage ? "Delete Page" : "No Page to Delete"}
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#FDFCF8] border border-[#FADCDC] rounded-xl">
              <div>
                <h3 className="text-sm font-semibold text-[#D14F4F]">Delete Account</h3>
                <p className="text-xs text-[#777970] mt-0.5 max-w-md">
                  Permanently delete your user account, page, analytics, leads, and all associated data. This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() => {
                  setDeleteConfirmationText("");
                  setDeleteAccountError(null);
                  setShowDeleteAccountModal(true);
                }}
                className="px-4 py-2 bg-[#D14F4F] hover:bg-[#B83E3E] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* CONFIRMATION MODAL: DELETE PAGE */}
      {showDeletePageModal && (
        <div className="fixed inset-0 z-50 bg-[#292A25]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#FDF3F3] text-[#D14F4F] flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>

            <h3 className="text-lg font-bold text-[#292A25] font-serif mb-2">Delete Your Page?</h3>
            <p className="text-xs text-[#777970] leading-relaxed mb-6">
              This will permanently delete your custom Smart Page configuration and unpublish your site. This action cannot be undone.
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
                className="px-4 py-2 text-xs font-medium text-[#777970] hover:text-[#292A25] bg-[#F3F2EA] hover:bg-[#E8E7E1] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePage}
                disabled={isDeletingPage}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D14F4F] hover:bg-[#B83E3E] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingPage ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Confirm Delete Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE ACCOUNT */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-[#292A25]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#FADCDC] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#FDF3F3] text-[#D14F4F] flex items-center justify-center mb-4">
              <ShieldAlert size={20} />
            </div>

            <h3 className="text-lg font-bold text-[#D14F4F] font-serif mb-2">Delete Entire Account?</h3>
            <p className="text-xs text-[#777970] leading-relaxed mb-4">
              This action will permanently delete your user profile, published page, leads, subscriptions, and all stored data. You will be immediately logged out.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#A1A299] uppercase tracking-wider mb-1.5">
                Type <span className="text-[#D14F4F] font-mono">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 bg-[#FDFCF8] border border-[#E8E7E1] focus:border-[#D14F4F] rounded-xl text-xs text-[#292A25] font-mono focus:outline-hidden"
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
                className="px-4 py-2 text-xs font-medium text-[#777970] hover:text-[#292A25] bg-[#F3F2EA] hover:bg-[#E8E7E1] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D14F4F] hover:bg-[#B83E3E] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isDeletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
