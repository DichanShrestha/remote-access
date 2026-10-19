import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAffiliateAdmin();
  const config = await db.affiliateConfig.findUnique({ where: { id: 1 } });
  return <AdminSettingsClient config={config ? { discount: Number(config.customerDiscountPercent), commission: Number(config.commissionPercent), months: config.eligibilityMonths } : { discount: 10, commission: 15, months: 12 }} />;
}
