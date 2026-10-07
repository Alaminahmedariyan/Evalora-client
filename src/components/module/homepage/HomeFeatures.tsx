import type { ReactNode } from "react";
import {
  ChevronRight,
  ClipboardCheck,
  Code2,
  FileText,
  History,
  ListChecks,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { MarketingSectionHeading } from "@/components/module/marketing";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { PremiumCard } from "@/components/ui/premium-card";

// The small mock-ups inside each tile are decorative samples, not real data.

const TYPE_ROWS = [
  {
    id: "mcq",
    icon: ListChecks,
    label: "JavaScript closures",
    chip: "MCQ",
    chipClass: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    marks: "5 marks",
  },
  {
    id: "coding",
    icon: Code2,
    label: "Two Sum",
    chip: "Coding",
    chipClass: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    marks: "10 marks",
  },
  {
    id: "written",
    icon: FileText,
    label: "REST vs GraphQL",
    chip: "Written",
    chipClass: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    marks: "10 marks",
  },
];

const TIMELINE_ROWS = [
  { id: "t1", time: "10:12", label: "Switched tabs", dot: "bg-amber-400" },
  { id: "t2", time: "10:31", label: "Exited full screen", dot: "bg-red-400" },
  { id: "t3", time: "10:44", label: "Pasted text", dot: "bg-amber-400" },
];

const QUEUE_ROWS = [
  { id: "q1", label: "Written · REST vs GraphQL", chip: "Pending", chipClass: "status-pending" },
  { id: "q2", label: "Coding · Two Sum", chip: "In review", chipClass: "status-published" },
  { id: "q3", label: "MCQ · Closures", chip: "Auto-scored", chipClass: "status-success" },
];

const LEADERBOARD_ROWS = [
  { id: "r1", rank: 1, name: "Candidate A", percent: 92 },
  { id: "r2", rank: 2, name: "Candidate B", percent: 85 },
  { id: "r3", rank: 3, name: "Candidate C", percent: 78 },
];

const VERSION_ROWS = [
  { id: "v1", label: "v1", latest: false },
  { id: "v2", label: "v2", latest: false },
  { id: "v3", label: "v3", latest: true },
];

const INVITE_STATUSES = [
  { id: "i1", label: "Pending", className: "status-pending" },
  { id: "i2", label: "Accepted", className: "status-published" },
  { id: "i3", label: "Completed", className: "status-success" },
  { id: "i4", label: "Expired", className: "status-expired" },
];

const RULE_ROWS = [
  { id: "s1", label: "Shuffle questions", on: true },
  { id: "s2", label: "Show result immediately", on: false },
  { id: "s3", label: "Allow review", on: true },
];

const SKILLS = ["React", "Node.js", "TypeScript", "PostgreSQL"];

function MiniSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-muted-foreground/30")}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
          on ? "left-[1.1rem]" : "left-0.5",
        )}
      />
    </span>
  );
}

function Mock({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3 text-xs">{children}</div>;
}

type BentoTileProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
  delay?: number;
  children?: ReactNode;
};

function BentoTile({ icon: Icon, title, body, className, delay = 0, children }: BentoTileProps) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <PremiumCard className="flex h-full flex-col gap-5 p-6 md:p-7">
        <span className="icon-tile">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
        {children ? (
          <div className="mt-auto pt-1" aria-hidden="true">
            {children}
          </div>
        ) : null}
      </PremiumCard>
    </Reveal>
  );
}

