import { notFound } from "next/navigation";
import { FrameDemo } from "./FrameDemo";

export const metadata = { robots: { index: false, follow: false } };

export default function FramesDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <FrameDemo />;
}
