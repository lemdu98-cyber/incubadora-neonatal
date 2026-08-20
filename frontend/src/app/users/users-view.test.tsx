import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserDetails } from "./[id]/page";
import { EmptyUsers, ErrorState, UsersTable } from "./page";

const user = { id: "00000000-0000-4000-8000-000000000003", email: "doctor@hospital.com", firstName: "Juan", lastName: "Pérez", status: "ACTIVE" as const, roles: ["DOCTOR" as const] };

describe("Users views", () => {
  it("muestra la lista administrativa y sólo la acción de detalle", () => {
    render(<UsersTable users={[user]} />);
    expect(screen.getAllByText("Juan Pérez").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DOCTOR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ver detalle").length).toBeGreaterThan(0);
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
  });

  it("muestra el estado vacío", () => {
    render(<EmptyUsers />);
    expect(screen.getByText("No hay usuarios registrados.")).toBeInTheDocument();
  });

  it("muestra un error seguro de backend", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toHaveTextContent("No fue posible cargar los usuarios.");
  });

  it("muestra detalle sin credenciales ni metadata interna", () => {
    render(<UserDetails user={user} />);
    expect(screen.getAllByText("Juan Pérez").length).toBeGreaterThan(0);
    expect(screen.getByText(user.id)).toBeInTheDocument();
    expect(screen.queryByText(/password|jwt|metadata/i)).not.toBeInTheDocument();
  });
});
