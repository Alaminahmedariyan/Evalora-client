const FAQ = [
  {
    question: "Does my plan renew automatically?",
    answer:
      "No. A paid plan is a one-time payment that gives you 30 days. When the 30 days end your company returns to the Free plan, and you can pay again whenever you want to continue.",
  },
  {
    question: "What counts toward the assessment limit?",
    answer:
      "Every assessment you have created that is not deleted or archived. New versions of the same assessment count only once.",
  },
  {
    question: "How are invitations counted?",
    answer:
      "Invitations sent in the last 30 days count toward your limit. Re-inviting an email that was already invited to the same assessment does not use another invitation.",
  },
  {
    question: "What happens to my data when a plan ends?",
    answer:
      "Your assessments, results and candidate data stay available. On the Free plan you simply cannot create new assessments or send new invitations beyond the Free limits.",
  },
  {
    question: "Can I switch plans?",
    answer:
      "You can upgrade from the Subscription page in your dashboard, and switch back to Free at any time. Switching to Free takes effect immediately.",
  },
  {
    question: "How do I pay?",
    answer: "Checkout is handled by Stripe, and you can pay with a card.",
  },
];

export function PricingFaq() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Frequently asked questions</h2>

      <div className="card-evalora divide-y divide-border">
        {FAQ.map((item) => (
          <details key={item.question} className="group p-5">
            <summary className="interactive flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}