import { ResetPasswordForm } from "@/components/form";
import { redirect } from "next/navigation";


export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/forgot-password");

  return <ResetPasswordForm email={email} />;
}