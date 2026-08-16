import { describe, expect, it } from "vitest";
import { getObjectIdOrThrow, isValidObjectId } from "../server/utils/mongodb";

describe("mongodb helpers", () => {
  it("validates object ids", () => {
    expect(isValidObjectId("64b0a1b2c3d4e5f6a7b8c9d0")).toBe(true);
    expect(isValidObjectId("not-an-id")).toBe(false);
    expect(isValidObjectId(undefined)).toBe(false);
  });

  it("throws on invalid ids and returns valid ones", () => {
    expect(() => getObjectIdOrThrow("not-an-id")).toThrow();
    expect(getObjectIdOrThrow("64b0a1b2c3d4e5f6a7b8c9d0")).toBe("64b0a1b2c3d4e5f6a7b8c9d0");
  });
});