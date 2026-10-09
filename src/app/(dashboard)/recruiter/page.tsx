"use client";

import { Building2, ClipboardList, Code2, FileText, Gauge, ListChecks, UserPlus } from "lucide-react";

import { useMyCompany, useMySubscription, useProblems, useAssessments } from "@/hooks";
import { formatLimit, PLAN_LABEL, type SubscriptionPlan } from "@/constants/plans";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, QuickLinkCard } from "@/components/dashboard";
import { readPlanInfo } from "@/lib/plan-info";
import { CompanyVerificationBanner } from "@/components/module/company/CompanyVerificationBanner";

const skeletonItems = ["recruiter-stat-skeleton-1", "recruiter-stat-skeleton-2", "recruiter-stat-skeleton-3", "recruiter-stat-skeleton-4"];

export default function RecruiterHomePage() {
  const { data: companyRes, isPending: companyPending } = useMyCompany();
  const { data: subRes, isPending: subPending } = useMySubscription();
  const { data: problemsRes, isPending: problemsPending } = useProblems({
    page: 1,
    limit: 1,
  });
  const { data: assessmentsRes, isPending: assessmentsPending } = useAssessments({
    page: 1,
    limit: 1,
  });

  const isPending = companyPending || subPending || problemsPending || assessmentsPending;

  const company = companyRes?.data;
  const subscription = subRes?.data;

  const planInfo = readPlanInfo(subscription);

  const currentPlan: SubscriptionPlan = planInfo?.effectivePlan ?? (subscription && "plan" in subscription ? subscription.plan : "FREE");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{company ? `Welcome back, ${company.name}` : "Welcome"}</h1>

        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your hiring pipeline.</p>
      </div>

      <CompanyVerificationBanner />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skeletonItems.map((id) => (
            <Skeleton key={id} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Problems" value={problemsRes?.meta?.total ?? 0} icon={Code2} accent="primary" />

          <StatCard label="Assessments" value={assessmentsRes?.meta?.total ?? 0} icon={ClipboardList} accent="primary" />

          <StatCard label="Plan" value={PLAN_LABEL[currentPlan]} icon={Gauge} accent={currentPlan === "FREE" ? "warning" : "success"}>
            {planInfo ? (
              <p className="text-xs text-muted-foreground">
                {planInfo.usage.assessments}/{formatLimit(planInfo.limits.maxAssessments)} assessments ·{" "}
                {planInfo.usage.invitationsLast30Days}/{formatLimit(planInfo.limits.maxInvitationsPer30Days)} invitations
              </p>
            ) : null}
          </StatCard>

          <StatCard
            label="Company status"
            value={company?.isVerified ? "Verified" : "Pending"}
            icon={Building2}
            accent={company?.isVerified ? "success" : "warning"}
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            href="/recruiter/problems/new"
            icon={FileText}
            title="Create a problem"
            description="Add a new MCQ, coding, or written question."
          />

          <QuickLinkCard
            href="/recruiter/assessments/new"
            icon={ClipboardList}
            title="Create an assessment"
            description="Combine problems into a candidate assessment."
          />

          <QuickLinkCard
            href="/recruiter/assessments"
            icon={UserPlus}
            title="Invite candidates"
            description="Open a published assessment to send invitations."
          />

          <QuickLinkCard
            href="/recruiter/company"
            icon={Building2}
            title="Company profile"
            description="Update your company details and logo."
          />

          <QuickLinkCard href="/recruiter/subscription" icon={Gauge} title="Subscription" description="Manage your plan and billing." />

          <QuickLinkCard
            href="/recruiter/evaluations"
            icon={ListChecks}
            title="Grading"
            description="Review submissions awaiting evaluation."
          />
        </div>
      </div>
    </div>
  );
}
