"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Pencil, ShieldCheck, ShieldQuestion, Tag, Trash2 } from "lucide-react";

import type { Company } from "@/types";

import { useDeleteCompany } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UpdateCompanyForm } from "@/components/form";

// Where to send the user after they delete their company. Their role drops
// back to CANDIDATE, so the recruiter area is no longer valid for them.
const AFTER_DELETE_REDIRECT = "/";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CompanyProfileCard({ company }: { company: Company }) {
  const router = useRouter();
  const deleteMutation = useDeleteCompany();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(company.id);

      notify.success("Company deleted", "Your account is now a candidate account.");

      router.push(AFTER_DELETE_REDIRECT);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't delete company", isApiError(error) ? error.message : undefined);
    }
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit company profile</CardTitle>
        </CardHeader>

        <CardContent>
          <UpdateCompanyForm company={company} onSaved={() => setEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-16">
              <AvatarImage src={company.logo ?? undefined} alt={company.name} />

              <AvatarFallback className="text-lg">{getInitials(company.name)}</AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-lg font-semibold">{company.name}</h2>

              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {company.isVerified ? (
                  <span className="status-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  <span className="status-pending inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium">
                    <ShieldQuestion className="size-3" aria-hidden="true" />
                    Awaiting verification
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>

            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} isLoading={deleteMutation.isPending}>
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        {company.description ? <p className="text-sm text-muted-foreground">{company.description}</p> : null}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive flex items-center gap-1.5 hover:text-foreground"
            >
              <Globe className="size-4" aria-hidden="true" />
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}

          {company.industry ? (
            <span className="flex items-center gap-1.5">
              <Tag className="size-4" aria-hidden="true" />
              {company.industry}
            </span>
          ) : null}
        </div>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete your company?"
          description="Your published assessments will be closed, pending invitations cancelled, and your account goes back to a candidate account. You can register a company again later."
          confirmLabel="Delete company"
          variant="destructive"
          onConfirm={() => void handleDelete()}
        />
      </CardContent>
    </Card>
  );
}
