import fs from "fs";
import path from "path";
import { Class, Engine, Entry, Namespace, Return, String } from "php-parser";

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
  const namespace = ast.children.find(
    (child) => child.kind === "namespace"
  ) as Namespace;
  const classBlock = namespace.children.find(child => child.kind === "class") as Class;

  // @ts-ignore
  const rulesMethod = classBlock.body.find((node) => node.kind === "method" && node.name.name === "rules") as Method;
  // @ts-ignore
  const returnBlock = rulesMethod.body.children.find(child => child.kind === "return") as Return;

  // @ts-ignore
  const rules = returnBlock?.expr.items.reduce((acc, item) => {
    switch (item.value?.kind) {
      case "string":
        return {
          ...acc,
          [item.key.value]: item.value.value.split('|'),
        }
      case "array":
        return {
          ...acc,
          [item.key.value]: item.value.items.map((item: Entry) => (item.value as String).value).filter((v: any) => v)
        };
      default:
        return acc;   
    }
  }, {})

  return rules;
};
