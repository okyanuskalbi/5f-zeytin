"use client";

import { useCallback, useRef, useSyncExternalStore, type JSX } from "react";
import styles from "./Faq.module.css";

const serverExpanded = () => undefined;

export function FaqDisclosure({ id, question, answer }: { id: string; question: string; answer: string }): JSX.Element {
  const ref = useRef<HTMLDetailsElement>(null);
  const subscribe = useCallback((notify: () => void) => {
    const details = ref.current;
    details?.addEventListener("toggle", notify);
    return () => details?.removeEventListener("toggle", notify);
  }, []);
  // Native details owns its state, including toggles before hydration.
  // Without JS, summary retains native semantics with no stale ARIA override.
  const expanded = useSyncExternalStore(subscribe, () => ref.current?.open ?? false, serverExpanded);

  return (
    <details ref={ref} data-faq={id} className={styles.answer}>
      <summary id={`faq-${id}`} aria-expanded={expanded} aria-controls={`faq-${id}-answer`} className={styles.question}>
        {question}<span aria-hidden="true" className={styles.indicator} />
      </summary>
      <p id={`faq-${id}-answer`} data-faq-answer="">{answer}</p>
    </details>
  );
}
