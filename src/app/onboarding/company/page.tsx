import { RegisterCompanyForm } from "@/components/form";
import AuthGuard from "@/components/module/auth/auth-guard";

export default function CompanyOnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full card-evalora p-8">
        <AuthGuard>
          <RegisterCompanyForm />
        </AuthGuard>
      </div>
    </div>
  );
}