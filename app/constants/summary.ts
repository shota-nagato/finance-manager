export const HALF_PERIODS = {
  firstHalf: "上期",
  secondHalf: "下期",
} as const;

export type HalfPeriod = keyof typeof HALF_PERIODS;
