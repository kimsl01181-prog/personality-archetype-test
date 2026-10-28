import dimensionsJson from "@/data/dimensions.json";
import itemsJson from "@/data/items.json";
import typesJson from "@/data/types.json";
import type { Dimension, Item, PersonalityType } from "./types";
import { countItemsPerDimension } from "./scoring";

export const dimensions = dimensionsJson as Dimension[];
export const items = itemsJson as Item[];
export const types = typesJson as PersonalityType[];
export const itemsPerDimension = countItemsPerDimension(items);

const typeById = new Map(types.map((t) => [t.id, t]));
export function getType(id: string): PersonalityType | undefined {
  return typeById.get(id);
}
