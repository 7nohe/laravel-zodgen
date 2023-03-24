import fs from "fs";
import path from "path";
import { Engine } from "php-parser";

const parser = new Engine({
  parser: {
    extractDoc: true,
  },
});

export type GetRulesType = {
  formRequestPath: string
}

export const getRules = ({ formRequestPath }: GetRulesType) => {
  const code = fs.readFileSync(formRequestPath).toString();
  const ast = parser.parseCode(code, path.basename(formRequestPath));
  const rules = ast.children
    .filter((node) => node.kind === "method" && node.name === "rules")
    .flatMap((node) => node.body.children)
    .filter((node) => node.kind === "return")
    .flatMap((node) => node.expr.items)
    .map((node) => {
      const key = node.key.name;
      const value = node.value.value;
      return [key, value];
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  return rules;
};
