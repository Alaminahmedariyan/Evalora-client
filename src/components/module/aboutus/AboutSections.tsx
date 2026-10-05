import {
  ClipboardList,
  Code2,
  Eye,
  ListChecks,
  Send,
  ShieldCheck,
  Tag,
  UserCircle,
  Users,
} from "lucide-react";

const STEPS = [
  {
    icon: Code2,
    title: "Build your problem bank",
    body: "Write multiple-choice, coding and written problems once and reuse them across assessments.",
  },
  {
    icon: ClipboardList,
    title: "Compose an assessment",
    body: "Pick problems and marks, set the time limit and number of attempts, and add an optional start and end time.",
  },
  {
    icon: Send,
    title: "Invite candidates",
    body: "Send invitations by email. Candidates accept from their own dashboard and start when they are ready.",
  },
  {
    icon: ListChecks,
    title: "Review and decide",
    body: "See scores, a leaderboard and a proctoring timeline for every attempt, and grade the answers that need a person.",
  },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "For hiring teams",
    points: [
      "One place for problems, assessments, invitations and results",
      "A grading queue for coding and written answers",
      "A proctoring timeline to review after each attempt",
    ],
  },
  {
    icon: UserCircle,
    title: "For candidates",
    points: [
      "Accept invitations and start from your own dashboard",
      "Answers are saved as you type",
      "You choose whether recruiters can find your profile",
    ],
  },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Signals, not verdicts",
    body: "Proctoring records tab switches, full-screen exits, and copy and paste. A signal is context for a human reviewer, never an automatic decision.",
  },
  {
    icon: Eye,
    title: "Candidates stay in control",
    body: "Candidates can hide their profile from recruiters, download a copy of their data and delete their account from their settings.",
  },
  {
    icon: Tag,
    title: "Plain pricing",
    body: "Start free. Paid plans are one-time payments that last 30 days, with no automatic renewal.",
  },
];

export function AboutSteps() {
  return (
    <ol className="grid gap-8 md:grid-cols-2">
      {STEPS.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <step.icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Step {index + 1}</p>
            <h3 className="mt-0.5 text-base font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AboutAudiences() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {AUDIENCES.map((audience) => (
        <div key={audience.title} className="card-evalora flex flex-col gap-4 p-6">
          <audience.icon className="size-6 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">{audience.title}</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {audience.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AboutPrinciples() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {PRINCIPLES.map((principle) => (
        <div key={principle.title} className="flex flex-col gap-2">
          <principle.icon className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold">{principle.title}</h3>
          <p className="text-sm text-muted-foreground">{principle.body}</p>
        </div>
      ))}
    </div>
  );
}