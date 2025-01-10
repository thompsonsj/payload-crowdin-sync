import type { Field } from "payload";
import { isLocalizedField } from ".";

describe("fn: isLocalizedField", () => {
  it("excludes a select localized field", () => {
    const field: Field = {
      name: "select",
      type: "select",
      localized: true,
      options: ["one", "two"],
    };
    expect(isLocalizedField(field)).toBe(false);
  });
});
