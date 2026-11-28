/** Test helpers for the HTML emails; they need a DOM (jsdom environment). */
export const parseEmail = (html: string) => new DOMParser().parseFromString(html, "text/html");

function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map(part => {
    const channel = Number(part) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function inherited(element: Element, property: "color" | "backgroundColor"): string {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const value = (node as HTMLElement).style[property];
    if (value) return value;
  }
  return "";
}

/** Every visible text must have an explicit inline colour and background with a ratio of at least 4.5:1. */
export function contrastFailures(html: string): string[] {
  const failures: string[] = [];
  for (const element of parseEmail(html).body.querySelectorAll("*")) {
    const text = [...element.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join("").trim();
    if (!text) continue;
    const color = inherited(element, "color");
    const background = inherited(element, "backgroundColor");
    if (!color || !background) { failures.push(`missing colour: ${text.slice(0, 40)}`); continue; }
    const [light, dark] = [luminance(color), luminance(background)].sort((a, b) => b - a);
    const ratio = (light + 0.05) / (dark + 0.05);
    if (ratio < 4.5) failures.push(`${ratio.toFixed(2)} ${color} on ${background}: ${text.slice(0, 40)}`);
  }
  return failures;
}
