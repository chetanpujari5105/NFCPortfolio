"use client";

import { Children, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

import { onRadioGroupKeyDown } from "@/lib/a11y";
import { springs } from "@/lib/motion";
import { goBack } from "@/lib/router";
import { cn } from "@/lib/utils";

/** Scroll container for an app: scroll stays inside the phone. */
export function AppScreen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-4 pt-[max(env(safe-area-inset-top),12px)] pb-16 tab:pt-[7cqh] tab:[mask-image:linear-gradient(to_bottom,transparent_4.6cqh,black_6.8cqh)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BackButton({ label = "Back", onClick = goBack }: { label?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-[34px] place-items-center rounded-full bg-app-group text-app-ink shadow-[0_0_0_0.5px_var(--app-divider)] transition-transform duration-150 ease-out active:scale-[0.92]"
    >
      <ChevronLeft className="size-5" strokeWidth={2.4} aria-hidden />
    </button>
  );
}

export function AppHeader({
  title,
  subtitle,
  action,
  backLabel = "Back to Home",
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  backLabel?: string;
}) {
  return (
    <header className="mb-5">
      <div className="flex h-[38px] items-center justify-between">
        <BackButton label={backLabel} />
        {action}
      </div>
      <h1 className="mt-2.5 text-[34px] leading-[1.08] font-bold tracking-[-0.02em]">{title}</h1>
      {subtitle && <p className="mt-1 text-[14px] leading-snug text-app-muted">{subtitle}</p>}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-6 mb-2 px-4 text-[13px] font-medium tracking-wide text-app-muted uppercase first:mt-0">
      {children}
    </h2>
  );
}

/** Grouped list card with inset hairline dividers. */
export function ListGroup({
  header,
  footer,
  children,
  className,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const rows = Children.toArray(children);
  return (
    <section className={cn("mb-6", className)}>
      {header && <SectionTitle>{header}</SectionTitle>}
      <div className="overflow-hidden rounded-[14px] bg-app-group">
        {rows.map((row, i) => (
          <div key={i} className="relative">
            {row}
            {i < rows.length - 1 && (
              <span aria-hidden className="absolute right-0 bottom-0 left-4 h-[0.5px] bg-app-divider" />
            )}
          </div>
        ))}
      </div>
      {footer && <p className="mt-2 px-4 text-[12.5px] leading-snug text-app-muted">{footer}</p>}
    </section>
  );
}

type RowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  chevron?: boolean;
  className?: string;
};

export function ListRow({ title, subtitle, leading, trailing, onClick, href, chevron, className }: RowProps) {
  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] leading-snug font-medium">{title}</span>
        {subtitle && <span className="mt-0.5 block text-[13px] leading-snug text-app-muted">{subtitle}</span>}
      </span>
      {trailing}
      {chevron && <ChevronRight className="size-4 shrink-0 text-app-muted" aria-hidden />}
      {href && !chevron && !trailing && <ExternalLink className="size-3.5 shrink-0 text-app-muted" aria-hidden />}
    </>
  );
  const classes = cn(
    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
    (onClick || href) && "active:bg-app-divider/40",
    className,
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {body}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  return <div className={classes}>{body}</div>;
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const classes = cn(
    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 ease-out",
    active ? "bg-app-ink text-app-background" : "bg-app-group text-app-secondary",
    onClick && "active:scale-[0.95]",
    className,
  );
  return onClick ? (
    <button type="button" aria-pressed={active} onClick={onClick} className={classes}>
      {children}
    </button>
  ) : (
    <span className={classes}>{children}</span>
  );
}

export function Pill({
  children,
  href,
  onClick,
  className,
  label,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full bg-finish px-4 py-1.5 text-[13.5px] font-bold text-finish-ink transition-transform duration-150 ease-out active:scale-[0.95]",
    className,
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={classes}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={classes}>
      {children}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-available" : "bg-app-divider",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.2)] transition-transform duration-200 ease-[var(--ease-out-strong)]",
          checked && "translate-x-[20px]",
        )}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onRadioGroupKeyDown} className="flex rounded-[10px] bg-app-divider/50 p-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-[8px] px-2 py-1.5 text-[13px] font-semibold transition-colors duration-150",
            value === o.value ? "bg-app-group text-app-ink shadow-sm" : "text-app-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Remembers the last non-null value, so a closing detail view keeps its content while it slides out. */
export function useLastValue<T>(value: T | null): T | null {
  const [last, setLast] = useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}

/** Detail view that slides in from the right over its app. */
export function PushView({ open, children, label }: { open: boolean; children: ReactNode; label: string }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="push"
          role="region"
          aria-label={label}
          initial={{ transform: "translateX(100%)" }}
          animate={{ transform: "translateX(0%)", transition: springs.smooth }}
          exit={{ transform: "translateX(100%)", transition: springs.smooth }}
          className="absolute inset-0 z-10 bg-app-background shadow-[-12px_0_32px_rgb(0_0_0/0.12)]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="text-[13px] tracking-[2px] text-finish">
      {"★".repeat(rating)}
      <span className="text-app-divider">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/** Bottom sheet over its app; the backdrop (and Esc, via the router) closes it. */
export function Sheet({ open, children, label }: { open: boolean; children: ReactNode; label: string }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div key="sheet" className="absolute inset-0 z-10" role="region" aria-label={label}>
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={() => goBack()}
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
          />
          <motion.div
            className="no-scrollbar absolute inset-x-0 bottom-0 max-h-[78%] overflow-y-auto overscroll-contain rounded-t-[26px] bg-app-background px-4 pt-2 pb-[max(env(safe-area-inset-bottom),28px)] shadow-[0_-10px_40px_rgb(0_0_0/0.18)]"
            initial={{ transform: "translateY(100%)" }}
            animate={{ transform: "translateY(0%)", transition: springs.smooth }}
            exit={{ transform: "translateY(100%)", transition: springs.smooth }}
          >
            <span aria-hidden className="mx-auto mb-3 block h-[5px] w-10 rounded-full bg-app-divider" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
