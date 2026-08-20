import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const signInWithPassword = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword } }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

describe("Login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza email, contraseña y acceso sin registro público", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByText(/crear cuenta/i)).not.toBeInTheDocument();
  });

  it("muestra un error genérico para credenciales inválidas", async () => {
    signInWithPassword.mockResolvedValue({ error: new Error("internal") });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "incorrecta" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
  });

  it("redirige una sesión válida al dashboard", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: " ADMIN@EXAMPLE.COM " } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "segura123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "admin@example.com", password: "segura123" });
  });
});
