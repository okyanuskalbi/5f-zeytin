import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold">Afina Zeytin</h1>
      <p className="text-lg">Kökü toprakta. Yeri sofrada.</p>
    </main>
  );
}
