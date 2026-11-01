"use client";

import React, { useEffect, useId, useMemo, useState } from "react";

import { CreditCard } from "lucide-react";
import styles from "./credit-card-form.module.css";

const cx = (value: string) => value.split(/\s+/).map(key => styles[key] || key).join(" ");

/** Adapted from the user-provided credit card form. No transport or storage.
 * Live checkout remains the PayTR iframe; custom entry requires Direct API authorization. */
type CardState = {
  number: string;     // raw digits (no spaces)
  holder: string;     // uppercase
  month: string;      // "01".."12" or ""
  year: string;       // "2025".."2034" or ""
  cvv: string;        // up to 4
};

type CardValidity = {
  number: boolean; // passes Luhn & length >= 13
  holder: boolean; // >= 2 chars
  month: boolean;  // 01..12
  year: boolean;   // >= current year
  cvv: boolean;    // 3-4 digits
  allValid: boolean;
};

type Props = {
  /** Display the card without collecting any payment data. */
  previewOnly?: boolean;
  /** Prefill values (optional) */
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string; // "01".."12"
  defaultYear?: string;  // "2025"
  defaultCVV?: string;

  /** Mask digits 5..12 with * on the card front */
  maskMiddle?: boolean;

  /** Override gradient accent rings (front/back :before/:after) */
  ring1?: string; // e.g. "#ff6be7"
  ring2?: string; // e.g. "#7288ff"

  /** Show a submit button */
  showSubmit?: boolean;
  /** Live change callback */
  onChange?: (state: CardState, validity: CardValidity) => void;
  /** Submit callback */
  onSubmit?: (state: CardState, validity: CardValidity) => void;

  /** Class for wrapping container */
  className?: string;
};


function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}


