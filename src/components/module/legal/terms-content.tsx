import { LEGAL } from "@/constants/legal";
import { LegalLink, LegalList, LegalP, type LegalSectionData } from "./LegalDocument";

const P = LEGAL.productName;

export const termsSections: LegalSectionData[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <>
        <LegalP>
          These Terms of Service (&quot;Terms&quot;) apply to your use of {P}, a platform where
          companies create coding assessments, invite candidates to take them, and review the
          results. By creating an account or using {P}, you agree to these Terms and to our{" "}
          <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>. If you do not agree, please
          do not use the service.
        </LegalP>
        {LEGAL.operatorName ? (
          <LegalP>
            {P} is operated by {LEGAL.operatorName}. &quot;We&quot;, &quot;us&quot; and
            &quot;our&quot; refer to the operator of {P}.
          </LegalP>
        ) : (
          <LegalP>&quot;We&quot;, &quot;us&quot; and &quot;our&quot; refer to the operator of {P}.</LegalP>
        )}
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <LegalList>
        <li>You must be at least 18 years old, or the age of majority where you live.</li>
        <li>Provide accurate information and keep it up to date.</li>
        <li>
          You are responsible for keeping your password safe and for everything that happens under
          your account. Tell us promptly if you think someone else has access.
        </li>
        <li>
          New accounts start as candidate accounts. Registering a company makes the account a
          recruiter account. We may review and verify company registrations, and unverified
          companies may not appear in public listings.
        </li>
        <li>Each person should have one account. Accounts cannot be shared or sold.</li>
      </LegalList>
    ),
  },
  {
    id: "recruiters",
    title: "If you are a recruiter or company",
    body: (
      <LegalList>
        <li>
          You are responsible for the assessments, problems and instructions you create and for the
          candidates you invite.
        </li>
        <li>
          Only invite people you have a legitimate reason to assess. Do not use invitations to send
          unsolicited messages.
        </li>
        <li>
          Use candidate information (profiles, contact details, résumés, answers, scores and
          proctoring signals) only to evaluate candidates for your own hiring. Keep it
          confidential, and do not sell it or reuse it for unrelated purposes.
        </li>
        <li>
          Proctoring signals are indicators, not proof of misconduct. Review the full context
          before making any decision about a candidate.
        </li>
        <li>
          You are responsible for following the hiring, employment, anti-discrimination and
          data-protection laws that apply to you.
        </li>
      </LegalList>
    ),
  },
  {
    id: "candidates",
    title: "If you are a candidate",
    body: (
      <LegalList>
        <li>Take assessments honestly and on your own, unless the assessment says otherwise.</li>
        <li>Do not share, copy or publish assessment questions.</li>
        <li>
          Do not use another person&apos;s help or unauthorized tools, and do not try to bypass the
          timer or the proctoring.
        </li>
        <li>
          Assessments are timed. When time runs out, your attempt is submitted automatically.
        </li>
        <li>
          Some activity during an assessment is monitored. See the{" "}
          <LegalLink href="/legal/privacy">Privacy Policy</LegalLink> for what is recorded.
        </li>
        <li>
          Multiple-choice answers are scored automatically. Coding and written answers are
          reviewed by people at the company. The company decides how to use your results, and{" "}
          {P} does not make hiring decisions. Whether and when you can see your result is set by
          the company.
        </li>
      </LegalList>
    ),
  },
  {
    id: "plans",
    title: "Plans, payments and limits",
    body: (
      <>
        <LegalP>
          {P} has a Free plan with usage limits and paid plans (Pro and Enterprise) with higher
          limits. The limits for each plan are shown on the{" "}
          <LegalLink href="/pricing">Pricing page</LegalLink>.
        </LegalP>
        <LegalList>
          <li>
            Paid plans are bought through Stripe Checkout as a one-time payment and give your
            company the plan&apos;s limits for 30 days. They do not renew automatically.
          </li>
          <li>
            When the 30 days end, your company returns to the Free plan unless you pay again.
            Existing assessments and results stay available, but you cannot create new assessments
            or send new invitations beyond the Free limits.
          </li>
          <li>
            We may change prices or limits for future purchases. A change does not affect a period
            you have already paid for.
          </li>
          <li>
            If you believe you were charged in error, contact us through the{" "}
            <LegalLink href={LEGAL.contactPath}>contact page</LegalLink> and we will review it.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <LegalP>You agree not to:</LegalP>
        <LegalList>
          <li>break the law or infringe anyone&apos;s rights;</li>
          <li>impersonate another person or misrepresent who you are;</li>
          <li>upload malicious files or unlawful content;</li>
          <li>probe, scan, overload or bypass the security or rate limits of the service;</li>
          <li>scrape or bulk-collect candidate data or other content;</li>
          <li>interfere with other users&apos; use of the service;</li>
          <li>misuse invitations or the contact form to send spam.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "content",
    title: "Your content and our platform",
    body: (
      <>
        <LegalP>
          You keep ownership of the content you submit, such as assessments, problems, answers,
          profile details and files. You give us permission to store, process and display it as
          needed to run {P}. For example, we show a candidate&apos;s answers to the company that
          invited them.
        </LegalP>
        <LegalP>
          We and our licensors own the platform, its software and design, and the {P} name and
          site content. These Terms do not give you any right to them beyond using the service.
        </LegalP>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <LegalP>
        {P} relies on other services, including Stripe for payments, Cloudinary for file storage,
        email delivery providers, and Google or GitHub if you choose to sign in with them. Your use
        of those services may also be subject to their own terms, and we are not responsible for
        them.
      </LegalP>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    body: (
      <LegalP>
        We work to keep {P} available, but we do not promise that it will be uninterrupted or free
        of errors. We may change, add or remove features, and we may change plan limits as
        described above.
      </LegalP>
    ),
  },
  {
    id: "termination",
    title: "Suspension and ending your account",
    body: (
      <>
        <LegalP>
          You can stop using {P} at any time. Candidates can delete their account from account
          settings. For a company account, contact us through the{" "}
          <LegalLink href={LEGAL.contactPath}>contact page</LegalLink>. Deleted accounts are
          deactivated, and some records (such as payment records, security logs and results
          already shared with a company) may be kept as described in the{" "}
          <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>.
        </LegalP>
        <LegalP>
          We may suspend or end access if you break these Terms, put others at risk, or misuse the
          service. A suspended account cannot sign in until it is reinstated.
        </LegalP>
      </>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and liability",
    body: (
      <>
        <LegalP>
          {P} is provided &quot;as is&quot; and &quot;as available&quot;. It provides tools for
          running assessments and does not guarantee the accuracy of any score or proctoring
          signal, or any hiring outcome.
        </LegalP>
        <LegalP>
          To the maximum extent permitted by law, we are not liable for indirect or consequential
          losses, and our total liability for any claim is limited to the amount you paid us for
          the service in the 12 months before the claim. Nothing in these Terms limits liability
          that cannot be limited by law.
        </LegalP>
      </>
    ),
  },
  ...(LEGAL.governingLaw
    ? [
        {
          id: "governing-law",
          title: "Governing law",
          body: <LegalP>These Terms are governed by {LEGAL.governingLaw}.</LegalP>,
        } satisfies LegalSectionData,
      ]
    : []),
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <LegalP>
        We may update these Terms. When we do, we will change the &quot;last updated&quot; date
        above and, for significant changes, try to let you know in the app or by email. If you keep
        using {P} after changes take effect, you accept the updated Terms.
      </LegalP>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <LegalP>
        Questions about these Terms? Reach us through the{" "}
        <LegalLink href={LEGAL.contactPath}>contact page</LegalLink>.
      </LegalP>
    ),
  },
];