import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Legacy endpoint retained for compatibility. Customer data is no longer purged on subscription expiry. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ purged: 0, disabled: true });
}
