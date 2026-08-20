import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "./api";

vi.mock("./env", () => ({ getPublicEnv: () => ({ apiUrl: "http://backend.test" }) }));

describe("API client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("consulta /auth/me con Bearer sin persistir otra copia del JWT", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "id", email: "admin@example.com", profile: null, roles: ["ADMIN"] }), { status: 200 }));
    await getCurrentUser("access-token");
    expect(fetchMock).toHaveBeenCalledWith("http://backend.test/auth/me", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });
});
