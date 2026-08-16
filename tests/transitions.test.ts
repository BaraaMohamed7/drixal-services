import { describe, expect, it } from "vitest";
import type { CompanyStatus } from "../server/models/company.schema";
import type { ServiceOrderStatus } from "../server/models/service-order.schema";
import type { ServiceRequestStatus } from "../server/models/service-request.schema";
import {
  assertCompanyStatusTransition,
  assertOrderStatusTransition,
  assertRequestDecidable,
  companyStatusTransitions,
  orderCreateStatuses,
  orderStatusTransitions,
  requestDecidableSources,
} from "../server/utils/transitions";

describe("service request lifecycle", () => {
  it("allows deciding NEW, UNDER_REVIEW, and CONTACTED requests", () => {
    for (const source of requestDecidableSources) {
      expect(() => assertRequestDecidable(source)).not.toThrow();
    }
  });

  it("rejects deciding requests that are no longer open", () => {
    const terminal: ServiceRequestStatus[] = ["APPROVED", "REJECTED", "CONVERTED", "CANCELLED", "CLOSED"];
    for (const source of terminal) {
      expect(() => assertRequestDecidable(source)).toThrow();
    }
  });
});

describe("service order lifecycle", () => {
  it("restricts order creation to DRAFT or SCHEDULED", () => {
    expect(orderCreateStatuses).toEqual(["DRAFT", "SCHEDULED"]);
  });

  it("allows valid forward transitions", () => {
    const valid: Array<[ServiceOrderStatus, ServiceOrderStatus]> = [
      ["DRAFT", "SCHEDULED"],
      ["DRAFT", "CANCELLED"],
      ["SCHEDULED", "ASSIGNED"],
      ["SCHEDULED", "IN_PROGRESS"],
      ["ASSIGNED", "IN_PROGRESS"],
      ["IN_PROGRESS", "ON_HOLD"],
      ["IN_PROGRESS", "COMPLETED"],
      ["ON_HOLD", "IN_PROGRESS"],
    ];
    for (const [current, next] of valid) {
      expect(() => assertOrderStatusTransition(current, next)).not.toThrow();
    }
  });

  it("is idempotent when the status does not change", () => {
    for (const status of Object.keys(orderStatusTransitions) as ServiceOrderStatus[]) {
      expect(() => assertOrderStatusTransition(status, status)).not.toThrow();
    }
  });

  it("rejects invalid transitions", () => {
    const invalid: Array<[ServiceOrderStatus, ServiceOrderStatus]> = [
      ["DRAFT", "COMPLETED"],
      ["SCHEDULED", "COMPLETED"],
      ["COMPLETED", "IN_PROGRESS"],
      ["CANCELLED", "SCHEDULED"],
      ["ASSIGNED", "COMPLETED"],
    ];
    for (const [current, next] of invalid) {
      expect(() => assertOrderStatusTransition(current, next)).toThrow();
    }
  });
});

describe("company lifecycle", () => {
  it("allows valid review transitions", () => {
    const valid: Array<[CompanyStatus, CompanyStatus]> = [
      ["PENDING", "APPROVED"],
      ["PENDING", "REJECTED"],
      ["APPROVED", "SUSPENDED"],
      ["APPROVED", "REJECTED"],
      ["REJECTED", "APPROVED"],
      ["SUSPENDED", "APPROVED"],
      ["SUSPENDED", "REJECTED"],
    ];
    for (const [current, next] of valid) {
      expect(() => assertCompanyStatusTransition(current, next)).not.toThrow();
    }
  });

  it("is idempotent when the status does not change", () => {
    for (const status of Object.keys(companyStatusTransitions) as CompanyStatus[]) {
      expect(() => assertCompanyStatusTransition(status, status)).not.toThrow();
    }
  });

  it("rejects invalid transitions", () => {
    const invalid: Array<[CompanyStatus, CompanyStatus]> = [
      ["APPROVED", "PENDING"],
      ["PENDING", "SUSPENDED"],
      ["REJECTED", "SUSPENDED"],
    ];
    for (const [current, next] of invalid) {
      expect(() => assertCompanyStatusTransition(current, next)).toThrow();
    }
  });
});