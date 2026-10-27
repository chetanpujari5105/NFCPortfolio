"use client";

import { FINISHES, applyFinish, type Finish } from "@/lib/theme";
import { useOS } from "@/lib/store";
import { cn } from "@/lib/utils";

export const FINISH_INFO: Record<Finish, { label: string; color: string; deep: string }> = {
  electric: { label: "Electric", color: "#ffb800", deep: "#c98a00" },
  graphite: { label: "Graphite", color: "#8a8f98", deep: "#4a4e55" },
  chai: { label: "Chai", color: "#b9783f", deep: "#7a4a22" },
};

export function useSetFinish() {
  const setFinish = useOS((s) => s.setFinish);
  return (finish: Finish) => {
    applyFinish(finish);
    setFinish(finish);
  };
}

export function FinishSwatches({ className }: { className?: string }) {
  const finish = useOS((s) => s.finish);
  const set = useSetFinish();
  return (
    <div role="radiogroup" aria-label="Phone finish" className={cn("flex items-center gap-3", className)}>
      {FINISHES.map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={finish === f}
          aria-label={FINISH_INFO[f].label}
          title={FINISH_INFO[f].label}
          onClick={() => set(f)}
          className={cn(
            "size-7 rounded-full transition-[transform,box-shadow] duration-150 ease-out active:scale-90",
            finish === f
              ? "shadow-[0_0_0_2px_var(--studio-bg),0_0_0_3.5px_var(--studio-ink)]"
              : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]",
          )}
          style={{ background: `linear-gradient(150deg, ${FINISH_INFO[f].color}, ${FINISH_INFO[f].deep})` }}
        />
      ))}
    </div>
  );
}
