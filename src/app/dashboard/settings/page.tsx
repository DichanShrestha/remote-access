import { authService } from "@/services/auth";
import db from "@/lib/prisma";
import { SettingsClient, UsageMetrics } from "@/components/dashboard/SettingsClient";
import { getSmartPageEntitlement, SMART_PAGE_LIMITS } from "@/lib/tier-limits";
import { cookies, headers } from "next/headers";
import { getInitialPricingMode, PRICING_MODE_COOKIE } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const pricingMode = getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get("x-vercel-ip-country"));
  const initialTab = resolvedParams?.tab === "account" ? "account" : "billing";

  const user = await authService.requireUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: { page: true },
  });

  const account = await db.user.findUnique({
    where: { id: user.id },
    include: {
      subscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
      usage: true,
    },
  });

  const subscription =
    account?.subscriptions?.[0] ||
    (await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }));

  const entitlement = account ? getSmartPageEntitlement(account) : null;
  const plan: "trial" | "smart_page" | "smart_page_ai" =
    (entitlement?.plan as "trial" | "smart_page" | "smart_page_ai") || "trial";
  const limits = entitlement?.limits || SMART_PAGE_LIMITS.trial;

  const sourceCount = await db.dataSource.count({
    where: { userId: user.id, type: { not: "qa" }, status: { not: "error" } },
  });
  const faqCount = await db.qAPair.count({
    where: { userId: user.id },
  });
  const catalogImageCount = await db.catalogImage.count({
    where: { catalogItem: { userId: user.id } },
  });

  const actualMediaAgg = await db.pageMediaAsset.aggregate({
    where: { userId: user.id },
    _sum: { sizeBytes: true },
  });
  const actualMediaBytes = Number(actualMediaAgg._sum.sizeBytes || 0);
  const mediaBytes = Math.max(
    Number(account?.usage?.pageMediaBytes || 0),
    actualMediaBytes
  );
  const knowledgeBytes = Number(account?.usage?.knowledgeBytes || 0);
  const indexedTokens = account?.usage?.indexedTokens || 0;
  const aiRepliesUsed = subscription?.aiRepliesUsed || 0;

  const now = new Date();
  let trialDaysRemaining = 0;
  if (subscription?.status === "trialing" && subscription?.trialEnd) {
    const diffMs = subscription.trialEnd.getTime() - now.getTime();
    trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const formattedSubscription = subscription
    ? {
        id: subscription.id,
        planId: subscription.planId,
        tier: subscription.tier,
        status: subscription.status,
        billingMethod: subscription.billingMethod,
        currentPeriodEnd: subscription.currentPeriodEnd
          ? subscription.currentPeriodEnd.toISOString()
          : null,
        trialEnd: subscription.trialEnd
          ? subscription.trialEnd.toISOString()
          : null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        dodoCustomerId: subscription.dodoCustomerId,
        aiRepliesUsed,
      }
    : null;

  const usageMetrics: UsageMetrics = {
    plan,
    isTrial: subscription?.status === "trialing",
    isPaidActive: entitlement?.paidActive ?? false,
    trialDaysRemaining,
    trialEnd: subscription?.trialEnd
      ? subscription.trialEnd.toISOString()
      : null,
    currentPeriodEnd: subscription?.currentPeriodEnd
      ? subscription.currentPeriodEnd.toISOString()
      : null,
    aiReplies: {
      used: aiRepliesUsed,
      limit: limits.aiReplies,
      included: plan !== "smart_page",
    },
    knowledgeSources: {
      used: sourceCount,
      limit: limits.knowledgeSources,
      included: plan !== "smart_page",
    },
    faqEntries: {
      used: faqCount,
      limit: limits.faqEntries,
      included: plan !== "smart_page",
    },
    aiImages: {
      used: catalogImageCount,
      limit: limits.aiImages,
      included: plan !== "smart_page",
    },
    knowledgeStorage: {
      usedBytes: knowledgeBytes,
      limitBytes: Number(limits.knowledgeBytes),
      included: plan !== "smart_page",
    },
    pageMediaStorage: {
      usedBytes: mediaBytes,
      limitBytes: Number(limits.pageMediaBytes),
      included: true,
    },
    indexedTokens: {
      used: indexedTokens,
      limit: limits.indexedTokens,
      included: plan !== "smart_page",
    },
  };

  return (
    <SettingsClient
      initialTab={initialTab}
      pricingMode={pricingMode}
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: profile?.displayName || null,
        username: profile?.username || null,
      }}
      hasPage={Boolean(profile?.page)}
      subscription={formattedSubscription}
      usageMetrics={usageMetrics}
    />
  );
}
