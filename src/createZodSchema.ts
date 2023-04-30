import ts, {
  CallExpression,
  Identifier,
  PropertyAccessExpression,
} from "typescript";
import { CLIOptions } from "./types";
import { isPrimitive } from "./utils/isPrimitive";
import { AnyObject, mergeObjects } from "./utils/mergeObjects";
import { arrayMark, requiredArrayMark } from "./constants";

type Field = { name: string; param?: string | number; children?: Field };
export type Rules = { [key: string]: string[] };
export type ParsedRules = Record<string, Field[] | Record<string, any>>;

export type CreateZodSchemaType = Pick<CLIOptions, "coercion"> & {
  objectName: string;
  rules: ParsedRules;
};

export const parseRules = (rules: Rules, onlyPrimitive: boolean = false) => {
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

      // return only primitive type
      if (onlyPrimitive) {
        let primitive = { name: 'any', isRequired }
        if (newValue.find(v => v.name === 'string')) {
          primitive = { name: 'string', isRequired }
        }
        if (newValue.find(v => v.name === 'number')) {
          primitive = { name: 'number', isRequired }
        }
        if (newValue.find(v => v.name === 'boolean')) {
          primitive = { name: 'boolean', isRequired }
        }
        return {
          ...acc,
          [key]: primitive
        }
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

const createZodChainingRules = (rules: Field[], coercion: boolean = false) => {
  const firstField = rules.at(0);
  let property: CallExpression | Identifier | PropertyAccessExpression =
    coercion && firstField && isPrimitive(firstField.name)
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
};

const createArraySchema = (
  args: ts.Identifier | ts.PropertyAccessExpression
) => {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("z"),
      ts.factory.createIdentifier("array")
    ),
    undefined,
    [args]
  );
};

const createArrayofObjectsSchema = (schema: ts.Expression) => {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("z"),
      ts.factory.createIdentifier("array")
    ),
    undefined,
    [schema]
  );
};

const convertRulesToSchema = (
  rules: ParsedRules | Field[],
  coercion: boolean
): ts.Expression => {
  if (Array.isArray(rules)) {
    return createZodChainingRules(rules, coercion);
  }
  if (typeof rules === "object" && rules !== null) {
    const [firstKey, firstValue] = Object.entries(rules).at(0) ?? [];
    // validation for array of primitive values
    // eg: 'ids.*'
    if (firstKey === arrayMark && firstValue && Array.isArray(firstValue)) {
      const args = createZodChainingRules(firstValue, coercion);
      return createArraySchema(args);
    }
    if (
      firstKey === requiredArrayMark &&
      firstValue &&
      Array.isArray(firstValue)
    ) {
      const args = createZodChainingRules(firstValue, coercion);
      return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          createArraySchema(args),
          ts.factory.createIdentifier("nonempty")
        ),
        undefined,
        []
      );
    }

    // validation for array of objects
    // eg: 'person.*.email'
    if (firstKey === arrayMark && firstValue && !Array.isArray(firstValue)) {
      const schema = convertRulesToSchema(firstValue, coercion);
      return createArrayofObjectsSchema(schema);
    }
    if (
      firstKey === requiredArrayMark &&
      firstValue &&
      !Array.isArray(firstValue)
    ) {
      const schema = convertRulesToSchema(firstValue, coercion);
      return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          createArrayofObjectsSchema(schema),
          ts.factory.createIdentifier("nonempty")
        ),
        undefined,
        []
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

  // Convert parsed rules into Zod schema code
  const schema = convertRulesToSchema(rules, coercion);

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
