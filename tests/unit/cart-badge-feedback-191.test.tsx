import { createElement, type ComponentProps } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CartCountBadge } from "@/components/site/Navbar";
import { motionTokens, springs } from "@/lib/ui-motion";

const state = vi.hoisted(() => ({ reduced: false, start: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => state.reduced }));
vi.mock("motion/react", () => ({
  useAnimationControls: () => ({ start: state.start, set: state.set }),
  m: { span: (props: ComponentProps<"span"> & { initial?: unknown; animate?: unknown }) => { const html = { ...props }; delete html.initial; delete html.animate; return createElement("span", html); } },
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); state.reduced = false; });

it("acknowledges only additions after hydration, without animating a stored quantity or removals", () => {
  const { rerender, container } = render(<CartCountBadge count={3} hydrated={false} />);
  rerender(<CartCountBadge count={3} hydrated />);
  expect(state.start).not.toHaveBeenCalled();
  rerender(<CartCountBadge count={4} hydrated />);
  expect(state.start).toHaveBeenCalledExactlyOnceWith({ scale: [1, motionTokens.storefront.badgeScale, 1], transition: { type: "tween", duration: springs.badge.visualDuration, ease: motionTokens.storefront.ease } });
  rerender(<CartCountBadge count={2} hydrated />);
  expect(state.start).toHaveBeenCalledTimes(1);
  rerender(<CartCountBadge count={105} hydrated />);
  expect(container.textContent).toBe("99+");
  expect(container.querySelector('[data-slot="count-badge"]')?.getAttribute("aria-hidden")).toBe("true");
});

it("keeps reduced motion final and shows no badge for an empty cart", () => {
  state.reduced = true;
  const { rerender, container } = render(<CartCountBadge count={0} hydrated />);
  expect(container.firstElementChild).toBeNull();
  rerender(<CartCountBadge count={1} hydrated />);
  expect(state.start).not.toHaveBeenCalled();
  expect(state.set).toHaveBeenCalledWith({ scale: 1 });
  expect(container.querySelector("span")?.getAttribute("style")).toBe("transform: none;");
});
