import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { NewUserForm } from "./user-form";

const createUserMock = vi.fn();
const getSession = vi.fn();
const signOut = vi.fn();
vi.mock("@/lib/api", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/api")>()), createUser: (...args: unknown[]) => createUserMock(...args) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { getSession, signOut } }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

const created = { id: "00000000-0000-4000-8000-000000000003", email: "doctor@hospital.com", firstName: "Juan", lastName: "Pérez", status: "ACTIVE", roles: ["DOCTOR"], temporaryPassword: "Aa1!temporary-secret" };

function fillValidForm(selectRole = true) {
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "doctor@hospital.com" } });
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Juan" } });
  fireEvent.change(screen.getByLabelText("Apellido"), { target: { value: "Pérez" } });
  if (selectRole) fireEvent.click(screen.getByLabelText("DOCTOR"));
}

describe("NewUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } } });
    createUserMock.mockResolvedValue(created);
  });

  it("renderiza todos los campos y roles permitidos", () => {
    render(<NewUserForm />);
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    for (const role of ["ADMIN", "DOCTOR", "NURSE", "TECHNICIAN"]) expect(screen.getByLabelText(role)).toBeInTheDocument();
  });

  it("rechaza un email inválido", async () => {
    render(<NewUserForm />); fillValidForm();
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "invalido" } });
    fireEvent.submit(screen.getByRole("button", { name: "Crear usuario" }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Revisa los datos ingresados.");
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("exige al menos un rol", async () => {
    render(<NewUserForm />); fillValidForm(false);
    fireEvent.submit(screen.getByRole("button", { name: "Crear usuario" }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Selecciona al menos un rol.");
  });

  it("crea el usuario y mantiene la contraseña sólo en memoria", async () => {
    const localSpy = vi.spyOn(Storage.prototype, "setItem");
    render(<NewUserForm />); fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Usuario creado correctamente");
    expect(screen.getByText("••••••••••••••••")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar" }));
    expect(screen.getByText(created.temporaryPassword)).toBeInTheDocument();
    expect(localSpy).not.toHaveBeenCalled();
  });

  it.each([
    [409, "Ya existe un usuario con ese correo."],
    [403, "No tienes permisos para crear usuarios."],
    [502, "El servicio de autenticación no está disponible."],
  ])("mapea el error HTTP %s", async (status, message) => {
    createUserMock.mockRejectedValue(new ApiError(status));
    render(<NewUserForm />); fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message));
  });
});
