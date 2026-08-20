import { beforeEach, describe, expect, it, vi } from "vitest";
import { getIncubator, getPatient } from "./api";

vi.mock("@/lib/env", () => ({
  getPublicEnv: () => ({ apiUrl: "http://localhost:3001" }),
}));

describe("getIncubator", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uses the real UUID and sends the Bearer access token", async () => {
    const id = "00000000-0000-4000-8000-000000000009";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getIncubator(id, "real-access-token");

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3001/incubators/${id}`,
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Authorization: "Bearer real-access-token",
        }),
      }),
    );
  });
});

describe("getPatient", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uses the patient UUID and sends the Bearer access token", async () => {
    const id = "00000000-0000-4000-8000-000000000007";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getPatient(id, "patient-access-token");

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3001/patients/${id}`,
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Authorization: "Bearer patient-access-token",
        }),
      }),
    );
  });
});
