import Link from "next/link";
import { ClipboardCheck, ShieldCheck, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";

// TODO: once a server-side session helper exists, redirect logged-in users
// straight to their dashboard instead of showing marketing content:
//
// const session = await getServerSession();
// if (session?.user) {
//   if (session.user.role === "ADMIN") redirect("/admin");
//   if (session.user.role === "RECRUITER") redirect("/recruiter");
//   redirect("/candidate");
// }

const highlights = [
  {
    icon: ClipboardCheck,
    title: "Real coding problems, not trivia",
    body: "MCQ, live coding, and written questions in one assessment — scored the way your team actually evaluates candidates.",
  },
  {
    icon: ShieldCheck,
    title: "Proctoring built in",
    body: "Tab-switch detection, fullscreen enforcement, and a full timeline your team can review after the attempt ends.",
  },
  {
    icon: Timer,
    title: "Results in minutes, not days",
    body: "MCQs grade instantly. Coding and written answers land in a queue your evaluators can clear in one sitting.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:px-6 md:pt-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Hire developers based on what they can actually build.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Evalora lets your team design coding assessments, invite candidates,
            and review results — without stitching together a spreadsheet, a
            code sandbox, and a scheduling tool.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Create a free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <item.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="card-evalora flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ready to run your first assessment?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up a company profile and send your first invitation in a few minutes.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </section>
    </>
  );
}