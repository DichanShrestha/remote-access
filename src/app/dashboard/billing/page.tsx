import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BillingPage() {
  redirect("/dashboard/settings?tab=billing");
}
