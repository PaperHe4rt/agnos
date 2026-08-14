import { describe, expect, it } from "vitest";
import {
  INACTIVE_AFTER_MS,
  TYPING_WINDOW_MS,
  formatRelativeTime,
  getAttentionFlag,
  getProgress,
  getStatus,
  isTyping,
} from "./status";
import { TOTAL_FIELDS } from "./schema";
import type { IntakeSession } from "./types";

const NOW = 1_700_000_000_000;

function session(overrides: Partial<IntakeSession> = {}): IntakeSession {
  return {
    id: "abc12345",
    values: {},
    lastKeystrokeAt: NOW,
    submittedAt: null,
    skippedFields: [],
    failedValidations: {},
    errorSubmits: 0,
    ...overrides,
  };
}

const answeredRequired = {
  firstName: "Ada",
  lastName: "Mensah",
  dateOfBirth: "1991-03-12",
  gender: "Female",
  phone: "+1 415 555 0148",
  email: "ada.mensah@mail.com",
  address: "418 Marina Blvd",
  preferredLanguage: "English",
  nationality: "Ghanaian",
};

describe("status", () => {
  it("is active while the patient is still working", () => {
    expect(getStatus(session(), NOW)).toBe("active");
    expect(getStatus(session(), NOW + INACTIVE_AFTER_MS - 1)).toBe("active");
  });

  it("flips to inactive on the threshold", () => {
    expect(getStatus(session(), NOW + INACTIVE_AFTER_MS)).toBe("inactive");
  });

  it("stays submitted no matter how long ago that was", () => {
    const submitted = session({ submittedAt: NOW });
    expect(getStatus(submitted, NOW + INACTIVE_AFTER_MS * 10)).toBe("submitted");
  });
});

describe("typing", () => {
  it("is true inside the window and false outside it", () => {
    expect(isTyping(session(), NOW + TYPING_WINDOW_MS - 1)).toBe(true);
    expect(isTyping(session(), NOW + TYPING_WINDOW_MS)).toBe(false);
  });

  it("is false once submitted", () => {
    expect(isTyping(session({ submittedAt: NOW }), NOW)).toBe(false);
  });
});

describe("attention flag", () => {
  it("is null while things are going fine", () => {
    expect(getAttentionFlag(session())).toBeNull();
  });

  it("stays null until the third failure on one field", () => {
    expect(getAttentionFlag(session({ failedValidations: { phone: 2 } }))).toBeNull();
    expect(getAttentionFlag(session({ failedValidations: { phone: 3 } }))).toBe("needs_help");
  });

  it("does not add failures across different fields", () => {
    const spread = session({ failedValidations: { phone: 2, email: 2 } });
    expect(getAttentionFlag(spread)).toBeNull();
  });

  it("is raised by repeated submits with errors", () => {
    expect(getAttentionFlag(session({ errorSubmits: 1 }))).toBeNull();
    expect(getAttentionFlag(session({ errorSubmits: 2 }))).toBe("needs_help");
  });

  it("clears on submit even with failures on the record", () => {
    const submitted = session({ submittedAt: NOW, failedValidations: { phone: 5 }, errorSubmits: 3 });
    expect(getAttentionFlag(submitted)).toBeNull();
  });
});

describe("progress", () => {
  it("counts only what has been filled in while the patient works", () => {
    const working = session({ values: answeredRequired });
    expect(getProgress(working)).toEqual({ answered: 9, total: TOTAL_FIELDS });
  });

  it("credits a step the patient explicitly skipped", () => {
    const skipped = session({
      values: answeredRequired,
      skippedFields: ["emergencyContactName", "emergencyContactRelationship", "emergencyContactPhone"],
    });
    expect(getProgress(skipped).answered).toBe(12);
  });

  it("reaches the total on submit even with optional fields left blank", () => {
    const submitted = session({ values: answeredRequired, submittedAt: NOW });
    expect(getProgress(submitted)).toEqual({ answered: TOTAL_FIELDS, total: TOTAL_FIELDS });
  });
});

describe("relative time", () => {
  it("reads as now for the first few seconds", () => {
    expect(formatRelativeTime(NOW, NOW + 2_000)).toBe("now");
  });

  it("counts seconds up to a minute", () => {
    expect(formatRelativeTime(NOW, NOW + 8_000)).toBe("8s ago");
  });

  it("switches to clock time after a minute", () => {
    expect(formatRelativeTime(NOW, NOW + 60_000)).toMatch(/^\d{2}:\d{2}$/);
  });
});
