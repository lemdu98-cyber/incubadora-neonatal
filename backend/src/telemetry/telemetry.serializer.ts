export function serializeTelemetry<T extends { id: bigint; sequence: bigint }>(
  value: T,
) {
  return {
    ...value,
    id: value.id.toString(),
    sequence: value.sequence.toString(),
  };
}
