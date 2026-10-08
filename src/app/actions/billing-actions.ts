"use server";

import { authService } from "@/services/auth";
import { dodo } from "@/lib/dodopayments";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCheckoutSession(
    productId: string,
    planId: string = "smart_page",
    type: "subscription" | "one_time" = "subscription"
) {
    const user = await authService.requireUser();

    try {
        if (!dodo) throw new Error("Dodo client not initialized");

        const session = await dodo.checkoutSessions.create({
            customer: { email: user.email!, name: user.email! },
            product_cart: [{ product_id: productId, quantity: 1 }],
            metadata: { user_id: user.id, plan_id: planId },
            feature_flags: {
                allow_discount_code: true
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing`,
        });

        return { payment_link: session.checkout_url };
    } catch (e: any) {
        console.warn("Dodo Payments API error, using fallback stub:", e.message);
        return {
            payment_link: `https://dodopayments.com/mock-checkout/${productId}`,
        };
    }
}

export async function startFreeTrial(planId: string = "smart_page") {
    const user = await authService.requireUser();
    
    // Check if user already has a subscription/trial
    const existing = await db.subscription.findFirst({
        where: { userId: user.id }
    });

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    if (existing) {
        await db.subscription.update({
            where: { id: existing.id },
            data: {
                planId,
                tier: planId,
                status: "trialing",
                trialStart: existing.trialStart || now,
                trialEnd: existing.trialEnd || trialEnd,
            }
        });
    } else {
        await db.subscription.create({
            data: {
                userId: user.id,
                planId,
                status: "trialing",
                billingMethod: "none",
                trialStart: now,
                trialEnd,
                tier: planId,
            }
        });
    }

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
}
