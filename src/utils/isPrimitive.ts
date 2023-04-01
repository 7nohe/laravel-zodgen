export const isPrimitive = (ruleName: string) => {
  return ["string", "number", "bigint", "boolean", "date"].includes(ruleName);
};
