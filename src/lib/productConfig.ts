/**
 * Product release and datasource switches. Change NEXT_PUBLIC_PRODUCT_VERSION to
 * "v2" when user accounts, plans, progress and AI should be released.
 *
 * Media/map adapters stay separate from UI components so any source can be
 * disabled without changing an exercise record or presentation code.
 */
export type ProductVersion = "v1" | "v2";
export type DataSourceId = "ymove" | "freeExerciseDb" | "repdb" | "openGym" | "muscleMap";

const version: ProductVersion =
  process.env.NEXT_PUBLIC_PRODUCT_VERSION === "v2" ? "v2" : "v1";

const disabled = new Set(
  (process.env.NEXT_PUBLIC_DISABLED_DATA_SOURCES ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

export const PRODUCT_CONFIG = {
  version,
  features: {
    userWorkspace: version === "v2",
    // AI remains opt-in even after the V2 workspace is enabled. Keep it off
    // for the current public release; set NEXT_PUBLIC_ENABLE_AI=true to enable.
    aiCoach: version === "v2" && process.env.NEXT_PUBLIC_ENABLE_AI === "true",
  },
  dataSources: {
    ymove: !disabled.has("ymove"),
    freeExerciseDb: !disabled.has("freeExerciseDb"),
    repdb: !disabled.has("repdb"),
    openGym: !disabled.has("openGym"),
    muscleMap: !disabled.has("muscleMap"),
  },
} as const;

export function isDataSourceEnabled(source: DataSourceId): boolean {
  return PRODUCT_CONFIG.dataSources[source];
}
