import { VerifyEmailForm } from "@/components/form";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/register");

  return <VerifyEmailForm email={email} />;
}