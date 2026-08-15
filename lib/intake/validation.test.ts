import { describe, expect, it } from "vitest";
import {
  countAnswered,
  countRequiredAnswered,
  isFieldRequired,
  validateAll,
  validateField,
  validateStep,
} from "./validation";
import type { FieldValues } from "./types";

const complete: FieldValues = {
  firstName: "Ada",
  lastName: "Mensah",
  dateOfBirth: "1991-03-12",
  gender: "Female",
  phone: "+1 415 555 0148",
  email: "ada.mensah@mail.com",
  address: "418 Marina Blvd, San Francisco, CA 94123",
  preferredLanguage: "English",
  nationality: "Ghanaian",
  religion: "None",
};

describe("required fields", () => {
  it.each(["firstName", "gender", "preferredLanguage"] as const)(
    "flags a missing %s without repeating the label",
    (id) => {
      expect(validateField(id, {})).toBe("This answer is required.");
    },
  );

  // Religion is optional in the assignment, and "Prefer not to say" is the
  // first option rather than a required answer.
  it.each(["middleName", "religion"] as const)(
    "leaves optional %s alone",
    (id) => {
      expect(validateField(id, {})).toBeNull();
    },
  );

  it("treats whitespace as missing", () => {
    expect(validateField("firstName", { firstName: "   " })).toBe(
      "This answer is required.",
    );
  });
});

describe("phone", () => {
  it("accepts international input with punctuation", () => {
    expect(validateField("phone", { phone: "+66 (0)2 123 4567" })).toBeNull();
  });

  it("rejects a number that was cut off", () => {
    expect(validateField("phone", { phone: "+1 415 55" })).not.toBeNull();
  });

  it("rejects more digits than E.164 allows", () => {
    expect(
      validateField("phone", { phone: "1234567890123456" }),
    ).not.toBeNull();
  });
});

describe("email", () => {
  it("rejects an address with no domain", () => {
    expect(validateField("email", { email: "ada.mensah@" })).not.toBeNull();
  });

  it("rejects an address with no TLD", () => {
    expect(validateField("email", { email: "ada@mail" })).not.toBeNull();
  });

  it("accepts a normal address", () => {
    expect(validateField("email", { email: "ada.mensah@mail.com" })).toBeNull();
  });
});

describe("date of birth", () => {
  it("rejects a future date", () => {
    expect(
      validateField("dateOfBirth", { dateOfBirth: "2999-01-01" }),
    ).not.toBeNull();
  });

  it("rejects a date beyond a plausible lifespan", () => {
    expect(
      validateField("dateOfBirth", { dateOfBirth: "1850-01-01" }),
    ).not.toBeNull();
  });

  it("rejects text that is not a date", () => {
    expect(
      validateField("dateOfBirth", { dateOfBirth: "not a date" }),
    ).not.toBeNull();
  });

  it("accepts a real birth date", () => {
    expect(
      validateField("dateOfBirth", { dateOfBirth: "1991-03-12" }),
    ).toBeNull();
  });
});

describe("emergency contact", () => {
  const filled = {
    emergencyContactName: "Kofi Mensah",
    emergencyContactRelationship: "Sibling",
    emergencyContactPhone: "+1 415 555 0199",
  };

  it("stays optional while all three are empty", () => {
    expect(validateField("emergencyContactName", {})).toBeNull();
    expect(validateField("emergencyContactRelationship", {})).toBeNull();
    expect(validateField("emergencyContactPhone", {})).toBeNull();
  });

  it("asks for the other two once a name is given", () => {
    const values = { emergencyContactName: "Kofi Mensah" };
    expect(validateField("emergencyContactName", values)).toBeNull();
    expect(
      validateField("emergencyContactRelationship", values),
    ).not.toBeNull();
    expect(validateField("emergencyContactPhone", values)).not.toBeNull();
  });

  it("asks for the other two once only a phone is given", () => {
    const values = { emergencyContactPhone: "+1 415 555 0199" };
    expect(validateField("emergencyContactName", values)).not.toBeNull();
    expect(
      validateField("emergencyContactRelationship", values),
    ).not.toBeNull();
  });

  it("checks the contact phone like any other number", () => {
    expect(
      validateField("emergencyContactPhone", {
        ...filled,
        emergencyContactPhone: "+1 415",
      }),
    ).not.toBeNull();
  });

  it("turns required the moment one of the three is answered", () => {
    expect(isFieldRequired("emergencyContactRelationship", {})).toBe(false);
    expect(
      isFieldRequired("emergencyContactRelationship", {
        emergencyContactName: "Kofi",
      }),
    ).toBe(true);
  });

  it("leaves static required flags alone outside emergency contact", () => {
    expect(isFieldRequired("firstName", {})).toBe(true);
    expect(isFieldRequired("middleName", {})).toBe(false);
    expect(isFieldRequired("religion", {})).toBe(false);
  });

  it("passes when all three are given", () => {
    expect(validateField("emergencyContactName", filled)).toBeNull();
    expect(validateField("emergencyContactRelationship", filled)).toBeNull();
    expect(validateField("emergencyContactPhone", filled)).toBeNull();
  });
});

describe("steps and totals", () => {
  it("reports only the errors on the step being validated", () => {
    const errors = validateStep(2, {});
    expect(Object.keys(errors).sort()).toEqual(["address", "email", "phone"]);
  });

  it("lets an empty religion through step 3", () => {
    const errors = validateStep(3, {});
    expect(Object.keys(errors).sort()).toEqual([
      "nationality",
      "preferredLanguage",
    ]);
  });

  it("passes a complete form", () => {
    expect(validateAll(complete)).toEqual({});
  });

  it("counts answered fields, optional ones included", () => {
    expect(countAnswered(complete)).toBe(10);
    expect(countAnswered({ ...complete, middleName: "Akua" })).toBe(11);
  });

  it("counts a settled optional field as answered", () => {
    expect(
      countAnswered(complete, ["middleName", "emergencyContactName"]),
    ).toBe(12);
  });

  it("counts required answers per step for the step footer", () => {
    expect(countRequiredAnswered({ phone: "+1 415 555 0148" }, 2)).toEqual({
      answered: 1,
      total: 3,
    });
    expect(countRequiredAnswered(complete)).toEqual({ answered: 9, total: 9 });
  });
});
