import type { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus, ShoppingCart } from "lucide-react";
import styles from "./PillButton.module.css";

export type PillVariant = "primary" | "gold" | "outline" | "quiet";
export type PillIcon = "arrow" | "cart" | "check" | "plus" | "none";
export type PillButtonProps = {
  variant?: PillVariant;
  icon?: PillIcon;
  size?: "md" | "lg";
  href?: string;
  fullWidth?: boolean;
  busy?: boolean;
  disabled?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const coinIcons = { arrow: ArrowRight, cart: ShoppingCart, check: Check, plus: Plus } as const;

/**
 * The storefront's one action shape: a pill with a gold coin at its end.
 * Coin-at-the-end composition adapted from 21st.dev Arrow Fill Button (#26022);
 * hover and press are CSS only.
 */
export function PillButton({
  variant = "primary", icon = "arrow", size = "lg", href, fullWidth = false, busy = false, disabled = false,
  className, children, ...rest
}: PillButtonProps): JSX.Element {
  const CoinIcon = variant === "quiet" || disabled || icon === "none" ? null : coinIcons[icon];
  const shared = {
    "data-pill": "",
    "data-variant": variant,
    "data-size": size,
    "data-full": fullWidth ? "" : undefined,
    className: [styles.pill, className].filter(Boolean).join(" "),
  };
  const content = <>
    <span data-pill-label="" className={styles.label}>{children}</span>
    {CoinIcon && <span data-coin="" aria-hidden="true" className={styles.coin}>
      {busy ? <span className={styles.wait} /> : <CoinIcon strokeWidth={1.8} />}
    </span>}
  </>;
  if (href !== undefined) {
    // Only anchor-safe attributes arrive here in practice: aria-*, data-*, id, onClick.
    const anchor = rest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>;
    return <Link prefetch={false} href={href} {...anchor} {...shared}>{content}</Link>;
  }
  return <button type="button" {...rest} {...shared} disabled={disabled || busy} aria-busy={busy || undefined}>{content}</button>;
}
