// Shared interaction values for the v2 shell. No layout or looping animation.
export const motionTokens = { distance: { xs: 4, lg: 24 }, duration: { fast: 0.15 }, scale: { press: 0.98 } } as const;
export const springs = {
  badge: { type: "spring", visualDuration: 0.35, bounce: 0.2 },
  drawer: { type: "spring", visualDuration: 0.35, bounce: 0 },
} as const;
