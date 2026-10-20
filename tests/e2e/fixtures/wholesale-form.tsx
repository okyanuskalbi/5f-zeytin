import { useRef, useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { WholesaleForm } from "../../../components/landing/WholesaleForm";
import type { WholesaleRequest, WholesaleResult } from "../../../lib/contracts/wholesale";
import "../../../app/globals.css";

// Test-only dependency injection. No mock mode or route is shipped in app/.
function Fixture(): JSX.Element {
  const [calls, setCalls] = useState(0);
  const [payload, setPayload] = useState<WholesaleRequest | null>(null);
  const settle = useRef<{ resolve: (result: WholesaleResult) => void; reject: () => void } | null>(null);
  return <main style={{ maxWidth: 700, padding: 24, margin: "0 auto" }}>
    <WholesaleForm submitRequest={request => {
      setCalls(value => value + 1);
      setPayload(request);
      return new Promise<WholesaleResult>((resolve, reject) => {
        settle.current = { resolve, reject: () => reject(new Error("Mock failure")) };
      });
    }} />
    <p role="status" aria-label="Mock çağrı sayısı">{calls}</p>
    <pre data-testid="mock-payload" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(payload)}</pre>
    <button onClick={() => settle.current?.resolve({ ok: true })}>Mock başarı</button>{" "}
    <button onClick={() => settle.current?.resolve({ ok: false })}>Mock hata</button>{" "}
    <button onClick={() => settle.current?.reject()}>Mock bağlantı hatası</button>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
