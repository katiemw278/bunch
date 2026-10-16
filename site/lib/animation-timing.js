export const POP_INTERVAL_MS = 800;
export const POP_LIFETIME_MS = 780;
export function boardSettleDelay(count) {
  return POP_LIFETIME_MS + Math.max(0, count - 1) * POP_INTERVAL_MS + 800;
}
