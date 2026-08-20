import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { DEVICE_STATUSES, DEVICE_TYPES } from "@/lib/device-options";
import { IncubatorDetails } from "../incubators/[id]/page";
import { DeviceDetails } from "./[id]/page";
import { DeviceForm } from "./device-form";
import { canCreateDevice, DeviceEmpty, DeviceError, DeviceList } from "./page";
const createDevice = vi.fn(),
  push = vi.fn();
vi.mock("@/lib/api", async (original) => ({
  ...(await original<typeof import("@/lib/api")>()),
  createDevice: (...a: unknown[]) => createDevice(...a),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { access_token: "token" } } }),
    },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
const incubator = {
    id: "00000000-0000-4000-8000-000000000009",
    code: "INC-001",
    name: "Incubadora 1",
    location: "UCIN",
    serialNumber: null,
    manufacturer: null,
    model: null,
    status: "AVAILABLE" as const,
    notes: null,
    createdAt: "2026-08-20T00:00:00Z",
    updatedAt: "2026-08-20T00:00:00Z",
  },
  device = {
    id: "00000000-0000-4000-8000-000000000011",
    hardwareUid: "A4-C1",
    code: "ESP32-001",
    deviceType: "ESP32" as const,
    incubatorId: incubator.id,
    status: "ACTIVE" as const,
    firmwareVersion: "1.0.0",
    lastSeenAt: null,
    notes: "Principal",
    createdAt: "2026-08-20T00:00:00Z",
    updatedAt: "2026-08-20T00:00:00Z",
    incubator,
  };
describe("Devices UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createDevice.mockResolvedValue(device);
  });
  it("exports runtime types and administrative states", () => {
    expect(DEVICE_TYPES).toEqual(["ESP32", "ESP8266", "OTHER"]);
    expect(DEVICE_STATUSES).toEqual(["ACTIVE", "MAINTENANCE", "DISABLED"]);
  });
  it("renders list and null lastSeenAt without saying Offline", () => {
    render(<DeviceList devices={[device]} />);
    expect(screen.getByText("Sin comunicación registrada")).toBeInTheDocument();
    expect(screen.queryByText("Offline")).not.toBeInTheDocument();
  });
  it("renders empty and error", () => {
    const { rerender } = render(<DeviceEmpty canCreate />);
    expect(
      screen.getByText("No hay dispositivos registrados."),
    ).toBeInTheDocument();
    rerender(<DeviceError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  it.each([
    ["ADMIN", true],
    ["TECHNICIAN", true],
    ["DOCTOR", false],
    ["NURSE", false],
  ])("applies create UX for %s", (role, allowed) =>
    expect(canCreateDevice({ roles: [role] })).toBe(allowed),
  );
  it("renders form types and preselects incubator", () => {
    render(
      <DeviceForm incubators={[incubator]} initialIncubatorId={incubator.id} />,
    );
    expect(screen.getByLabelText("Incubadora")).toHaveValue(incubator.id);
    expect(screen.getByRole("option", { name: "Otro" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Última comunicación"),
    ).not.toBeInTheDocument();
  });
  it("creates normalized device", async () => {
    render(<DeviceForm incubators={[incubator]} />);
    fireEvent.change(screen.getByLabelText("Identificador de hardware"), {
      target: { value: " a4-c1 " },
    });
    fireEvent.change(screen.getByLabelText("Código"), {
      target: { value: " esp32-001 " },
    });
    fireEvent.change(screen.getByLabelText("Incubadora"), {
      target: { value: incubator.id },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar dispositivo" }),
    );
    await waitFor(() =>
      expect(createDevice).toHaveBeenCalledWith(
        expect.objectContaining({
          hardwareUid: "A4-C1",
          code: "ESP32-001",
          incubatorId: incubator.id,
        }),
        "token",
      ),
    );
    expect(push).toHaveBeenCalledWith(`/devices/${device.id}`);
  });
  it("maps duplicate 409", async () => {
    createDevice.mockRejectedValue(new ApiError(409));
    render(<DeviceForm incubators={[incubator]} />);
    fireEvent.change(screen.getByLabelText("Identificador de hardware"), {
      target: { value: "A4" },
    });
    fireEvent.change(screen.getByLabelText("Código"), {
      target: { value: "D-1" },
    });
    fireEvent.change(screen.getByLabelText("Incubadora"), {
      target: { value: incubator.id },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar dispositivo" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("ya registrado");
  });
  it("renders the sensor inventory without MQTT", () => {
    render(<DeviceDetails device={device} />);
    expect(screen.getByText("A4-C1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sensores" })).toBeInTheDocument();
    expect(screen.queryByText("MQTT")).not.toBeInTheDocument();
  });
  it("integrates devices in incubator detail", () => {
    render(
      <IncubatorDetails
        incubator={incubator}
        devices={[device]}
        canManageDevices
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Dispositivos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Registrar dispositivo" }),
    ).toHaveAttribute("href", `/devices/new?incubatorId=${incubator.id}`);
  });
});
