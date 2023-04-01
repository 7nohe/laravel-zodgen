import ts, {
  CallExpression,
  Identifier,
  PropertyAccessExpression,
} from "typescript";
import { CLIOptions } from "./cli";
import { isPrimitive } from "./utils/isPrimitive";
import { AnyObject, mergeObjects } from "./utils/mergeObjects";

type Field = { name: string; param?: string | number; children?: Field };
export type Rules = { [key: string]: string[] };
export type ParsedRules = Record<string, Field[] | Record<string, any>>;

export type CreateZodSchemaType = Pick<CLIOptions, "coercion"> & {
  objectName: string;
  rules: Rules;
};

const parseRules = (rules: Rules) => {
  const parsedRules: ParsedRules = Object.entries(rules).reduce(
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
  let mergedResult: ParsedRules = {};
  for (const key in parsedRules) {
    const value = parsedRules[key];
    const keys = key.split(".").reverse();
    let result: AnyObject = value;
    for (const k of keys) {
      result = {
        [k]: result,
      };
    }
    mergedResult = mergeObjects(mergedResult, result);
  }
  return mergedResult;
};

const convertRulesToSchema = (
  rules: ParsedRules | Field[],
  coercion: boolean
): ts.Expression => {
  if (Array.isArray(rules)) {
    const firstValue = rules.at(0);
    let property: CallExpression | Identifier | PropertyAccessExpression =
      coercion && firstValue && isPrimitive(firstValue.name)
        ? ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("z"),
            ts.factory.createIdentifier("coerce")
          )
        : ts.factory.createIdentifier("z");
    rules.forEach((rule) => {
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
    return property;
  }
  if (typeof rules === "object" && rules !== null) {
    const [firstKey, firstValue] = Object.entries(rules).at(0) ?? [];
    // array input validation
    // eg: 'person.*.email'
    if (firstKey === "*" && firstValue && !Array.isArray(firstValue)) {
      const schema = convertRulesToSchema(firstValue, coercion);
      return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier("z"),
          ts.factory.createIdentifier("array")
        ),
        undefined,
        [schema]
      );
    }
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("z"),
        ts.factory.createIdentifier("object")
      ),
      undefined,
      [
        ts.factory.createObjectLiteralExpression(
          Object.entries(rules).map(([k, v]) => {
            const schema = convertRulesToSchema(v, coercion);
            return ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier(k),
              schema
            );
          }),
          true
        ),
      ]
    );
  }

  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("z"),
      ts.factory.createIdentifier("any")
    ),
    undefined,
    []
  );
};

export const createZodSchema = ({
  objectName,
  rules,
  coercion,
}: CreateZodSchemaType) => {
  // Parse Laravel validation rules into data for generating Zod schema code
  const parsedRules = parseRules(rules);

  // Convert parsed rules into Zod schema code
  const schema = convertRulesToSchema(parsedRules, coercion);

  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(objectName),
          undefined,
          undefined,
          schema
        ),
      ],
      ts.NodeFlags.Const
    )
  );
};
