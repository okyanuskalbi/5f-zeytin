import { useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../../../components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../../../components/ui/dialog";
import "../../../app/globals.css";

function TokensFixture(): JSX.Element {
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);

  return (
    <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>AFİNA ZEYTİN</h1>
      <p>Kökü toprakta. Yeri sofrada.</p>
      <p data-testid="gold-on-ivory" style={{ color: "var(--gold-ink)" }}>Toprağın sunduğu lezzet</p>
      <p data-testid="gold-on-olive" style={{ background: "var(--primary)", color: "var(--brand-gold)", padding: "1rem" }}>Afina’nın özeniyle.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBlock: "2rem" }}>
        <Button onClick={() => setAttempts((value) => value + 1)}>Ürünlerimizi Keşfedin</Button>
        <Button variant="secondary">Altın vurgu</Button>
        <Button variant="outline">Toptan Satış İçin İletişime Geçin</Button>
        <Button variant="ghost">Vazgeç</Button>
        <Button variant="link" asChild><a href="#details">Ayrıntılar</a></Button>
        <Button variant="destructive" onClick={() => setError(true)}>Hata durumunu göster</Button>
        <Button disabled onClick={() => setAttempts((value) => value + 1)}>Kullanılamıyor</Button>
        <Button aria-invalid={error} onClick={() => setError(false)}>Tekrar dene</Button>
      </div>
      <p role="status">İşlem sayısı: {attempts}</p>
      {error && <p role="alert" style={{ color: "var(--destructive)" }}>İşlem tamamlanamadı. Tekrar deneyin.</p>}
      <Dialog>
        <DialogTrigger asChild><Button variant="outline">Bilgiyi aç</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürün bilgisi</DialogTitle>
            <DialogDescription>Çığ, özen, ıhlamur: Türkçe karakterler ve uzun açıklamalar dar ekranlarda da okunur kalır.</DialogDescription>
          </DialogHeader>
          <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Vazgeç</Button></DialogClose>
            <DialogClose asChild><Button>Anladım</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p id="details">Temel bileşen örnekleri; gerçek ürün veya servis işlemi içermez.</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<TokensFixture />);
