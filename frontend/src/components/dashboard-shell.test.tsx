import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";

const signOut = vi.fn();
const replace = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { signOut } }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh: vi.fn() }) }));

const user = { id: "id", email: "admin@example.com", profile: { firstName: "Ana", lastName: "Pérez", status: "ACTIVE" }, roles: ["ADMIN"] };

describe("Dashboard", () => {
  beforeEach(() => { vi.clearAllMocks(); signOut.mockResolvedValue({ error: null }); });

  it("muestra la opción Usuarios para ADMIN y el estado", () => {
    render(<DashboardShell user={user} backendConnected databaseConnected />);
    expect(screen.getAllByText("Usuarios").length).toBeGreaterThan(0);
    expect(screen.getByText("Bienvenido, Ana Pérez")).toBeInTheDocument();
    expect(screen.getAllByText("Conectado")).toHaveLength(2);
  });

  it("cierra Supabase antes de redirigir al login", async () => {
    render(<DashboardShell user={user} backendConnected databaseConnected />);
    fireEvent.click(screen.getAllByRole("button", { name: "Cerrar sesión" })[0]);
    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
