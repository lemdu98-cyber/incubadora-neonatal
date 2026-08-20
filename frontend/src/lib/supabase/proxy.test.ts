import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
vi.mock("@supabase/ssr", () => ({ createServerClient: () => ({ auth: { getClaims } }) }));
vi.mock("@/lib/env", () => ({ getPublicEnv: () => ({ supabaseUrl: "https://example.supabase.co", supabasePublishableKey: "public-key" }) }));
import { updateSession } from "./proxy";

describe("route protection", () => {
  it("redirige un usuario no autenticado fuera del dashboard", async () => {
    getClaims.mockResolvedValue({ data: { claims: null } });
    const response = await updateSession(new NextRequest("http://localhost/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("redirige un usuario no autenticado fuera de Usuarios", async () => {
    getClaims.mockResolvedValue({ data: { claims: null } });
    const response = await updateSession(new NextRequest("http://localhost/users"));
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });
});
