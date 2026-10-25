// Shared interactions and the hero's scroll-linked photographic planes.
export const motionTokens = {
  distance: { xs: 4, shelf: 12, lg: 24 }, duration: { fast: 0.15, crossfade: 0.2, landing: 0.35, tag: 0.6 },
  stagger: { shelf: 0.07 }, scale: { press: 0.98 },
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
  badge: { type: "spring", visualDuration: 0.35, bounce: 0.2 },
  drawer: { type: "spring", visualDuration: 0.35, bounce: 0 },
  shelf: { type: "spring", visualDuration: 0.35, bounce: 0.12 },
} as const;
