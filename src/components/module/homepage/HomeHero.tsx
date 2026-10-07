import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Code2,
  Layers,
  LayoutDashboard,
  ListChecks,
  MousePointer2,
  Play,
  Rocket,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeAuthButton } from "./HomeAuthButton";

const TRUST_POINTS = ["No credit card required", "Setup in minutes", "Trusted by growing teams"];

// Facts about what Evalora does today.
const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Layers, value: "3", label: "Question types" },
  { icon: Zap, value: "Auto", label: "MCQ scoring" },
  { icon: ShieldCheck, value: "Timeline", label: "Proctoring review" },
  { icon: Trophy, value: "Ranked", label: "Results" },
];

const CAPABILITIES = [
  "Multiple-choice",
  "Coding with test cases",
  "Written answers",
  "Proctoring timeline",
  "Grading queue",
  "Leaderboards",
];

// Everything below is a decorative sample. It shows the shape of the product, not real data.
const NAV_ITEMS: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ClipboardCheck, label: "Assessments" },
  { icon: Users, label: "Candidates" },
  { icon: Trophy, label: "Results" },
  { icon: ShieldCheck, label: "Proctoring" },
  { icon: Target, label: "Team" },
  { icon: Settings, label: "Settings" },
];

const TABS = ["Questions", "Candidates", "Analytics", "Settings"];

const QUESTIONS: {
  title: string;
  icon: LucideIcon;
  type: string;
  chip: string;
  score: string;
  dot: string;
}[] = [
  {
    title: "JavaScript (Data Structures)",
    icon: ListChecks,
    type: "MCQ",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    score: "15/15",
    dot: "bg-emerald-500",
  },
  {
    title: "TypeScript",
    icon: Code2,
    type: "Coding",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    score: "8/10",
    dot: "bg-amber-400",
  },
  {
    title: "React + GraphQL",
    icon: Zap,
    type: "Written",
    chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    score: "10/10",
    dot: "bg-emerald-500",
  },
];

const CODE_LINES: { id: string; indent: number; bars: string[] }[] = [
  { id: "l1", indent: 0, bars: ["w-10", "w-20", "w-8"] },
  { id: "l2", indent: 0, bars: ["w-6", "w-16", "w-14"] },
  { id: "l3", indent: 12, bars: ["w-16", "w-8", "w-12"] },
  { id: "l4", indent: 12, bars: ["w-8", "w-20"] },
  { id: "l5", indent: 24, bars: ["w-12", "w-9", "w-16"] },
  { id: "l6", indent: 12, bars: ["w-6", "w-16"] },
  { id: "l7", indent: 0, bars: ["w-14", "w-7", "w-10"] },
  { id: "l8", indent: 0, bars: ["w-9", "w-20"] },
  { id: "l9", indent: 12, bars: ["w-16", "w-6"] },
];

const TOKEN_COLORS = ["bg-violet-400/80", "bg-sky-400/80", "bg-emerald-400/70"];

function delay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

