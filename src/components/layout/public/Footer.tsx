import Logo from "@/assets/svg/logo";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const productLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const companyLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "RSS feed", href: "/blog/rss.xml" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: FaGithub },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedin },
  { label: "Twitter / X", href: "https://twitter.com", icon: FaTwitter },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-sm font-semibold tracking-tight text-foreground">Evalora</span>
            </Link>

            <p className="max-w-xs text-sm text-muted-foreground">
              Hire developers based on what they can actually build — coding assessments with proctoring, built for engineering teams.
            </p>

            <div className="mt-2 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} Evalora. All rights reserved.</p>
          <p>Built for teams who hire engineers.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>

      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="interactive text-sm text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
