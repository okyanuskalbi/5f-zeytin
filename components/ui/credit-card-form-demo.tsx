"use client";

import { useState } from "react";
import { CreditCardForm } from "./credit-card-form";

/** Development gallery only. Never mounted by checkout or membership routes. */
export function CreditCardFormDemo() {
  const [checked, setChecked] = useState(false);
  return <div>
    <p>Görsel form denemesi. Yalnız test verisi kullanın; ödeme yapılmaz.</p>
    <CreditCardForm onSubmit={() => setChecked(true)} />
    {checked && <p role="status">Biçim kontrolü tamamlandı. Herhangi bir ödeme yapılmadı.</p>}
  </div>;
}
