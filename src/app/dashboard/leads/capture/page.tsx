import { redirect } from "next/navigation";

export default function LeadCapturePage() {
  redirect("/dashboard/leads?tab=capture");
}
