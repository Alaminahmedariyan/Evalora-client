import { redirect } from "next/navigation";

// Some payment return links point to /dashboard/billing/subscription, but the
// real page lives in the (dashboard) route group at /recruiter/subscription.
// Send visitors on instead of showing a 404.
export default function BillingSubscriptionRedirect() {
  redirect("/recruiter/subscription");
}