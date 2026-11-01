import { describe, expect, it } from "vitest";
import { galleryFocusProgress, gallerySpotlight } from "@/components/landing/HorizontalProductGallery";

describe("the scroll gallery keeps the selected package in the spotlight", () => {
  it("centres every package reached through keyboard focus, including the first and last", () => {
    const viewport = 1200, card = 520, gap = 64, inset = (viewport - card) / 2;
    const travel = 5 * (card + gap);
    for (let index = 0; index < 6; index++) {
      const left = inset + index * (card + gap);
      const progress = galleryFocusProgress(left, card, viewport, travel);
      const visibleCentre = left + card / 2 - progress * travel;
      expect(visibleCentre).toBe(viewport / 2);
      expect(gallerySpotlight(visibleCentre, viewport)).toBe(1);
    }
  });

  it("reverses the same lighting as a package enters and leaves the viewport", () => {
    expect(gallerySpotlight(600, 1200)).toBe(1);
    expect(gallerySpotlight(300, 1200)).toBe(gallerySpotlight(900, 1200));
    expect(gallerySpotlight(-600, 1200)).toBe(0);
    expect(gallerySpotlight(1800, 1200)).toBe(0);
  });

  it("clamps focus travel and stays usable while the rail has no measured overflow", () => {
    expect(galleryFocusProgress(0, 300, 1200, 2000)).toBe(0);
    expect(galleryFocusProgress(3000, 300, 1200, 2000)).toBe(1);
    expect(galleryFocusProgress(300, 300, 1200, 0)).toBe(0);
    expect(gallerySpotlight(0, 0)).toBe(1);
  });
});
