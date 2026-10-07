import { Check, ClipboardPaste, Copy, Maximize2, MonitorOff, ShieldCheck, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

const SIGNALS = ["Tab switches", "Full-screen exits", "Copy and paste"];

// A decorative sample of what the timeline looks like. It is not real data.
const EVENTS: { id: string; time: string; label: string; icon: LucideIcon; tone: string }[] = [
  { id: "e1", time: "10:12", label: "Switched tabs", icon: MonitorOff, tone: "bg-amber-400/15 text-amber-300" },
  { id: "e2", time: "10:31", label: "Exited full screen", icon: Maximize2, tone: "bg-red-400/15 text-red-300" },
  { id: "e3", time: "10:38", label: "Copied text", icon: Copy, tone: "bg-amber-400/15 text-amber-300" },
  { id: "e4", time: "10:44", label: "Pasted text", icon: ClipboardPaste, tone: "bg-amber-400/15 text-amber-300" },
];

export function HomeProctoring() {
  return (
    <Reveal>
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0a1030] via-[#14194a] to-[#2b1463] p-8 text-white shadow-[0_50px_120px_-40px_rgba(88,60,200,0.7)] md:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_90%_at_80%_0%,#000,transparent_75%)]"
        />
        <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-fuchsia-500/25 blur-[110px]" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-24 -z-10 size-96 rounded-full bg-blue-500/25 blur-[110px]" />

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Proctoring
            </span>

            <h2 className="text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
              See what happened during <span className="text-gradient-brand">every attempt</span>
            </h2>

            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Evalora records proctoring signals while a candidate works and keeps them in a timeline. Your reviewers
              read it after the attempt, next to the score.
            </p>

            <ul className="flex flex-col gap-3">
              {SIGNALS.map((signal) => (
                <li key={signal} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl md:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Attempt timeline</p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">Sample</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.07] p-4">
                <p className="stat-number text-3xl font-bold">2</p>
                <p className="mt-1 text-xs text-white/60">Tab switches</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-4">
                <p className="stat-number text-3xl font-bold">1</p>
                <p className="mt-1 text-xs text-white/60">Full-screen exits</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {EVENTS.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.05] px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.09]"
                >
                  <span className={`grid size-8 place-items-center rounded-lg ${event.tone}`}>
                    <event.icon className="size-4" />
                  </span>
                  <span className="flex-1 font-medium">{event.label}</span>
                  <span className="stat-number text-xs text-white/60">{event.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}