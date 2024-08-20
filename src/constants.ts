export const ImmediatePriority = 1;
export const NormalPriority = 2;
export const LowPriority = 3;

export type PriorityLevel =
  | typeof ImmediatePriority
  | typeof NormalPriority
  | typeof LowPriority;
