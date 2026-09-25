import confetti from "canvas-confetti";

// Fired on genuine milestones only (all test cases passed, assessment
// completed, email verified) — not on every minor success, or it stops
// feeling special.
export function celebrate() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#4338ca", "#0d9488", "#16a34a"], // primary, brand-accent, success
  });
}