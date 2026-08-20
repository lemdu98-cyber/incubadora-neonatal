export const INCUBATOR_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const;

export type IncubatorStatusValue = (typeof INCUBATOR_STATUSES)[number];
