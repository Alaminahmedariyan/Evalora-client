import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-danger/10">
          <ShieldAlert className="size-7 text-danger" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">You do not have access to this page</h1>
          <p className="text-sm text-muted-foreground">
            Go back to{" "}
            <Link href="/" className="text-primary hover:underline">
              home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}