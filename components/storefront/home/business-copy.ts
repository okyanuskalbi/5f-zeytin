/** Words shared by the wholesale and dealership tabs, the phone cards and the phone sheet (docs/tasks/209). */
export const businessCopy = {
  toptan: {
    title: "Toptan Satış",
    note: "Otel, restoran, market ve toplu tüketim için koli bazında teklif.",
    action: "Teklif iste",
    sheetTitle: "Toptan teklif formu",
  },
  bayilik: {
    title: "Bayilik",
    note: "AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.",
    action: "Başvuru yap",
    sheetTitle: "Bayilik başvurusu",
  },
} as const;

export type BusinessKind = keyof typeof businessCopy;
export const businessKinds = Object.keys(businessCopy) as readonly BusinessKind[];
