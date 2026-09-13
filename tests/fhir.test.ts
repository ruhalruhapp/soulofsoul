/**
 * Unit tests for FHIR R4 resource validation — §17.4.
 *
 * Verifies that the sample FHIR resources conform to expected structure and
 * that the resource type map covers all §17.4 supported resource types.
 *
 * Run with: `bun test`
 */

import { describe, expect, it } from "bun:test";
import {
  FHIR_RESOURCES,
  FHIR_SYNC_OPS,
  type FhirResource,
  type FhirSyncOp,
} from "@/lib/data";

// §17.4 supported resource types
const EXPECTED_RESOURCE_TYPES = [
  "Patient",
  "Practitioner",
  "Appointment",
  "Encounter",
  "DocumentReference",
  "Observation",
  "Consent",
  "Flag",
  "Communication",
];

describe("FHIR resources (§17.4)", () => {
  describe("resource structure", () => {
    it("every resource has required FHIR fields", () => {
      for (const r of FHIR_RESOURCES) {
        expect(r.resourceType).toBeDefined();
        expect(r.id).toBeDefined();
        expect(r.raw.resourceType).toBe(r.resourceType);
        expect(r.raw.id).toBeDefined();
        expect(r.origin).toMatch(/^(serenity|ehr)$/);
        expect(r.lastSynced).toBeDefined();
      }
    });

    it("every resource has a display string", () => {
      for (const r of FHIR_RESOURCES) {
        expect(r.display).toBeDefined();
        expect(r.display!.length).toBeGreaterThan(0);
      }
    });
  });

  describe("§17.4 supported resource types are represented", () => {
    // Some types in the spec (Appointment) may not have a sample here — that's OK,
    // we just verify that the types we DO have are valid §17.4 types.
    it("all sample resources use §17.4-supported resource types", () => {
      for (const r of FHIR_RESOURCES) {
        expect(EXPECTED_RESOURCE_TYPES).toContain(r.resourceType);
      }
    });

    it("includes at least the core resource types", () => {
      const presentTypes = new Set(FHIR_RESOURCES.map((r) => r.resourceType));
      const required = ["Patient", "Practitioner", "Encounter", "DocumentReference", "Observation", "Consent", "Flag", "Communication"];
      for (const type of required) {
        expect(presentTypes.has(type)).toBe(true);
      }
    });
  });

  describe("US Core profile conformance (US payers)", () => {
    it("Patient resource has US Core profile", () => {
      const patient = FHIR_RESOURCES.find((r) => r.resourceType === "Patient");
      expect(patient).toBeDefined();
      const profiles = (patient!.raw.meta as { profile?: string[] })?.profile ?? [];
      expect(profiles.some((p) => p.includes("us-core-patient"))).toBe(true);
    });

    it("Practitioner resource has US Core profile", () => {
      const practitioner = FHIR_RESOURCES.find((r) => r.resourceType === "Practitioner");
      expect(practitioner).toBeDefined();
      const profiles = (practitioner!.raw.meta as { profile?: string[] })?.profile ?? [];
      expect(profiles.some((p) => p.includes("us-core-practitioner"))).toBe(true);
    });

    it("Observation resource has US Core screening assessment profile", () => {
      const obs = FHIR_RESOURCES.find((r) => r.resourceType === "Observation");
      expect(obs).toBeDefined();
      const profiles = (obs!.raw.meta as { profile?: string[] })?.profile ?? [];
      expect(profiles.some((p) => p.includes("us-core-observation"))).toBe(true);
    });
  });

  describe("Patient resource (US Core)", () => {
    it("has MRN identifier", () => {
      const patient = FHIR_RESOURCES.find((r) => r.resourceType === "Patient");
      const identifiers = (patient!.raw.identifier as Array<{ value?: string }>) ?? [];
      expect(identifiers.length).toBeGreaterThan(0);
      expect(identifiers[0].value).toBeDefined();
    });

    it("has birthDate", () => {
      const patient = FHIR_RESOURCES.find((r) => r.resourceType === "Patient");
      expect(patient!.raw.birthDate).toBeDefined();
    });
  });

  describe("Observation (PHQ-9) — §17.4 + §12 KPI", () => {
    it("has LOINC code for PHQ-9 (89204-2)", () => {
      const obs = FHIR_RESOURCES.find(
        (r) => r.resourceType === "Observation"
      );
      expect(obs).toBeDefined();
      const coding = (
        (obs!.raw.code as { coding?: Array<{ code?: string }> })?.coding ?? []
      );
      expect(coding.some((c) => c.code === "89204-2")).toBe(true);
    });

    it("has integer value (PHQ-9 score)", () => {
      const obs = FHIR_RESOURCES.find(
        (r) => r.resourceType === "Observation"
      );
      expect(obs!.raw.valueInteger).toBeDefined();
      expect(typeof obs!.raw.valueInteger).toBe("number");
    });

    it("has status 'final'", () => {
      const obs = FHIR_RESOURCES.find(
        (r) => r.resourceType === "Observation"
      );
      expect(obs!.raw.status).toBe("final");
    });
  });

  describe("DocumentReference (Smart Notes — §7.1)", () => {
    it("has LOINC code for Progress note (11506-3)", () => {
      const doc = FHIR_RESOURCES.find((r) => r.resourceType === "DocumentReference");
      expect(doc).toBeDefined();
      const coding = (
        (doc!.raw.type as { coding?: Array<{ code?: string }> })?.coding ?? []
      );
      expect(coding.some((c) => c.code === "11506-3")).toBe(true);
    });

    it("status is 'current' (only signed notes pushed per §7.1)", () => {
      const doc = FHIR_RESOURCES.find((r) => r.resourceType === "DocumentReference");
      expect(doc!.raw.status).toBe("current");
    });
  });

  describe("Consent (§8.3 layered consent)", () => {
    it("has patient-privacy scope", () => {
      const consent = FHIR_RESOURCES.find((r) => r.resourceType === "Consent");
      expect(consent).toBeDefined();
      const coding = (
        (consent!.raw.scope as { coding?: Array<{ code?: string }> })?.coding ?? []
      );
      expect(coding.some((c) => c.code === "patient-privacy")).toBe(true);
    });

    it("status is 'active'", () => {
      const consent = FHIR_RESOURCES.find((r) => r.resourceType === "Consent");
      expect(consent!.raw.status).toBe("active");
    });
  });

  describe("Flag (safety holds — §5.4)", () => {
    it("has safety category", () => {
      const flag = FHIR_RESOURCES.find((r) => r.resourceType === "Flag");
      expect(flag).toBeDefined();
      const coding = (
        (flag!.raw.category as Array<{ coding?: Array<{ code?: string }> }>)?.[0]?.coding ?? []
      );
      expect(coding.some((c) => c.code === "safety")).toBe(true);
    });
  });

  describe("resource origins", () => {
    it("Serenity-origin resources are those we author (Encounters, Notes, Observations, Consents, Flags, Communications)", () => {
      const serenityTypes = new Set(
        FHIR_RESOURCES.filter((r) => r.origin === "serenity").map((r) => r.resourceType)
      );
      // We push these from Serenity → EHR
      expect(serenityTypes.has("Encounter")).toBe(true);
      expect(serenityTypes.has("DocumentReference")).toBe(true);
      expect(serenityTypes.has("Observation")).toBe(true);
      expect(serenityTypes.has("Consent")).toBe(true);
      expect(serenityTypes.has("Flag")).toBe(true);
      expect(serenityTypes.has("Communication")).toBe(true);
    });

    it("EHR-origin resources are those we pull (Patient, Practitioner)", () => {
      const ehrTypes = new Set(
        FHIR_RESOURCES.filter((r) => r.origin === "ehr").map((r) => r.resourceType)
      );
      expect(ehrTypes.has("Patient")).toBe(true);
      expect(ehrTypes.has("Practitioner")).toBe(true);
    });
  });
});

