import { ThemeToggle } from "@/components/ui/theme-toggle";

// Phase 1 placeholder: the studio, phone and OS arrive in phases 3–4.
export default function Home() {
  return (
    <main className="relative grid min-h-dvh place-items-center bg-studio-bg px-6 text-studio-ink">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="flex flex-col items-start gap-6">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.88] font-extrabold tracking-[-0.02em] [font-stretch:125%]">
          Chetan
          <br />
          Pujari<span className="text-finish">⚡</span>
        </h1>
        <p className="text-lg text-studio-muted">AI Educator · 400K+ students</p>
        <div className="flex gap-3">
          {(["Studio", "App", "Finish"] as const).map((label, i) => (
            <span
              key={label}
              className={
                i === 0
                  ? "rounded-full border border-studio-line px-3 py-1 text-sm"
                  : i === 1
                    ? "rounded-full bg-app-surface px-3 py-1 text-sm text-app-ink"
                    : "rounded-full bg-finish px-3 py-1 text-sm text-finish-ink"
              }
            >
              {label} token
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
