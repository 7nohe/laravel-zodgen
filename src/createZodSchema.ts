import ts, {
  CallExpression,
  Identifier,
  PropertyAccessExpression,
} from "typescript";
import { CLIOptions } from "./cli";

type Field = { name: string; param?: string | number };
export type Rules = { [key: string]: string[] };
export type ParsedRules = { [key: string]: Field[] };

export type CreateZodSchemaType = Pick<CLIOptions, "coercion"> & {
  objectName: string;
  rules: Rules;
};

export const createZodSchema = ({
  objectName,
  rules,
  coercion,
}: CreateZodSchemaType) => {
  const zodRules = convertLaravelRulesToZodRules(rules);
  const propertyAssignments = Object.entries(zodRules).map(([key, value]) => {
    const firstValue = value.at(0);
    let property: CallExpression | Identifier | PropertyAccessExpression =
      coercion && firstValue && isPrimitive(firstValue.name)
        ? ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("z"),
            ts.factory.createIdentifier("coerce")
          )
        : ts.factory.createIdentifier("z");
    value.forEach((rule) => {
      property = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          property,
          ts.factory.createIdentifier(rule.name)
        ),
        undefined,
        rule.param
          ? [
              typeof rule.param === "number"
                ? ts.factory.createNumericLiteral(rule.param)
                : ts.factory.createStringLiteral(rule.param),
            ]
          : []
      );
    });
    return ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(key),
      property
    );
  });

  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(objectName),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("z"),
              ts.factory.createIdentifier("object")
            ),
            undefined,
            [
              ts.factory.createObjectLiteralExpression(
                propertyAssignments,
                true
              ),
            ]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
};

const convertLaravelRulesToZodRules = (rules: Rules) => {
  const zodRules: ParsedRules = Object.entries(rules).reduce(
    (acc, [key, value]) => {
      const newValue: Field[] = [];
      let isRequired = false;
      value.forEach((v) => {
        const parts = v.split(":");
        const method = parts[0];
        const args = parts[1] ?? "";
        let field: Field | undefined;
        switch (method) {
          case "required":
            isRequired = true;
            break;
          case "string":
            if (!newValue.find((v) => v.name === "string")) {
              newValue.unshift({ name: "string" });
            }
            break;
          case "date":
            if (!newValue.find((v) => v.name === "date")) {
              newValue.unshift({ name: "date" });
            }
            break;
          case "email":
            field = { name: "email" };
            if (!newValue.find((v) => v.name === "string")) {
              newValue.unshift({ name: "string" });
            }
            break;
          case "numeric":
            if (!newValue.find((v) => v.name === "numeric")) {
              newValue.unshift({ name: "numeric" });
            }
            break;
          case "decimal":
            if (!newValue.find((v) => v.name === "number")) {
              newValue.unshift({ name: "number" });
            }
            field = { name: "nonnegative" };
            break;
          case "nullable":
            field = { name: "nullable" };
            break;
          case "min":
            field = { name: "min", param: Number(args) };
            break;
          case "max":
            field = { name: "max", param: Number(args) };
            break;
          case "integer":
            if (!newValue.find((v) => v.name === "number")) {
              newValue.unshift({ name: "number" });
            }
            field = { name: "int" };
            break;
        }
        if (field) {
          newValue.push(field);
        }
      });
      if (!newValue.some((v) => isPrimitive(v.name))) {
        newValue.unshift({ name: "string" });
      }
      if (!isRequired) {
        newValue.push({ name: "optional" });
      }
      if (isRequired && newValue.find((v) => v.name === "string")) {
        newValue.push({ name: "nonempty" });
      }

      return {
        ...acc,
        [key]: newValue,
      };
    },
    {}
  );
  return zodRules;
};

const isPrimitive = (ruleName: string) => {
  return ["string", "number", "bigint", "boolean", "date"].includes(ruleName);
};
