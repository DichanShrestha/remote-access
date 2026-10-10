"use server";

import { authService } from "@/services/auth";
import { dodo } from "@/lib/dodopayments";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizePlan, TRIAL_MS } from "@/lib/tier-limits";

export async function createCheckoutSession(
    productId: string,
    planId: string = "smart_page",
    type: "subscription" | "one_time" = "subscription"
) {
    const user = await authService.requireUser();

    if (!dodo || !process.env.DODO_API_KEY) throw new Error("Billing is temporarily unavailable. Please try again later.");
    const canonicalPlan = normalizePlan(planId);
    const configuredProduct = canonicalPlan === "smart_page_ai" ? process.env.DODO_PRODUCT_SMART_PAGE_AI : process.env.DODO_PRODUCT_SMART_PAGE;
    if (!configuredProduct || productId !== configuredProduct) throw new Error("This plan is not configured for checkout.");

    try {
        const session = await dodo.checkoutSessions.create({
            customer: { email: user.email!, name: user.email! },
            product_cart: [{ product_id: productId, quantity: 1 }],
            metadata: { user_id: user.id, plan_id: canonicalPlan },
            feature_flags: {
                allow_discount_code: true
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing`,
        });

        return { payment_link: session.checkout_url };
    } catch (e: any) { console.error("Dodo checkout creation failed:", e.message); throw new Error("Could not start checkout. Please try again."); }
}

export async function startFreeTrial(planId: string = "smart_page") {
    const user = await authService.requireUser();
    
    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_MS);
    await db.$transaction(async (tx) => {
        const existing = await tx.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });
        if (existing && ["active", "past_due"].includes(existing.status)) throw new Error("You already have a paid subscription.");
        if (existing?.trialEverGranted || existing?.trialStart || existing?.status === "trialing") throw new Error("Your one-time trial has already been used.");
        const claim = await tx.user.updateMany({ where: { id: user.id, trialGrantedAt: null }, data: { trialGrantedAt: now } });
        if (!claim.count) throw new Error("Your one-time trial has already been used.");
        if (existing) await tx.subscription.update({ where: { id: existing.id }, data: { planId: "trial", tier: "trial", status: "trialing", billingMethod: "none", trialStart: now, trialEnd, currentPeriodEnd: trialEnd, trialEverGranted: true } });
        else await tx.subscription.create({ data: { userId: user.id, planId: "trial", status: "trialing", billingMethod: "none", trialStart: now, trialEnd, currentPeriodEnd: trialEnd, tier: "trial", trialEverGranted: true } });
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    return { success: true, trialEnd };
}

export async function cancelManualSubscription() {
    const user = await authService.requireUser();
    
    await db.subscription.updateMany({
        where: { 
            userId: user.id,
            billingMethod: "manual",
            status: "active"
        },
        data: {
            cancelAtPeriodEnd: true
        }
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/settings");
}

export async function createCustomerPortalSession() {
    const user = await authService.requireUser();
    const sub = await db.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });

    if (!dodo) throw new Error("Dodo client not initialized");
    if (!sub?.dodoCustomerId) {
        throw new Error("No customer portal record found. Please contact support.");
    }

    try {
        const session = await dodo.customers.customerPortal.create(sub.dodoCustomerId, {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings`
        });
        return { url: session.link };
    } catch (e: any) { console.error("Dodo Customer Portal error:", e.message); throw new Error("Could not open the billing portal. Please try again later."); }
}
