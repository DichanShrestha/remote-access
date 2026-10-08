import { authService } from "@/services/auth";
import db from "@/lib/prisma";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await authService.requireUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: { page: true },
  });

  const subscription = await db.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedSubscription = subscription
    ? {
        id: subscription.id,
        planId: subscription.planId,
        tier: subscription.tier,
        status: subscription.status,
        billingMethod: subscription.billingMethod,
        currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : null,
        trialEnd: subscription.trialEnd ? subscription.trialEnd.toISOString() : null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        dodoCustomerId: subscription.dodoCustomerId,
      }
    : null;

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: profile?.displayName || null,
        username: profile?.username || null,
      }}
      hasPage={Boolean(profile?.page)}
      subscription={formattedSubscription}
    />
  );
}
