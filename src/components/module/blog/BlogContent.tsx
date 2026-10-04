import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const heading2 = "mt-10 mb-4 text-2xl font-semibold tracking-tight first:mt-0";

const components: Components = {
  h1: ({ children }) => <h2 className={heading2}>{children}</h2>,
  h2: ({ children }) => <h2 className={heading2}>{children}</h2>,
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="my-4 text-base leading-7 text-foreground/90">{children}</p>,
  a: ({ href, children }) => {
    const className = "font-medium text-primary underline underline-offset-4 hover:opacity-80";

    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    const external = href ? /^https?:\/\//.test(href) : false;

    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-1.5 pl-6 text-foreground/90">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-1.5 pl-6 text-foreground/90">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => (
    <code className={cn("font-mono text-[0.9em]", !className && "rounded bg-muted px-1.5 py-0.5", className)}>
      {children}
    </code>
  ),
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className="my-6 h-auto max-w-full rounded-lg border border-border"
      />
    ) : null,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border px-3 py-2">{children}</td>,
};

export function BlogContent({ markdown }: { markdown: string }) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}