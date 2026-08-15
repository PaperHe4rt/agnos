import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  clampPage,
  getPageCount,
  getPageRange,
  paginateItems,
} from "./pagination";

describe("staff pagination", () => {
  it("uses 12 patients per page", () => {
    expect(PAGE_SIZE).toBe(12);
  });

  it("returns the current page slice", () => {
    const ids = Array.from({ length: 25 }, (_, index) => `patient-${index + 1}`);

    expect(paginateItems(ids, 1)).toEqual(ids.slice(0, 12));
    expect(paginateItems(ids, 2)).toEqual(ids.slice(12, 24));
    expect(paginateItems(ids, 3)).toEqual(ids.slice(24, 25));
  });

  it("clamps the page inside the available range", () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(4, 3)).toBe(3);
    expect(clampPage(2, 3)).toBe(2);
  });

  it("reports the visible one-based range", () => {
    expect(getPageRange(25, 1)).toEqual({ start: 1, end: 12 });
    expect(getPageRange(25, 3)).toEqual({ start: 25, end: 25 });
    expect(getPageRange(0, 1)).toEqual({ start: 0, end: 0 });
  });

  it("keeps an empty queue to one page", () => {
    expect(getPageCount(0)).toBe(1);
  });
});
