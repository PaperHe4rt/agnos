import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPatch,
  getSession,
  listSessions,
  resetHub,
  subscribe,
} from "./hub";

const NOW = 1_700_000_000_000;

beforeEach(() => {
  resetHub();
});

describe("applyPatch", () => {
  it("creates a session on the first patch", () => {
    const session = applyPatch(
      "abc12345",
      { values: { firstName: "Ada" } },
      NOW,
    );
    expect(session.values.firstName).toBe("Ada");
    expect(session.fieldUpdatedAt.firstName).toBe(NOW);
    expect(getSession("abc12345")).toEqual(session);
  });

  it("stamps only the fields whose value actually changed", () => {
    applyPatch(
      "abc12345",
      { values: { firstName: "Ada", lastName: "M" } },
      NOW,
    );
    const session = applyPatch(
      "abc12345",
      { values: { firstName: "Ada", lastName: "Mensah" } },
      NOW + 5_000,
    );

    expect(session.fieldUpdatedAt.firstName).toBe(NOW);
    expect(session.fieldUpdatedAt.lastName).toBe(NOW + 5_000);
  });

  it("moves the keystroke clock on every patch", () => {
    applyPatch("abc12345", { values: { firstName: "Ada" } }, NOW);
    const session = applyPatch("abc12345", {}, NOW + 9_000);
    expect(session.lastKeystrokeAt).toBe(NOW + 9_000);
  });

  it("keeps the first submission, since submitted is terminal", () => {
    applyPatch("abc12345", { submitted: true }, NOW);
    const session = applyPatch("abc12345", { submitted: true }, NOW + 60_000);
    expect(session.submittedAt).toBe(NOW);
  });

  it("leaves failure counts alone when the patch does not carry them", () => {
    applyPatch(
      "abc12345",
      { failedValidations: { phone: 2 }, errorSubmits: 1 },
      NOW,
    );
    const session = applyPatch(
      "abc12345",
      { values: { phone: "+1" } },
      NOW + 1_000,
    );

    expect(session.failedValidations).toEqual({ phone: 2 });
    expect(session.errorSubmits).toBe(1);
  });
});

describe("subscribers", () => {
  it("hear every patch until they unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    applyPatch("abc12345", { values: { firstName: "Ada" } }, NOW);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    applyPatch("abc12345", { values: { firstName: "Adaeze" } }, NOW + 1_000);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("sweep", () => {
  it("drops sessions that went quiet past the TTL", () => {
    applyPatch("abc12345", { values: { firstName: "Ada" } }, NOW);
    expect(listSessions(NOW + 60 * 60_000)).toHaveLength(1);
    expect(listSessions(NOW + 3 * 60 * 60_000)).toHaveLength(0);
  });
});
