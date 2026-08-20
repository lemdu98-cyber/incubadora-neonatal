export const INCUBATOR_STATUSES = [
  "AVAILABLE",
  "IN_USE",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
] as const;

export type IncubatorStatus = (typeof INCUBATOR_STATUSES)[number];

export const INCUBATOR_STATUS_LABELS: Record<IncubatorStatus, string> = {
  AVAILABLE: "Disponible",
  IN_USE: "En uso",
  MAINTENANCE: "Mantenimiento",
  OUT_OF_SERVICE: "Fuera de servicio",
};
