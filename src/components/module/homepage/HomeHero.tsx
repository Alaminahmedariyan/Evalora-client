import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock,
  Code2,
  Layers,
  Mail,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeAuthButton } from "./HomeAuthButton";

type HeroStat = { icon: LucideIcon; value: string; label: string };

type HeroSlide = {
  id: string;
  badgeIcon: LucideIcon;
  badge: string;
  headingLines: [string, string];
  highlight: string;
  highlightClass: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  trustPoints: string[];
  stats: HeroStat[];
  image: { src: string; alt: string };
};

// Recruiter ebong candidate, duita hero block ekhane ache. Lekha bodlate hole shudhu ekhane bodlan.
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "recruiter",
    badgeIcon: ClipboardCheck,
    badge: "For Recruiters",
    headingLines: ["Hire developers based", "on what they can"],
    highlight: "actually build.",
    highlightClass: "from-blue-500 via-violet-500 to-fuchsia-500",
    description:
      "Build assessments with multiple-choice, coding and written questions, invite candidates by email and review ranked results. Proctoring signals and AI-assisted grading are in one place.",
    primaryLabel: "Create a Free Account",
    secondaryLabel: "See how it works",
    secondaryHref: "/about",
    trustPoints: ["Free plan available", "Invite candidates by email", "Review before you decide"],
    stats: [
      { icon: Layers, value: "3", label: "Question types" },
      { icon: Sparkles, value: "AI", label: "Assisted grading" },
      { icon: ShieldCheck, value: "Risk", label: "Proctoring report" },
      { icon: Trophy, value: "Ranked", label: "Results" },
    ],
    image: {
      src: "/images/hero-recruiter.png",
      alt: "Recruiter dashboard showing an assessment, candidates and results",
    },
  },
  {
    id: "candidate",
    badgeIcon: Users,
    badge: "For Candidates",
    headingLines: ["Show your skills", "through"],
    highlight: "real coding tasks.",
    highlightClass: "from-cyan-500 via-blue-500 to-violet-500",
    description:
      "Accept an invitation and take a timed assessment with coding, multiple-choice and written questions. Get your score and rank once it is evaluated, and keep a profile that you control.",
    primaryLabel: "Start as a Candidate",
    secondaryLabel: "How assessments work",
    secondaryHref: "/about",
    trustPoints: ["Invited by email", "Clear time limit", "See your score and rank"],
    stats: [
      { icon: Mail, value: "Email", label: "Invitations" },
      { icon: Clock, value: "Timed", label: "Assessments" },
      { icon: Code2, value: "Real", label: "Coding tasks" },
      { icon: Trophy, value: "Ranked", label: "Results" },
    ],
    image: {
      src: "/images/hero-candidate.png",
      alt: "Candidate taking a coding assessment",
    },
  },
];

const CAPABILITIES = [
  "Multiple-choice",
  "Coding with test cases",
  "Written answers",
  "AI-assisted grading",
  "Proctoring timeline",
  "Email invitations",
  "Results and ranks",
  "Candidate profiles",
];

function delay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <ul
      className="animate-fade-up mt-7 grid w-full max-w-[620px] grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[0_15px_45px_rgba(60,82,145,0.1)] backdrop-blur-xl sm:grid-cols-4"
      style={delay(400)}
    >
      {stats.map((stat, index) => (
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
  );
}

function HeroImage({ image, priority }: { image: HeroSlide["image"]; priority: boolean }) {
  return (
    <div
      className="animate-fade-up relative mx-auto w-full max-w-[700px] lg:max-w-none"
      style={delay(200)}
    >
      {/* Soft colour glows */}
      <div
        aria-hidden="true"
        className="absolute left-[10%] top-[12%] -z-10 h-[55%] w-[75%] rounded-full bg-blue-400/25 blur-[90px] dark:bg-blue-500/25"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-4%] right-[8%] -z-10 h-36 w-[60%] rounded-full bg-violet-400/25 blur-[70px] dark:bg-violet-500/20"
      />

      {/* Image box. Chobir ratio onujayi aspect-[4/3] bodle nin */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}

function HeroBlock({ slide, index }: { slide: HeroSlide; index: number }) {
  const isFirst = index === 0;
  // Page e shudhu ekta h1 thakbe, tai prothom block h1 ar bakigulo h2
  const Heading = isFirst ? "h1" : "h2";

  return (
    <div
      id={slide.id}
      className={cn(
        "mx-auto grid max-w-[1480px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6",
        isFirst
          ? "pb-10 pt-10 sm:pt-14 lg:min-h-[700px] lg:pt-16"
          : "py-10 lg:min-h-[640px] lg:py-14",
      )}
    >
      {/* Left: text */}
      <div className="relative z-20 flex flex-col items-start">
        <div
          className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 py-1 pl-1 pr-4 text-[11px] font-medium text-muted-foreground shadow-[0_8px_30px_rgba(71,92,160,0.1)] backdrop-blur-xl"
          style={delay(0)}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1.5 font-semibold text-primary">
            <slide.badgeIcon className="size-3" aria-hidden="true" />
            {slide.badge}
          </span>
          <span>Next-Gen Assessment Platform</span>
        </div>

        <Heading
          className="animate-fade-up text-[clamp(2.5rem,4vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground"
          style={delay(80)}
        >
          {slide.headingLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <span
            className={cn(
              "block bg-gradient-to-r bg-clip-text pb-2 text-transparent",
              slide.highlightClass,
            )}
          >
            {slide.highlight}
          </span>
        </Heading>

        <p
          className="animate-fade-up mt-5 max-w-[540px] text-base leading-7 text-muted-foreground sm:text-[17px]"
          style={delay(160)}
        >
          {slide.description}
        </p>

        <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={delay(240)}>
          <HomeAuthButton
            guestLabel={slide.primaryLabel}
            size="xl"
            variant="gradient"
            className="min-w-60 rounded-full"
            leading={<Rocket aria-hidden="true" />}
            trailing={<ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />}
          />

          <Button asChild size="xl" variant="glass" className="rounded-full px-6">
            <Link href={slide.secondaryHref}>
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                <Play className="size-3 fill-current" aria-hidden="true" />
              </span>
              {slide.secondaryLabel}
            </Link>
          </Button>
        </div>

        <ul className="animate-fade-up mt-6 flex flex-wrap gap-2.5" style={delay(320)}>
          {slide.trustPoints.map((point) => (
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

        <HeroStats stats={slide.stats} />
      </div>

      {/* Right: image */}
      <div className="relative z-10 min-w-0">
        <HeroImage image={slide.image} priority={isFirst} />
      </div>
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

      {HERO_SLIDES.map((slide, index) => (
        <HeroBlock key={slide.id} slide={slide} index={index} />
      ))}

      <CapabilityStrip />
    </section>
  );
}