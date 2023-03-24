import { getRules, GetRulesType } from "./getRules";

export type CreateZodType = GetRulesType & {}

export const createZod = ({ formRequestPath }: GetRulesType) => {
  const rules = getRules({ formRequestPath });
  // TODO: create zod schema code here
}