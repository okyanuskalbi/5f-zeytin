import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect, type RefObject } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { domAnimation, LazyMotion, type MotionValue } from "framer-motion";
import { afterEach, expect, it, vi } from "vitest";
import { BusinessJourney } from "@/components/landing/BusinessJourney";
import { ScrollArtwork, ScrollStage } from "@/components/landing/ScrollStage";

const sources = vi.hoisted(() => [] as { target: RefObject<HTMLElement | null>; value: MotionValue<number> }[]);
vi.mock("framer-motion", async importOriginal => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useScroll: ({ target }: { target: RefObject<HTMLElement | null> }) => {
      const value = actual.useMotionValue(0);
      useEffect(() => {
        const source = { target, value };
        sources.push(source);
        return () => { sources.splice(sources.indexOf(source), 1); };
      }, [target, value]);
      return { scrollYProgress: value };
    },
  };
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function policy({ desktop = false, reduced = false, saveData = false, cores = 8 } = {}) {
  const connection = Object.assign(new EventTarget(), { saveData });
  vi.stubGlobal("navigator", { hardwareConcurrency: cores, connection });
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : desktop,
    addEventListener() {}, removeEventListener() {},
  }));
  return { saveData(next: boolean) { act(() => { connection.saveData = next; connection.dispatchEvent(new Event("change")); }); } };
}

function sourceFor(selector: string) {
  const source = sources.find(({ target }) => target.current?.matches(selector));
  expect(source, `a viewport-local scroll source for ${selector}`).toBeDefined();
  return source!.value;
}
function byClass(container: HTMLElement, name: string) { return container.querySelector<HTMLElement>(`[class*="${name}"]`)!; }
async function progress(source: MotionValue<number>, next: number) {
  await act(async () => { source.set(next); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
}

it("moves the phone products through their own viewport in opposite directions without moving the copy or actions", async () => {
  policy();
  const { container } = render(<LazyMotion features={domAnimation}><BusinessJourney /></LazyMotion>);
  const products = sourceFor('[class*="businessProducts"]');
  const tin = byClass(container, "businessTin"), bottle = byClass(container, "businessBottle");
  await progress(products, .1);
  const before = [tin.style.transform, bottle.style.transform];
  await progress(products, .9);
  await waitFor(() => expect(tin.style.transform).not.toBe(before[0]));
  expect(bottle.style.transform).not.toBe(before[1]);
  expect(tin.style.transform).toMatch(/translateY\(-/);
  expect(bottle.style.transform).not.toMatch(/translateY\(-/);
  expect(container.querySelector("[data-business-mode]")?.getAttribute("data-business-mode")).toBe("native");
  for (const element of container.querySelectorAll<HTMLElement>('[class*="chapterCopy"], button, h3')) expect(element.style.transform).toBe("");
  expect(screen.getAllByRole("button", { name: /Teklif hazırlayın/ })).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Talebinizi paylaşın" }).getAttribute("href")).toBe("#teklif");
});

it("preserves the desktop pack journey and disables all decorative transforms if data saving is enabled", async () => {
  const settings = policy({ desktop: true });
  const { container } = render(<LazyMotion features={domAnimation}><BusinessJourney /></LazyMotion>);
  const journey = sourceFor("#toptan-iletisim");
  const tin = byClass(container, "businessTin"), bottle = byClass(container, "businessBottle");
  await progress(journey, 1);
  await waitFor(() => expect(tin.style.transform).toBe("translateX(32px) translateY(-65px) scale(1.06)"));
  expect(bottle.style.transform).toBe("translateY(-32px)");
  settings.saveData(true);
  await waitFor(() => expect(tin.style.transform).toBe("none"));
  expect(bottle.style.transform).toBe("none");
  expect(byClass(container, "chapterNumber").style.transform).toBe("none");
  expect(byClass(container, "chapterLine").style.transform).toBe("none");
  expect(container.querySelector("[data-business-mode]")?.getAttribute("data-business-mode")).toBe("native");
  settings.saveData(false);
  await progress(journey, .5);
  await waitFor(() => expect(tin.style.transform).toBe("translateX(16px)"));
  expect(container.querySelector("[data-business-mode]")?.getAttribute("data-business-mode")).toBe("held");
});

it("gives phone artwork visible bounded travel while leaving form geometry untouched", async () => {
  policy();
  const { container } = render(<LazyMotion features={domAnimation}>
    <ScrollStage id="teklif" device="flow" sourceId={27904}>
      <form><label>Notunuz<textarea /></label><button type="button">Teklif hazırlayın</button></form>
      <ScrollArtwork distance={56} grow={.03}><span>AFİNA zeytinliği</span></ScrollArtwork>
    </ScrollStage>
  </LazyMotion>);
  const artwork = container.querySelector<HTMLElement>("[data-scroll-artwork]")!;
  await progress(sourceFor("[data-scroll-artwork]"), 1);
  await waitFor(() => expect(artwork.style.transform).toContain("translateY(-20px)"));
  const textarea = screen.getByRole("textbox");
  textarea.focus();
  await progress(sourceFor("#teklif"), 1);
  expect(document.activeElement).toBe(textarea);
  for (const element of container.querySelectorAll<HTMLElement>("section,form,textarea,button")) expect(element.style.transform).toBe("");
});

it.each([{ reduced: true }, { saveData: true }, { cores: 2 }])("keeps constrained-device imagery and all business text static: %j", settings => {
  policy(settings);
  const { container } = render(<LazyMotion features={domAnimation}><BusinessJourney /><ScrollArtwork>AFİNA</ScrollArtwork></LazyMotion>);
  expect(byClass(container, "businessTin").style.transform).toBe("none");
  expect(container.querySelector<HTMLElement>("[data-scroll-artwork]")!.style.transform).toBe("none");
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
});

it("sends complete static business and artwork content before JavaScript", () => {
  policy();
  const html = renderToStaticMarkup(<BusinessJourney />);
  const doc = document.implementation.createHTMLDocument(); doc.body.innerHTML = html;
  expect(doc.querySelectorAll("[data-business-chapter]")).toHaveLength(3);
  expect(doc.querySelectorAll("h3")).toHaveLength(3);
  expect(doc.querySelector('a[href="#teklif"]')).not.toBeNull();
  expect(doc.querySelectorAll("[hidden],[inert]")).toHaveLength(0);
  expect(html).not.toMatch(/opacity:\s*0(?:;|"|\s)/);
  expect(renderToStaticMarkup(<ScrollArtwork>AFİNA zeytinliği</ScrollArtwork>)).toContain('style="transform:none"');
});
