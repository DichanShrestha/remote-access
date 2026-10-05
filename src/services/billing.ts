"use server";

import { dodo } from "@/lib/dodopayments";
import { createClient } from "@/lib/supabase/server";

export async function createCheckoutSession(
  productId: string,
  type: "subscription" | "one_time"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // We try to call real Dodo Payments if available, else we mock it
  try {
    if (!dodo) throw new Error("Dodo client not initialized");

    const session = await dodo.checkoutSessions.create({
      customer: { email: user.email!, name: user.email! },
      product_cart: [{ product_id: productId, quantity: 1 }],
      metadata: { user_id: user.id },
      feature_flags: {
        allow_discount_code: true
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/settings`,
    });

    return { payment_link: session.checkout_url };
  } catch (e: any) {
    console.warn("Dodo Payments API error, using fallback stub:", e.message);
    // Fallback for demo purposes
    return {
      payment_link: `https://dodopayments.com/mock-checkout/${productId}`,
    };
  }
}