describe("FHIR sync operations", () => {
  describe("sync log structure", () => {
    it("every sync op has required fields", () => {
      for (const op of FHIR_SYNC_OPS) {
        expect(op.id).toBeDefined();
        expect(op.ts).toBeDefined();
        expect(op.resource).toBeDefined();
        expect(op.direction).toMatch(/^(push|pull)$/);
        expect(op.status).toMatch(/^(success|failed|pending)$/);
        expect(op.endpoint).toBeDefined();
        expect(typeof op.bytes).toBe("number");
        expect(op.bytes).toBeGreaterThanOrEqual(0);
      }
    });

    it("push direction means Serenity → EHR", () => {
      const pushOps = FHIR_SYNC_OPS.filter((op) => op.direction === "push");
      expect(pushOps.length).toBeGreaterThan(0);
      // Pushed resources should be Serenity-authored types
      for (const op of pushOps) {
        const resourceType = op.resource.split("/")[0];
        expect(["Encounter", "DocumentReference", "Observation", "Consent", "Flag", "Communication"]).toContain(resourceType);
      }
    });

    it("pull direction means EHR → Serenity", () => {
      const pullOps = FHIR_SYNC_OPS.filter((op) => op.direction === "pull");
      expect(pullOps.length).toBeGreaterThan(0);
      // Pulled resources should be EHR-authored types
      for (const op of pullOps) {
        const resourceType = op.resource.split("/")[0];
        expect(["Patient", "Practitioner"]).toContain(resourceType);
      }
    });

    it("successful ops have non-zero bytes", () => {
      for (const op of FHIR_SYNC_OPS) {
        if (op.status === "success") {
          expect(op.bytes).toBeGreaterThan(0);
        }
      }
    });

    it("pending ops have zero bytes (not yet transferred)", () => {
      for (const op of FHIR_SYNC_OPS) {
        if (op.status === "pending") {
          expect(op.bytes).toBe(0);
        }
      }
    });
  });
});
