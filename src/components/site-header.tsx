import { Link } from "@tanstack/react-router";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", hash: "demo", label: "Demo" },
  { to: "/install", label: "Install" },
  { to: "/source", label: "Source" },
] as const;

export function SiteHeader({ current }: { current?: "home" | "install" | "source" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-foreground">
          <Mark className="size-7" />
          <span className="font-display text-xl tracking-tight">SpeakX</span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto sm:justify-center sm:gap-1">
          {LINKS.map((link) => {
            const active =
              (link.to === "/" && current === "home") ||
              (link.to === "/install" && current === "install") ||
              (link.to === "/source" && current === "source");
            return (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-sm transition-colors duration-150 sm:px-3.5",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
            <Link to="/source">View code</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/install">Get extension</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-base text-foreground">SpeakX</p>
        <p>Chrome extension for text-to-speech on X. Unofficial. Not affiliated with X Corp.</p>
      </div>
    </footer>
  );
}