export function HomeFeatures() {
  return (
    <div className="flex flex-col gap-16">
      <MarketingSectionHeading
        align="center"
        eyebrow="Features"
        title={
          <>
            Everything for a <span className="text-gradient-brand">fair, reviewable</span> assessment
          </>
        }
        description="From writing the first problem to reading the proctoring timeline."
      />

      <div className="grid gap-5 lg:grid-cols-6">
        <BentoTile
          className="lg:col-span-3"
          icon={ClipboardCheck}
          title="Three question types"
          body="Mix multiple-choice, coding and written questions in one assessment. Every problem carries its own marks."
        >
          <Mock>
            {TYPE_ROWS.map((row) => (
              <div key={row.id} className="flex items-center gap-2.5 rounded-lg bg-card px-2.5 py-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <row.icon className="size-3.5" />
                </span>
                <span className="flex-1 truncate font-medium">{row.label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", row.chipClass)}>{row.chip}</span>
                <span className="stat-number w-14 text-right text-muted-foreground">{row.marks}</span>
              </div>
            ))}
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-3"
          delay={100}
          icon={ShieldCheck}
          title="Proctoring timeline"
          body="Tab switches, full-screen exits, copy and paste are recorded in a timeline you can read after the attempt."
        >
          <Mock>
            {TIMELINE_ROWS.map((row) => (
              <div key={row.id} className="flex items-center gap-2.5 rounded-lg bg-card px-2.5 py-2">
                <span className={cn("size-2 rounded-full", row.dot)} />
                <span className="stat-number text-muted-foreground">{row.time}</span>
                <span className="font-medium">{row.label}</span>
              </div>
            ))}
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          icon={ListChecks}
          title="A grading queue"
          body="Multiple-choice answers are scored automatically. Coding and written answers wait for a reviewer, with sample test cases beside the code."
        >
          <Mock>
            {QUEUE_ROWS.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-2">
                <span className="truncate font-medium">{row.label}</span>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", row.chipClass)}>
                  {row.chip}
                </span>
              </div>
            ))}
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          delay={100}
          icon={Trophy}
          title="Results and ranks"
          body="Scores, percentage, pass or fail status and a leaderboard for every assessment."
        >
          <Mock>
            {LEADERBOARD_ROWS.map((row) => (
              <div key={row.id} className="flex items-center gap-2.5 rounded-lg bg-card px-2.5 py-2">
                <span className="stat-number grid size-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {row.rank}
                </span>
                <span className="w-20 shrink-0 truncate font-medium">{row.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-brand-gradient" style={{ width: `${row.percent}%` }} />
                </span>
                <span className="stat-number w-8 text-right text-muted-foreground">{row.percent}%</span>
              </div>
            ))}
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          delay={200}
          icon={History}
          title="Assessment versions"
          body="Update an assessment without losing the history of earlier versions."
        >
          <Mock>
            <div className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-3">
              {VERSION_ROWS.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      row.latest ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground",
                    )}
                  >
                    {row.label}
                    {row.latest ? " · latest" : ""}
                  </span>
                  {index < VERSION_ROWS.length - 1 ? (
                    <ChevronRight className="size-3.5 text-muted-foreground/60" />
                  ) : null}
                </div>
              ))}
            </div>
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          icon={Mail}
          title="Secure invitations"
          body="Invite by email with a private link that expires. Invite someone before they even have an account."
        >
          <Mock>
            <div className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-2">
              <Mail className="size-3.5 text-primary" />
              <span className="font-medium">candidate@email.com</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INVITE_STATUSES.map((status) => (
                <span
                  key={status.id}
                  className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", status.className)}
                >
                  {status.label}
                </span>
              ))}
            </div>
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          delay={100}
          icon={SlidersHorizontal}
          title="Flexible attempt rules"
          body="Set duration, passing marks, attempt limits and a start and end window, and choose how results are shown."
        >
          <Mock>
            {RULE_ROWS.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-2">
                <span className="font-medium">{row.label}</span>
                <MiniSwitch on={row.on} />
              </div>
            ))}
          </Mock>
        </BentoTile>

        <BentoTile
          className="lg:col-span-2"
          delay={200}
          icon={Users}
          title="Candidate profiles"
          body="Candidates share a profile, résumé and links. Recruiters browse the ones who chose to be visible."
        >
          <Mock>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-2">
              <span className="font-medium">Visible to recruiters</span>
              <MiniSwitch on />
            </div>
          </Mock>
        </BentoTile>
      </div>
    </div>
  );
}