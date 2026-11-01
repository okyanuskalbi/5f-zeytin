import { describe, expect, it, vi } from "vitest";
import { createSeekQueue, approachTime, progressTime } from "@/lib/media/scrub-seek";

describe("scroll film seek queue", () => {
  it("coalesces rapid forward and backward requests into the newest target", () => {
    let time = 0;
    const write = vi.fn((next: number) => { time = next; });
    const queue = createSeekQueue(() => time, write);
    queue.request(1); queue.request(4); queue.request(2);
    expect(write.mock.calls).toEqual([[1]]);
    queue.complete();
    expect(write.mock.calls).toEqual([[1], [2]]);
    queue.complete(); queue.request(0);
    expect(write.mock.calls.at(-1)).toEqual([0]);
  });
  it("never waits for a seeked event when the frame is already current", () => {
    const write = vi.fn();
    const queue = createSeekQueue(() => 0, write);
    queue.request(0); queue.request(1);
    expect(write.mock.calls).toEqual([[1]]);
  });
  it("releases busy and stale pending state after an error or thrown seek", () => {
    const write = vi.fn().mockImplementationOnce(() => { throw Error("not ready"); });
    const queue = createSeekQueue(() => 0, write);
    queue.request(1); queue.request(2); queue.request(3); queue.reset(); queue.request(4);
    expect(write.mock.calls).toEqual([[1], [2], [4]]);
  });
  it("clamps media endpoints and converges without overshooting at different refresh rates", () => {
    expect(progressTime(-1, 8)).toBe(0);
    expect(progressTime(2, 8)).toBeCloseTo(8 - 1 / 24);
    expect(progressTime(.5, NaN)).toBe(0);
    let a = 0, b = 0;
    for (let i = 0; i < 30; i++) a = approachTime(a, 4, 1000 / 30);
    for (let i = 0; i < 120; i++) b = approachTime(b, 4, 1000 / 120);
    expect(a).toBeCloseTo(b, 4);
    expect(a).toBeLessThanOrEqual(4);
    expect(approachTime(7, 0, 10000)).toBeGreaterThanOrEqual(0);
  });
});
