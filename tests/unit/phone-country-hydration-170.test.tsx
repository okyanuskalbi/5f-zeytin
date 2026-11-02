import { act, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { PhoneCountrySearch } from "@/components/ui/phone-country-search";
import { countryPhoneOptions } from "@/lib/contact/customer-phone";

let root: Root | undefined;
let container: HTMLDivElement | undefined;
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
});

it.each(["tr", "en", "ru"] as const)("hydrates the %s country selector when server/client ICU names and collation differ", async lang => {
  const serverOptions = countryPhoneOptions(lang);
  // Node and Chromium can ship different CLDR names/collation. Reversing the
  // localized order and changing a label reproduces both forms of divergence.
  const clientOptions = [...serverOptions].reverse().map(option => option.country === "TR" ? { ...option, name: `${option.name} (client ICU)` } : option);
  const changed = vi.fn();
  const field = (options: typeof serverOptions) => <form>
    <PhoneCountrySearch name="phoneCountry" value="TR" options={options} label="Telefon ülke kodu" autoComplete="tel-country-code" lang={lang} onChange={changed} />
  </form>;
  container = document.createElement("div");
  container.innerHTML = renderToString(field(serverOptions));
  document.body.append(container);
  const serverSelect = container.querySelector("select")!;
  expect(serverSelect.options.length).toBe(serverOptions.length);
  expect(new FormData(container.querySelector("form")!).get("phoneCountry")).toBe("TR");
  expect(container.querySelector("button")!.textContent).toContain("+90");

  const recoverable = vi.fn();
  await act(async () => { root = hydrateRoot(container!, field(clientOptions), { onRecoverableError: recoverable }); });
  expect(recoverable).not.toHaveBeenCalled();
  expect(container.querySelector("button")!.textContent).toContain(clientOptions.find(option => option.country === "TR")!.name);
  expect(new FormData(container.querySelector("form")!).get("phoneCountry")).toBe("TR");
  fireEvent.change(container.querySelector("select")!, { target: { value: "DE" } });
  expect(changed).toHaveBeenLastCalledWith("DE");
});
