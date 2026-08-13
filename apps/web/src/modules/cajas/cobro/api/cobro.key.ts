export const cobroKeys = {
  all: ["cobros"] as const,
  lists: () => [...cobroKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...cobroKeys.lists(), params] as const,
  details: () => [...cobroKeys.all, "detail"] as const,
  detail: (id: number) => [...cobroKeys.details(), id] as const,
};
