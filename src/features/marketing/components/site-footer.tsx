import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Templates", href: "/templates" },
    { label: "AI Generator", href: "/ai-generator" },
    { label: "GIF Generator", href: "/gif-generator" },
    { label: "Explore", href: "/explore" },
  ],
  Company: [
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 space-y-2 md:col-span-1">
            <span className="font-heading text-lg font-semibold tracking-tight">MemeForge</span>
            <p className="text-muted-foreground text-sm">
              Create, remix, and share memes with an AI-powered editor.
            </p>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="space-y-3">
              <p className="text-sm font-medium">{heading}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-border/60 text-muted-foreground mt-10 border-t pt-6 text-sm">
          © {new Date().getFullYear()} MemeForge. Open source under the MIT license.
        </div>
      </div>
    </footer>
  );
}
