import { UNITS } from "@/lib/seed";
import type { UnitId } from "@/lib/types";

/** "/calendar?month=2026-10", with the unit when it is not the first one */
export const calendarHref = (month: string, unit?: UnitId) =>
  `/calendar?month=${month}${unit && unit !== UNITS[0].id ? `&unit=${unit}` : ""}`;
