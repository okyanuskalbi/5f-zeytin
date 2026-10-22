// Shared interactions and the v4 hero's single photographic movement.
export const motionTokens = {
  distance: { xs: 4, shelf: 12, lg: 24 }, duration: { fast: 0.15, crossfade: 0.2, landing: 0.35, tag: 0.6 },
  stagger: { shelf: 0.07 }, scale: { press: 0.98 },
  hero: { duration: 18, hintDuration: 1.8, kenBurns: ["scale(1.02) translateY(0%)", "scale(1.10) translateY(-2%)"] },
  products: { distance: 26, duration: 0.8, stagger: 0.08, ease: [0.2, 0.8, 0.2, 1] },
  story: { opacity: 0.9, transform: 1.6, inactiveScale: 1.06, step: 0.5 },
  band: { parallax: 60, distance: 26, duration: 0.8, stagger: 0.08 },
} as const;
export const springs = {
  badge: { type: "spring", visualDuration: 0.35, bounce: 0.2 },
  drawer: { type: "spring", visualDuration: 0.35, bounce: 0 },
  shelf: { type: "spring", visualDuration: 0.35, bounce: 0.12 },
} as const;
