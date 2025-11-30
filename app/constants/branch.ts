export const AGGREGATION_TYPE = {
  cumulative: "累計",
  periodic: "期別",
} as const;

export const AGGREGATION_INTERVAL = {
  quarterly: "四半期",
  "half-yearly": "半期",
} as const;

export type AggregationType = keyof typeof AGGREGATION_TYPE;
export type AggregationInterval = keyof typeof AGGREGATION_INTERVAL;
