// Shared interaction and storefront entrance values; legacy scene tokens remain for archived components.
import type { CSSProperties } from "react";
export const motionTokens = {
  distance: { xs: 4, shelf: 12, lg: 24 }, duration: { fast: 0.15, crossfade: 0.2, landing: 0.35, tag: 0.6 },
  stagger: { shelf: 0.07 }, scale: { press: 0.98 },
  interaction: { hoverY: -2, tapScale: 0.98 },
  entrance: { distance: 8, opacity: 0.96, stagger: 0.08 },
  storefront: {
    cardLift: -4, cardScale: 1.03, groupScale: 1.05, groupArrowX: 4, arrowX: 3,
    hoverDuration: 0.2, settleDuration: 0.3, enterDuration: 0.35, addedScale: 0.96, badgeScale: 1.2,
    hero: { distance: 10, stagger: 0.12, photoScale: 1.04, photoDuration: 1.2, fromOpacity: 0.5 },
    category: { duration: 0.25, distance: 8, stagger: 0.04 },
    faq: { duration: 0.25 },
    ease: [0.23, 1, 0.32, 1],
  },
  hero: {
    plateY: 6, plateScale: 1.05, productsY: 14,
    branchY: -22, branchX: 3, branchScale: 1.12,
    copyY: -6, copyOpacity: 0.2, copyFadeStart: 0.5,
    mobileFactor: 0.5, revealDuration: 0.3,
  },
  products: { distance: 26, duration: 0.8, stagger: 0.08, ease: [0.2, 0.8, 0.2, 1] },
  story: { distance: 24, duration: 0.65, stagger: 0.08, parallax: 12 },
  band: { parallax: 60, distance: 26, duration: 0.8, stagger: 0.08 },
} as const;
export const springs = {
  action: { type: "spring", stiffness: 280, damping: 26 },
  editorial: { type: "spring", stiffness: 160, damping: 26 },
  badge: { type: "spring", visualDuration: 0.35, bounce: 0.2 },
  drawer: { type: "spring", visualDuration: 0.35, bounce: 0 },
  shelf: { type: "spring", visualDuration: 0.35, bounce: 0.12 },
} as const;

/** CSS and Motion consume the same values; this adds no wrapper or layout geometry. */
export const storefrontMotionStyles: CSSProperties & Record<`--motion-${string}`, string | number> = {
  "--motion-fast": `${motionTokens.duration.fast}s`,
  "--motion-feedback": `${motionTokens.storefront.hoverDuration}s`,
  "--motion-move": `${motionTokens.storefront.settleDuration}s`,
  "--motion-faq": `${motionTokens.storefront.faq.duration}s`,
  "--motion-enter": `${motionTokens.storefront.enterDuration}s`,
  "--motion-tap-scale": motionTokens.interaction.tapScale,
  "--motion-arrow-x": `${motionTokens.storefront.arrowX}px`,
  "--motion-card-y": `${motionTokens.storefront.cardLift}px`,
  "--motion-card-scale": motionTokens.storefront.cardScale,
  "--motion-group-scale": motionTokens.storefront.groupScale,
  "--motion-group-arrow-x": `${motionTokens.storefront.groupArrowX}px`,
  "--motion-hero-distance": `${motionTokens.storefront.hero.distance}px`,
  "--motion-hero-stagger": `${motionTokens.storefront.hero.stagger}s`,
  "--motion-hero-photo-scale": motionTokens.storefront.hero.photoScale,
  "--motion-hero-photo-duration": `${motionTokens.storefront.hero.photoDuration}s`,
  "--motion-hero-opacity": motionTokens.storefront.hero.fromOpacity,
  "--motion-ease": `cubic-bezier(${motionTokens.storefront.ease.join(",")})`,
};
