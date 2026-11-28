/**
 * Test-only SMTP double. The real worker-mailer is loaded with its `cloudflare:sockets` import pointed at
 * `globalThis.__fakeSmtpConnect`, so the test sees exactly the DATA bytes a server would receive.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const wire = { data: "" };

export async function loadRealWorkerMailer(): Promise<Record<string, unknown>> {
  const source = readFileSync(path.resolve("node_modules/worker-mailer/dist/index.mjs"), "utf8");
  const socketImport = 'import{connect as b}from"cloudflare:sockets";';
  if (!source.includes(socketImport)) throw new Error("worker-mailer socket import changed; update the test double");
  const file = path.join(mkdtempSync(path.join(tmpdir(), "worker-mailer-")), "index.mjs");
  writeFileSync(file, source.replace(socketImport, "const b=(...args)=>globalThis.__fakeSmtpConnect(...args);"));
  return import(/* @vite-ignore */ pathToFileURL(file).href);
}

export function fakeSmtp() {
  let reply: (line: string) => void = () => {};
  let receivingData = false;
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      reply = line => controller.enqueue(new TextEncoder().encode(`${line}\r\n`));
      reply("220 fake.example.test ready");
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      const text = new TextDecoder().decode(chunk);
      if (receivingData) { receivingData = false; wire.data = text; reply("250 queued"); return; }
      if (text.startsWith("EHLO")) reply("250-fake.example.test\r\n250 SIZE 1000000");
      else if (text.startsWith("DATA")) { receivingData = true; reply("354 go ahead"); }
      else if (text.startsWith("QUIT")) reply("221 bye");
      else reply("250 ok");
    },
  });
  return { opened: Promise.resolve(), readable, writable, close: () => Promise.resolve() };
}

function decodeQuotedPrintable(body: string): string {
  const bytes: number[] = [];
  const joined = body.replace(/=\r\n/g, "");
  for (let index = 0; index < joined.length; index++) {
    if (joined[index] === "=") {
      const hex = joined.slice(index + 1, index + 3);
      if (!/^[0-9A-F]{2}$/.test(hex)) throw new Error(`broken quoted-printable escape: =${hex}`);
      bytes.push(Number.parseInt(hex, 16));
      index += 2;
    } else bytes.push(joined.charCodeAt(index));
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
}

const decodeWords = (value: string) => value.replace(/\?=\s+=\?/g, "?==?").replace(/=\?UTF-8\?([BQ])\?([^?]*)\?=/g, (_, kind: string, data: string) =>
  kind === "B" ? Buffer.from(data, "base64").toString("utf8") : decodeQuotedPrintable(data.replace(/_/g, " ")));

/** Splits a captured DATA payload into its alternative parts, undoing dot-stuffing like a receiving server. */
export function decodeMime(data: string) {
  if (!data.endsWith("\r\n.\r\n")) throw new Error("DATA terminator missing");
  const lines = data.slice(0, -5).split("\r\n").map(line => line.startsWith(".") ? line.slice(1) : line);
  const message = lines.join("\r\n");
  const boundary = /multipart\/alternative; boundary="([^"]+)"/.exec(message)?.[1];
  if (!boundary) throw new Error("multipart/alternative missing");
  const sections = message.split(`--${boundary}`);
  if (!sections.at(-1)!.startsWith("--")) throw new Error("closing boundary missing");
  let longestBodyLine = 0;
  const parts = sections.slice(1, -1).map(section => {
    const split = section.indexOf("\r\n\r\n");
    const head = section.slice(2, split);
    const body = section.slice(split + 4).replace(/\r\n\r\n$/, "");
    longestBodyLine = Math.max(longestBodyLine, ...body.split("\r\n").map(line => line.length));
    return {
      type: /Content-Type: (.+)/.exec(head)![1],
      encoding: /Content-Transfer-Encoding: (.+)/.exec(head)![1],
      content: decodeQuotedPrintable(body),
    };
  });
  return {
    parts, longestBodyLine,
    longestLine: Math.max(...lines.map(line => line.length)),
    ascii: /^[\x00-\x7f]*$/.test(data),
    bareLineBreaks: /[\r\n]/.test(data.replace(/\r\n/g, "")),
    subject: decodeWords(/^Subject: (.*)$/m.exec(message)![1]),
    from: decodeWords(/^From: (.*)$/m.exec(message)![1]),
  };
}
