"use client";

import { useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";

function Progress({ progress }: { progress: MotionValue<number> }) {
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(progress, "change", (value) => setPercent(Math.round(value * 100)));
  return <span data-testid="frame-progress">{percent}%</span>;
}

export function FrameDemo() {
  const [contain, setContain] = useState(false);
  const [blurFill, setBlurFill] = useState(false);
  // Controls stay outside the sticky scene so text/CTA are accessible in every mode.
  return (
    <main>
      <div className="flex flex-wrap gap-4 p-4">
        <p className="text-sm">Geliştirme denemesi — sentetik test deseni, marka görseli değildir.</p>
        <label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={contain} onChange={(event) => setContain(event.target.checked)} />Contain</label>
        <label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={blurFill} onChange={(event) => setBlurFill(event.target.checked)} />Bulanık kenarlar</label>
      </div>
      <ScrollFrameSequence src="/media/frame-demo/manifest.json" fit={contain ? "contain" : "cover"} blurFill={blurFill} label="Sentetik kare dizisi test deseni">
        {(progress) => (
          <div className="flex h-full flex-col items-start justify-end gap-4 p-4 pb-16 sm:p-8 sm:pb-16">
            <div className="max-w-lg space-y-3 bg-background p-4 text-foreground">
              <h1 className="text-3xl">Kare dizisi denemesi</h1>
              <p>Kaydırma ilerlemesi: <Progress progress={progress} /></p>
              <a href="#frames-end" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Deneme sonuna git</a>
            </div>
          </div>
        )}
      </ScrollFrameSequence>
      <section id="frames-end" tabIndex={-1} className="min-h-screen p-8"><h2>Deneme sonu</h2></section>
    </main>
  );
}