export function validateCard(state: CardState, now = new Date()): CardValidity {
  const { number, holder, month, year, cvv } = state;
  let sum = 0;
  for (let i = number.length - 1, doubled = false; i >= 0; i--, doubled = !doubled) {
    let digit = Number(number[i]);
    if (doubled) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  const numberValid = /^\d{13,19}$/.test(number) && !/^0+$/.test(number) && sum % 10 === 0;
  const holderValid = holder.trim().length >= 2;
  const monthValid = /^(0[1-9]|1[0-2])$/.test(month);
  const yearValid = /^\d{4}$/.test(year) && (+year > now.getFullYear() || (+year === now.getFullYear() && +month >= now.getMonth() + 1));
  const cvvValid = /^\d{3,4}$/.test(cvv);
  return { number: numberValid, holder: holderValid, month: monthValid, year: yearValid, cvv: cvvValid, allValid: numberValid && holderValid && monthValid && yearValid && cvvValid };
}

const CreditCardForm = ({
  previewOnly = false,
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  maskMiddle = true,
  ring1 = "#b4c58f",
  ring2 = "#b6a078",
  showSubmit = true,
  onChange,
  onSubmit,
  className = "",
}: Props) => {
  const uid = useId();
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<null | "number" | "holder" | "expire" | "cvv">(null);

  const flip = focusField === "cvv";
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity = useMemo(() => validateCard({ number, holder, month, year, cvv }), [number, holder, month, year, cvv]);

  // Notify parent on change
  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv }, validity);
  }, [number, holder, month, year, cvv, validity, onChange]);

  // Show every accepted digit; mask the middle on the decorative card.
  const displayDigits = useMemo(() => number.split(""), [number]);

  const displayedSlots = useMemo(() => {
    const arr: { textTop: string; filed: boolean }[] = [];
    for (let i = 0; i < Math.max(16, displayDigits.length); i++) {
      let content = "#";
      if (i < displayDigits.length) {
        const d = displayDigits[i];
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? "*" : d;
      }
      arr.push({ textTop: content, filed: i < displayDigits.length });
    }
    return arr;
  }, [displayDigits, maskMiddle]);

  const highlightClass = (() => {
    switch (focusField) {
      case "number":
        return "highlight__number";
      case "holder":
        return "highlight__holder";
      case "expire":
        return "highlight__expire";
      case "cvv":
        return "highlight__cvv";
      default:
        return "hidden";
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checked = validateCard({ number, holder, month, year, cvv });
    if (checked.allValid && !previewOnly) onSubmit?.({ number, holder, month, year, cvv }, checked);
  };

  return (
    <section className={cx(`ccp ${previewOnly ? "preview" : ""} ${className}`)}>
      <div className={cx("wrap")}>
        {/* CARD */}
        <section role="img" aria-label="Temsili ödeme kartı" className={cx(`card ${flip ? "flip" : ""}`)}>
          <div className={cx(`highlight ${highlightClass}`)} aria-hidden="true" />

          {/* FRONT */}
          <section className={cx("card__front")} style={{ ["--ring1" as string]: ring1, ["--ring2" as string]: ring2 }}>
            <div className={cx("card__header")}>
              <div>AFİNA · Kart önizlemesi</div>
              <CreditCard aria-hidden="true" size={32} strokeWidth={1.4} />
            </div>

            {/* Number slots with slide animation */}
          <div className={cx("card__number")}>
            {displayedSlots.map((slot, idx) => (
              <span key={idx} className={cx("slot")}>
                <span className={cx(`digit ${slot.filed ? "filed" : ""}`)}>
                  <span className={cx("row placeholder")}>#</span>
                  <span className={cx("row value")}>{slot.textTop}</span>
                </span>
              </span>
            ))}
           </div>

            <div className={cx("card__footer")}>
              <div className={cx("card__holder")}>
                <div className={cx("card__section__title")}>Kart sahibi</div>
                <div>{holder || "AD SOYAD"}</div>
              </div>
              <div className={cx("card__expires")}>
                <div className={cx("card__section__title")}>Son kullanma</div>
                <span>{month || "MM"}</span>/
                <span>{year ? year.slice(-2) : "YY"}</span>
              </div>
            </div>
          </section>

          {/* BACK */}
          <section className={cx("card__back")} style={{ ["--ring1" as string]: ring1, ["--ring2" as string]: ring2 }}>
            <div className={cx("card__hide_line")} />
            <div className={cx("card_cvv")}>
              <span>CVV</span>
              <div className={cx("card_cvv_field")}>
                {"*".repeat(cvv.length)}
              </div>
            </div>
          </section>
        </section>

        {/* FORM */}
        {!previewOnly && <form className={cx("form")} onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={uid + "-number"}>Kart numarası</label>
            <input
              id={uid + "-number"}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={formatNumberSpaces(number)}
              onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
              onFocus={() => setFocusField("number")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.number}
            />
            {!validity.number && number.length >= 13 && (
              <small className={cx("err")}>Kart numarasını kontrol edin.</small>
            )}
          </div>

          <div>
            <label htmlFor={uid + "-holder"}>Kart sahibi</label>
            <input
              id={uid + "-holder"}
              type="text"
              autoComplete="cc-name"
              placeholder="AD SOYAD"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocusField("holder")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.holder}
            />
          </div>

          <div className={cx("filed__group")}>
            <div>
              <span>Son kullanma tarihi</span>
              <div className={cx("filed__date")}>
                <select
                  id={uid + "-expiration_month"}
                  aria-label="Son kullanma ayı"
                  value={month || ""}
                  onChange={(e) => setMonth(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.month}
                >
                  <option value="" disabled>
                    Ay
                  </option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  id={uid + "-expiration_year"}
                  aria-label="Son kullanma yılı"
                  value={year || ""}
                  onChange={(e) => setYear(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.year}
                >
                  <option value="" disabled>
                    Yıl
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {month && year && !validity.year && <small className={cx("err")}>Son kullanma tarihi geçmiş.</small>}
            </div>

            <div>
              <label htmlFor={uid + "-cvv"}>CVV</label>
              <input
                id={uid + "-cvv"}
                type="password"
                maxLength={4}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="***"
                value={cvv}
                onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                onFocus={() => setFocusField("cvv")}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.cvv}
              />
            </div>
          </div>

          {showSubmit && (
            <button className={cx("submit")} type="submit" disabled={!validity.allValid} aria-disabled={!validity.allValid}>
              {validity.allValid ? "Devam et" : "Alanları tamamlayın"}
            </button>
          )}
        </form>}
      </div>


    </section>
  );
};

export { CreditCardForm };
export type { CardState, CardValidity };
