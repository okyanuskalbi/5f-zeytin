import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Unauthorized, { metadata as unauthorizedMetadata } from "@/app/unauthorized";
import Forbidden, { metadata as forbiddenMetadata } from "@/app/forbidden";

afterEach(cleanup);

describe("Turkish admin access screens", () => {
  it.each([
    {
      file: "unauthorized",
      Page: Unauthorized,
      metadata: unauthorizedMetadata,
      title: "Giriş gerekli",
      description: "Bu sayfayı görmek için yönetici hesabıyla giriş yapın.",
      action: "Giriş yap",
      href: "/giris?next=%2Fadmin",
    },
    {
      file: "forbidden",
      Page: Forbidden,
      metadata: forbiddenMetadata,
      title: "Yetkiniz yok",
      description: "Bu hesabın yönetici yetkisi bulunmuyor.",
      action: "Ana sayfaya dön",
      href: "/",
    },
  ])("renders $file with a Turkish explanation, recovery link and noindex metadata", ({ Page, metadata, title, description, action, href }) => {
    render(<Page />);

    expect(screen.getByRole("main").contains(screen.getByRole("heading", { level: 1, name: title }))).toBe(true);
    expect(screen.getByText(description)).toBeTruthy();
    expect(screen.getByRole("link", { name: action }).getAttribute("href")).toBe(href);
    expect(metadata.title).toBe(`${title} | Afina Zeytin`);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
