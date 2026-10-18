"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
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

// Koto millisecond por por recruiter <-> candidate bodlabe (7000 = 7 second)
const SLIDE_INTERVAL = 7000;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type HeroStat = { icon: LucideIcon; value: string; label: string };

type HeroSlide = {
  id: string;
  badgeIcon: LucideIcon;
  badge: string;
  headingLines: [string, string];
  highlight: string;
  highlightClass: string;
  glowA: string;
  glowB: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  trustPoints: string[];
  stats: HeroStat[];
  image: { src: string; alt: string };
};

// Prothome recruiter, tarpor candidate. Lekha bodlate hole shudhu ekhane bodlan.
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "recruiter",
    badgeIcon: ClipboardCheck,
    badge: "For Recruiters",
    headingLines: ["Hire developers based", "on what they can"],
    highlight: "actually build.",
    highlightClass: "from-blue-500 via-violet-500 to-fuchsia-500",
    glowA: "bg-blue-400/25 dark:bg-blue-500/25",
    glowB: "bg-violet-400/25 dark:bg-violet-500/20",
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
    glowA: "bg-cyan-400/25 dark:bg-cyan-500/20",
    glowB: "bg-blue-400/25 dark:bg-blue-500/20",
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

function buildVariants(reduced: boolean) {
  // Parent: ekta ekta kore ashbe (visible) ar ekta ekta kore jabe (exit, niche theke upore)
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: 0.05 } },
    exit: { transition: { staggerChildren: reduced ? 0 : 0.04, staggerDirection: -1 } },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: reduced ? 0 : 24,
      filter: reduced ? "blur(0px)" : "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduced ? 0.2 : 0.55, ease: EASE },
    },
    exit: {
      opacity: 0,
      y: reduced ? 0 : -14,
      filter: reduced ? "blur(0px)" : "blur(4px)",
      transition: { duration: reduced ? 0.15 : 0.22, ease: "easeIn" },
    },
  };

  const image: Variants = {
    hidden: { opacity: 0, x: reduced ? 0 : 70, scale: reduced ? 1 : 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: reduced ? 0.2 : 0.75, ease: EASE, delay: reduced ? 0 : 0.15 },
    },
    exit: {
      opacity: 0,
      x: reduced ? 0 : -50,
      scale: reduced ? 1 : 0.97,
      transition: { duration: reduced ? 0.15 : 0.3, ease: "easeIn" },
    },
  };

  return { container, item, image };
}

type HeroVariants = ReturnType<typeof buildVariants>;

function HeroStats({ stats, variants }: { stats: HeroStat[]; variants: HeroVariants }) {
  return (
    <motion.ul
      variants={variants.item}
      className="mt-7 grid w-full max-w-[620px] grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[0_15px_45px_rgba(60,82,145,0.1)] backdrop-blur-xl sm:grid-cols-4"
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
    </motion.ul>
  );
}

function HeroImage({
  slide,
  variants,
  reduced,
}: {
  slide: HeroSlide;
  variants: HeroVariants;
  reduced: boolean;
}) {
  return (
    <motion.div
      variants={variants.image}
      className="relative mx-auto w-full max-w-[700px] lg:max-w-none"
    >
      {/* Soft colour glows (slide onujayi rong bodlay) */}
      <div
        aria-hidden="true"
        className={cn("absolute left-[10%] top-[12%] -z-10 h-[55%] w-[75%] rounded-full blur-[90px]", slide.glowA)}
      />
      <div
        aria-hidden="true"
        className={cn("absolute bottom-[-4%] right-[8%] -z-10 h-36 w-[60%] rounded-full blur-[70px]", slide.glowB)}
      />

      {/* Halka floating animation */}
      <motion.div
        animate={reduced ? undefined : { y: [0, -10, 0] }}
        transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        // Chobir ratio onujayi aspect-[4/3] bodle nin
        className="relative aspect-[4/3] w-full"
      >
        <Image
          src={slide.image.src}
          alt={slide.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}

function HeroSlideView({
  slide,
  variants,
  reduced,
}: {
  slide: HeroSlide;
  variants: HeroVariants;
  reduced: boolean;
}) {
  const { item } = variants;

  return (
    <motion.div
      variants={variants.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid w-full items-center gap-10 py-10 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6"
    >
      {/* Left: text */}
      <div className="relative z-20 flex flex-col items-start">
        <motion.div
          variants={item}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 py-1 pl-1 pr-4 text-[11px] font-medium text-muted-foreground shadow-[0_8px_30px_rgba(71,92,160,0.1)] backdrop-blur-xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1.5 font-semibold text-primary">
            <slide.badgeIcon className="size-3" aria-hidden="true" />
            {slide.badge}
          </span>
          <span>Next-Gen Assessment Platform</span>
        </motion.div>

        {/* Heading er proti line alada kore ashbe/jabe */}
        <h1 className="text-[clamp(2.5rem,4vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground">
          {slide.headingLines.map((line) => (
            <motion.span key={line} variants={item} className="block">
              {line}
            </motion.span>
          ))}
          <motion.span
            variants={item}
            className={cn("block bg-gradient-to-r bg-clip-text pb-2 text-transparent", slide.highlightClass)}
          >
            {slide.highlight}
          </motion.span>
        </h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-[540px] text-base leading-7 text-muted-foreground sm:text-[17px]"
        >
          {slide.description}
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
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
        </motion.div>

        <motion.ul variants={item} className="mt-6 flex flex-wrap gap-2.5">
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
        </motion.ul>

        <HeroStats stats={slide.stats} variants={variants} />
      </div>

      {/* Right: image */}
      <div className="relative z-10 min-w-0">
        <HeroImage slide={slide} variants={variants} reduced={reduced} />
      </div>
    </motion.div>
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

      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-9 gap-y-3 px-4 text-muted-foreground/80 sm:gap-x-12"
      >
        {CAPABILITIES.map((item) => (
          <motion.li
            key={item}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
            }}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <Check className="size-4 text-primary" aria-hidden="true" />
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

// Server e false, browser e hydrate howar por true. Eta diye hydration mismatch ashe na.
const subscribeNoop = () => () => {};

export function HomeHero() {
  const prefersReduced = useReducedMotion() ?? false;
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  // Prothom render e (server + browser dutote) shobshomoy false, tai HTML mile jay.
  const reduced = hydrated && prefersReduced;

  const [active, setActive] = useState(0);
  const variants = useMemo(() => buildVariants(reduced), [reduced]);

  // Auto switch: recruiter -> candidate -> recruiter -> ... (kono button nei)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[active];

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

      <div className="mx-auto flex max-w-[1480px] px-5 pb-8 sm:px-8 lg:min-h-[720px] lg:items-center">
        <AnimatePresence mode="wait">
          <HeroSlideView key={slide.id} slide={slide} variants={variants} reduced={reduced} />
        </AnimatePresence>
      </div>

      <CapabilityStrip />
    </section>
  );
}