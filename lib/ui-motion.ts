// Shared interaction values for the v2 shell. No layout or looping animation.
export const motionTokens = { distance: { xs: 4, shelf: 12, lg: 24 }, duration: { fast: 0.15, crossfade: 0.2, landing: 0.35, tag: 0.6 }, stagger: { shelf: 0.07 }, scale: { press: 0.98 } } as const;
export const springs = {
  badge: { type: "spring", visualDuration: 0.35, bounce: 0.2 },
  drawer: { type: "spring", visualDuration: 0.35, bounce: 0 },
  shelf: { type: "spring", visualDuration: 0.35, bounce: 0.12 },
} as const;
