import type { JSX, ReactNode } from "react";
import Link from "next/link";
import { V3Picture } from "@/components/media/V3Picture";
import type { V3Image } from "@/lib/media/v3-assets";
import { OliveBranch } from "./OliveBranch";
import { SectionHeading } from "./SectionHeading";
import ui from "./ui.module.css";

export type PathStep = Readonly<{ name: string; href?: string }>;

/** "Ana Sayfa / …" trail; the last step is the current page. */
export function PagePath({ steps }: { steps: readonly PathStep[] }): JSX.Element {
  return <nav aria-label="İçerik yolu" className={ui.path}><ol>
    {steps.map((step, index) => <li key={step.name}>
      {index > 0 && <span aria-hidden="true">/</span>}
      {step.href ? <Link prefetch={false} href={step.href}>{step.name}</Link> : <span aria-current="page">{step.name}</span>}
    </li>)}
  </ol></nav>;
}

/**
 * How an inner page opens (docs/DESIGN.md → Agent Prompt Guide, "İç sayfa başlığı"):
 * a sage band with the h1, closed on the right by a photograph, or by the olive branch when there is none.
 */
export function PageBand({ title, lead, headingId, image, sizes = "(max-width: 767px) calc(100vw - 32px), (max-width: 1407px) 42vw, 590px", children }: {
  title: string; lead?: string; headingId?: string; image?: V3Image; sizes?: string; children?: ReactNode;
}): JSX.Element {
  return <div data-page-band="" data-photo={image ? "" : undefined} className={ui.band}>
    <div className={ui.bandCopy}><SectionHeading as="h1" id={headingId} title={title} lead={lead} />{children}</div>
    {image
      ? <V3Picture image={image} sizes={sizes} decorative eager className={ui.bandPhoto} />
      : <OliveBranch className={ui.bandBranch} />}
  </div>;
}
