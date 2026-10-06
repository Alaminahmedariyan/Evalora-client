import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeCta() {
  return (
    <div className="cta-panel px-6 py-14 text-center md:px-12 md:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Free to start
        </span>

        <h2 className="text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
          Ready to run your first assessment?
        </h2>

        <p className="text-base text-white/75 md:text-lg">
          Set up a company profile and send your first invitation in a few minutes.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="xl" variant="light">
            <Link href="/register">
              Get started
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="onDark">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}