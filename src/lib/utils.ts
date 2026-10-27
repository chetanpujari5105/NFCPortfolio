/**
 * Joins class names, skipping falsy ones. No Tailwind conflict merging: callers keep their classes
 * conflict-free. Components that let callers override their own classes use `cnMerge` instead.
 */
export function cn(...inputs: (string | false | null | undefined)[]) {
  let out = "";
  for (const c of inputs) if (c) out = out ? `${out} ${c}` : c;
  return out;
}