function CodeMonitor({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "absolute hidden overflow-hidden rounded-[22px] border border-white/20 bg-[#071329] p-4 shadow-[0_30px_80px_rgba(30,70,160,0.35)] lg:block",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-yellow-400" />
          <span className="size-2 rounded-full bg-green-400" />
        </div>
        <span className="text-[9px] font-medium text-slate-500">candidate.tsx</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {CODE_LINES.map((line, lineIndex) => (
          <div key={line.id} className="flex items-center gap-1.5" style={{ paddingLeft: line.indent }}>
            <span className="w-3 text-[8px] text-slate-600">{lineIndex + 1}</span>
            {line.bars.map((width, barIndex) => (
              <span
                key={`${line.id}-${width}`}
                className={cn("h-1.5 rounded-full", width, TOKEN_COLORS[barIndex % TOKEN_COLORS.length])}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/70 bg-card shadow-[0_40px_110px_-20px_rgba(49,76,160,0.45)] dark:border-white/10">
      <div className="flex min-h-[380px]">
        <aside className="hidden w-40 shrink-0 border-r border-border bg-muted/40 p-4 md:block">
          <div className="mb-7 flex items-center gap-2 px-1">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
              <Code2 className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight">Evalora</span>
          </div>

          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium",
                  item.active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold sm:text-base">Junior Full-Stack Assessment</h3>
                <span className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:inline-flex dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <p className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" aria-hidden="true" />
                  60 minutes
                </span>
                <span className="inline-flex items-center gap-1">
                  <Target className="size-3" aria-hidden="true" />
                  25 marks
                </span>
              </p>
            </div>

            <span className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm sm:inline-flex">
              <Trophy className="size-3" aria-hidden="true" />
              View results
            </span>
          </div>

          <ul className="mb-4 flex gap-6 border-b border-border text-[11px] font-medium">
            {TABS.map((tab, index) => (
              <li
                key={tab}
                className={cn(
                  "relative pb-2.5",
                  index === 0
                    ? "text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-muted-foreground",
                )}
              >
                {tab}
              </li>
            ))}
          </ul>

          <ul className="overflow-hidden rounded-xl border border-border">
            {QUESTIONS.map((question) => (
              <li
                key={question.title}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <question.icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="truncate text-xs font-medium">{question.title}</span>
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", question.chip)}>
                  {question.type}
                </span>
                <span className="stat-number w-11 text-right text-xs font-semibold text-muted-foreground">
                  {question.score}
                </span>
                <span className={cn("size-2.5 rounded-full ring-4 ring-card", question.dot)} />
              </li>
            ))}
          </ul>

          <div className="mt-4 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Proctoring signals</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  No suspicious activity
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  Full screen maintained
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Score <span className="stat-number text-lg font-bold text-foreground">18/25</span>
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
                <Check className="size-3" aria-hidden="true" />
                Passed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "glass-card absolute z-30 hidden !rounded-2xl shadow-[0_24px_70px_-10px_rgba(47,72,150,0.35)] sm:flex",
        className,
      )}
    >
      {children}
    </div>
  );
}

function HeroVisual() {
  return (
    <div
      className="animate-fade-up pointer-events-none relative mx-auto w-full max-w-[700px] select-none pb-10 pt-16 lg:max-w-none lg:pb-16 lg:pt-20"
      style={delay(200)}
    >
      {/* Soft colour glows */}
      <div aria-hidden="true" className="absolute left-[10%] top-[12%] -z-10 h-[55%] w-[75%] rounded-full bg-blue-400/25 blur-[90px] dark:bg-blue-500/25" />
      <div aria-hidden="true" className="absolute right-[2%] top-[2%] -z-10 size-56 rounded-full bg-violet-400/30 blur-[80px] dark:bg-violet-500/30" />
      <div aria-hidden="true" className="absolute bottom-[-4%] left-[8%] -z-10 h-36 w-[80%] rounded-full bg-fuchsia-300/25 blur-[70px] dark:bg-fuchsia-500/20" />

      {/* Glass ring behind the top right corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 300"
        className="absolute -right-6 -top-2 -z-10 hidden size-72 lg:block"
      >
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <circle cx="150" cy="150" r="130" fill="none" stroke="url(#hero-ring)" strokeWidth="6" />
      </svg>

      {/* Glass slabs that form the base under the dashboard */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[6%] hidden h-44 w-[62%] rounded-[2rem] border border-white/50 bg-gradient-to-br from-blue-300/50 via-violet-300/40 to-fuchsia-200/40 backdrop-blur-md dark:border-white/10 dark:from-blue-500/25 dark:via-violet-500/25 dark:to-fuchsia-500/15 lg:block [transform:perspective(1200px)_rotateX(58deg)_rotateZ(-6deg)]"
      />
      <div
        aria-hidden="true"
        className="absolute right-[-2%] top-[14%] hidden h-[72%] w-40 rounded-[2rem] border border-white/50 bg-gradient-to-b from-sky-300/50 via-violet-300/40 to-indigo-300/40 backdrop-blur-md dark:border-white/10 dark:from-sky-500/25 dark:via-violet-500/25 dark:to-indigo-500/20 lg:block [transform:perspective(1200px)_rotateY(-28deg)]"
      />

      {/* Dark code monitors */}
      <CodeMonitor
        className="right-[4%] top-[2%] w-[300px] opacity-95"
        style={{ transform: "perspective(1000px) rotateY(-24deg) rotateZ(4deg)" }}
      />
      <CodeMonitor
        className="animate-float-slow left-[-5%] top-[22%] z-20 w-[230px]"
        style={{ transform: "perspective(900px) rotateY(32deg) rotateZ(-5deg)" }}
      />

      {/* Main dashboard */}
      <div className="relative z-10 lg:ml-14 lg:mr-6 lg:[transform:perspective(2200px)_rotateY(-6deg)_rotateX(2deg)_rotateZ(-0.5deg)]">
        <div aria-hidden="true" className="absolute -inset-5 -z-10 rounded-[40px] bg-gradient-to-br from-blue-400/25 via-violet-400/25 to-cyan-300/25 blur-2xl" />
        <DashboardMock />
      </div>

      <FloatingCard className="animate-float left-[-1%] top-[2%] w-[220px] -rotate-3 items-center gap-3 p-3.5 lg:left-[-2%]">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold">Proctoring signals</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">Tab switches and full-screen exits are logged</p>
        </div>
        <span className="absolute right-3 top-3 size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
      </FloatingCard>

      <FloatingCard
        className="animate-float right-[-1%] top-[26%] w-36 rotate-2 flex-col gap-2.5 p-3.5 lg:right-[-3%]"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
          <Code2 className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold leading-tight">
            Real Code
            <br />
            Evaluation
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">Check actual coding skills</p>
        </div>
      </FloatingCard>

      <FloatingCard className="animate-float left-[2%] bottom-[3%] w-[250px] -rotate-2 items-center gap-3 p-3.5 lg:left-[-1%]">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
          RH
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold">Rahim Hasan</p>
          <p className="truncate text-[10px] text-muted-foreground">Frontend Developer</p>
          <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-300">
            Completed
          </span>
        </div>
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full"
          style={{ background: "conic-gradient(#6366f1 88%, rgb(148 163 184 / 0.3) 0)" }}
        >
          <span className="stat-number grid size-8 place-items-center rounded-full bg-card text-[10px] font-bold">88%</span>
        </span>
      </FloatingCard>

      <FloatingCard className="animate-float-slow right-[2%] bottom-[-1%] w-[215px] rotate-1 items-center gap-3 p-3.5 lg:right-[-1%]">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
          <Trophy className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold">Results and ranks</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">A leaderboard for every assessment</p>
        </div>
        <span className="grid size-5 place-items-center rounded-full bg-blue-500 text-white">
          <ChevronRight className="size-3" />
        </span>
        <MousePointer2 className="absolute -bottom-3 -right-2 size-6 fill-slate-900 text-white drop-shadow-md dark:fill-white dark:text-slate-900" />
      </FloatingCard>
    </div>
  );
}

function CapabilityStrip() {
  return (
    <div className="relative bg-gradient-to-b from-transparent via-primary/[0.06] to-primary/[0.12] pb-8 pt-10">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <span className="shrink-0">Everything in one place</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>

      <ul className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-9 gap-y-3 px-4 text-muted-foreground/80 sm:gap-x-12">
        {CAPABILITIES.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-semibold">
            <Check className="size-4 text-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="relative isolate overflow-x-clip">
      <div aria-hidden="true" className="hero-aurora" />

      {/* Wavy lavender band at the bottom */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-20 -z-10 h-32 w-full"
      >
        <path
          fill="var(--brand-via)"
          fillOpacity="0.1"
          d="M0,80 C220,150 460,10 720,70 C980,130 1210,130 1440,40 L1440,160 L0,160 Z"
        />
        <path
          fill="var(--primary)"
          fillOpacity="0.1"
          d="M0,110 C300,50 540,160 820,110 C1080,65 1260,70 1440,115 L1440,160 L0,160 Z"
        />
      </svg>

      <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:min-h-[780px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:pt-16">
        <div className="relative z-20 flex flex-col items-start">
          <div
            className="animate-fade-up mb-7 inline-flex items-center gap-2.5 rounded-full border border-primary/15 bg-card/75 py-1 pl-1 pr-4 text-[11px] font-medium text-muted-foreground shadow-[0_8px_30px_rgba(71,92,160,0.1)] backdrop-blur-xl"
            style={delay(0)}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1.5 font-semibold text-primary">
              <Rocket className="size-3" aria-hidden="true" />
              Next-Gen Assessment Platform
            </span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <ChevronRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
              Build
              <span className="size-1 rounded-full bg-primary/40" />
              Assess
              <span className="size-1 rounded-full bg-primary/40" />
              Grow
            </span>
          </div>

          <h1
            className="animate-fade-up text-[clamp(2.5rem,4vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground"
            style={delay(80)}
          >
            <span className="block">Hire developers based</span>
            <span className="block">on what they can</span>
            <span className="block bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 bg-clip-text pb-2 text-transparent">
              actually build.
            </span>
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-[540px] text-base leading-7 text-muted-foreground sm:text-[17px]"
            style={delay(160)}
          >
            Evalora lets your team design coding assessments, invite candidates and review the results, with
            proctoring signals and a grading queue in one place.
          </p>

          <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={delay(240)}>
            <HomeAuthButton
              guestLabel="Create a Free Account"
              size="xl"
              variant="gradient"
              className="min-w-60 rounded-full"
              leading={<Rocket aria-hidden="true" />}
              trailing={<ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />}
            />

            <Button asChild size="xl" variant="glass" className="rounded-full px-6">
              <Link href="/about">
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                </span>
                See how it works
              </Link>
            </Button>
          </div>

          <ul className="animate-fade-up mt-6 flex flex-wrap gap-2.5" style={delay(320)}>
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 rounded-full border border-border bg-card/70 py-1.5 pl-2 pr-3.5 text-xs text-muted-foreground backdrop-blur"
              >
                <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <ul
            className="animate-fade-up mt-7 grid w-full max-w-[620px] grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[0_15px_45px_rgba(60,82,145,0.1)] backdrop-blur-xl sm:grid-cols-4"
            style={delay(400)}
          >
            {STATS.map((stat, index) => (
              <li
                key={stat.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-4",
                  index !== 0 && "sm:border-l sm:border-border",
                  index % 2 === 1 && "border-l border-border sm:border-l",
                  index > 1 && "border-t border-border sm:border-t-0",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="stat-number text-base font-bold leading-none">{stat.value}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 min-w-0">
          <HeroVisual />
        </div>
      </div>

      <CapabilityStrip />
    </section>
  );
}