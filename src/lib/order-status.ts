import { shopConfig } from "./config";

export const orderStages = ["placed", "confirmed", "shipped"] as const;
export type OrderStage = (typeof orderStages)[number];

export const stageLabels: Record<OrderStage, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
};

/** Mock status: advances with the time elapsed since the order was placed. */
export function stageAt(placedAt: string | Date, now: Date = new Date()): OrderStage {
  const minutes = (now.getTime() - new Date(placedAt).getTime()) / 60_000;
  const { confirmed, shipped } = shopConfig.orderStatusMinutes;
  if (minutes >= shipped) return "shipped";
  if (minutes >= confirmed) return "confirmed";
  return "placed";
}
