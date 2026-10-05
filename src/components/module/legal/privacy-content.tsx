import { LEGAL } from "@/constants/legal";
import { LegalLink, LegalList, LegalP, type LegalSectionData } from "./LegalDocument";

const P = LEGAL.productName;

export const privacySections: LegalSectionData[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <LegalP>
          This Privacy Policy explains what personal information {P} collects, how it is used and who can see it. It applies to everyone who
          uses {P}: candidates, recruiters, company owners and visitors.
        </LegalP>
        <LegalP>
          We do not sell your personal information. Please read it together with our{" "}
          <LegalLink href="/legal/terms">Terms of Service</LegalLink>.
        </LegalP>
      </>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <LegalList>
        <li>
          <strong>Account information:</strong> your name, email address and password (stored in hashed form), your role, and optionally
          your phone number and profile picture. If you sign in with Google or GitHub, we receive basic profile information from that
          provider, such as your name, email address and profile picture.
        </li>
        <li>
          <strong>Candidate profile (optional):</strong> headline, bio, phone, location, résumé file, LinkedIn, GitHub and portfolio links,
          skills and years of experience.
        </li>
        <li>
          <strong>Company information:</strong> company name, description, website, industry and logo.
        </li>
        <li>
          <strong>Assessment activity:</strong> invitations (email address and status), when attempts start and end, your answers (selected
          options, code and written text), scores, reviewer feedback and rankings.
        </li>
        <li>
          <strong>Proctoring signals:</strong> during an assessment we record when you switch tabs or leave the window, return to it, leave
          full screen, or copy or paste, each with a time, and we keep a count of tab switches. We do not record your camera, microphone or
          screen, and we do not record what you copy or paste.
        </li>
        <li>
          <strong>Payments:</strong> the plan, amount, currency, status and payment-provider references. You enter card details on
          Stripe&apos;s page; we do not receive or store your full card number.
        </li>
        <li>
          <strong>Messages:</strong> what you send through the contact form (name, email, subject and message).
        </li>
        <li>
          <strong>Technical and security data:</strong> sign-in sessions with IP address and browser or device details, security and audit
          logs, temporary counters for failed sign-in attempts, and temporary rate-limit counters based on IP address.
        </li>
        <li>
          <strong>Notifications and consent choices:</strong> in-app notifications we send you, the date you accepted our Terms of Service
          and Privacy Policy when you created your account, and the consent choices you record.
        </li>
      </LegalList>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    body: (
      <LegalList>
        <li>to create and secure your account and sign you in;</li>
        <li>to run assessments, score answers and show results to the right people;</li>
        <li>to record proctoring signals so a company can review an attempt afterwards;</li>
        <li>to process payments and manage plans;</li>
        <li>to send service emails, such as verification codes, assessment invitations, welcome and payment notices;</li>
        <li>to answer your messages and provide support;</li>
        <li>to prevent abuse, fraud and security incidents, and to enforce our Terms;</li>
        <li>to meet our legal obligations.</li>
      </LegalList>
    ),
  },
  {
    id: "sharing",
    title: "Who can see your information",
    body: (
      <LegalList>
        <li>
          <strong>Companies that invite you:</strong> the company sees your invitation, your answers, scores, reviewer feedback, rankings
          and proctoring signals for that assessment.
        </li>
        <li>
          <strong>Registered recruiters:</strong> if you create a candidate profile, recruiters registered on {P} can browse it, including
          your name, email address, picture, headline, bio, location, phone number, links, skills, experience and résumé. Only add details
          you are comfortable sharing in this way; every profile field except your name and email is optional.
        </li>
        <li>
          <strong>Our team:</strong> administrators can access account, payment and audit information when needed to run, support and secure
          the service.
        </li>
        <li>
          <strong>Other candidates:</strong> cannot see your information. Blog articles show only the author&apos;s name and picture.
        </li>
      </LegalList>
    ),
  },
  {
    id: "providers",
    title: "Service providers",
    body: (
      <>
        <LegalP>
          We use other companies to run {P}. They only receive the data they need to provide their service:
        </LegalP>
        <LegalList>
          <li>Stripe, to process payments;</li>
          <li>Cloudinary, to store profile pictures, company logos, résumés and blog images;</li>
          <li>Resend and other email providers, to deliver emails;</li>
          <li>Google and GitHub, if you choose to sign in with them;</li>
          <li>hosting, database and caching providers, to run the service.</li>
        </LegalList>
        <LegalP>
          Companies that receive your assessment data from {P} are responsible for how they use it. We may also disclose information if the
          law requires it.
        </LegalP>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: (
      <LegalP>
        {P} uses a session cookie and browser storage to keep you signed in and to keep your session secure. We do not use them for
        advertising. You can clear them in your browser, but you will be signed out.
      </LegalP>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <>
        <LegalP>
          We keep your information while your account is active and as long as needed for the purposes in this policy. When an account is
          deleted it is deactivated and removed from normal use.
        </LegalP>
        <LegalP>
          Some records may be kept after that, such as payment records, security and audit logs, and results already shared with a company,
          because we need them for legal, accounting or security reasons. A company that received your results may keep them under its own
          policies.
        </LegalP>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <LegalP>
        We protect your information with measures such as encrypted connections (HTTPS) in production, hashed passwords, role-based access,
        sign-in attempt limits and rate limiting. No system is perfectly secure, so we cannot guarantee absolute security.
      </LegalP>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    body: (
      <>
        <LegalList>
          <li>You can view and edit your account and profile information in the app.</li>
          <li>
            You can review and change the optional consents (marketing, analytics and third-party
            data sharing) in your account settings. We will not use your information for a
            purpose covered by an optional consent unless you have granted it.
          </li>
          <li>
            You can download a copy of your data and delete your account from your account
            settings. For other requests, such as correcting data or restricting or objecting to a
            use, reach us through the{" "}
            <LegalLink href={LEGAL.contactPath}>contact page</LegalLink> and say it is a privacy
            request.
          </li>
        </LegalList>
        <LegalP>
          Depending on where you live, you may have additional rights under local law. We may need to verify your identity before acting on
          a request. To ask a company about data it received through an assessment, contact that company directly.
        </LegalP>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <LegalP>
        {P} is for people who are 18 or older (or the age of majority where they live). It is not directed to children. If we learn that we
        collected information from a child, we will delete it.
      </LegalP>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <LegalP>
        Our service providers may process information in countries other than yours. Where data is transferred, we rely on the safeguards
        our providers offer. Contact us if you want to know more.
      </LegalP>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <LegalP>
        We may update this policy. We will change the &quot;last updated&quot; date above and, for significant changes, try to let you know
        in the app or by email.
      </LegalP>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <LegalP>
        For privacy questions or requests, reach us through the{" "}
        <LegalLink href={LEGAL.contactPath}>contact page</LegalLink>.
      </LegalP>
    ),
  },
];