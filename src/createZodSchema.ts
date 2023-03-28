import ts, { CallExpression, Identifier } from "typescript";

export type Rules = { [key: string]: string[] };

export type CreateZodSchemaType = {
  objectName: string;
  rules: Rules;
};

export const createZodSchema = ({ objectName, rules }: CreateZodSchemaType) => {
  const zodRules = convertLaravelRulesToZodRules(rules);
  const propertyAssignments = Object.entries(zodRules).map(([key, value]) => {
    let property: CallExpression | Identifier =
      ts.factory.createIdentifier("z");
    value.forEach((rule) => {
      const [ruleName, param] = rule.split(":");
      property = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          property,
          ts.factory.createIdentifier(ruleName)
        ),
        undefined,
        param
          ? [
              /^\d+(\.\d+)?$/.test(param)
                ? ts.factory.createNumericLiteral(param)
                : ts.factory.createStringLiteral(param),
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
  const zodRules: Rules = Object.entries(rules).reduce((acc, [key, value]) => {
    const newValue: string[] = [];
    let isRequired = false;
    value.forEach((v) => {
      const parts = v.split(":");
      const method = parts[0];
      const args = parts[1] ?? "";
      let field: string | undefined;
      switch (method) {
        case "required":
          isRequired = true;
          break;
        case "string":
          if (!newValue.includes("string")) {
            newValue.unshift("string");
          }
          break;
        case "date":
          if (!newValue.includes("date")) {
            newValue.unshift("date");
          }
          break;
        case "email":
          field = "email";
          if (!newValue.includes("string")) {
            newValue.unshift("string");
          }
          break;
        case "numeric":
          if (!newValue.includes("number")) {
            newValue.unshift("number");
          }
          break;
        case "decimal":
          if (!newValue.includes("number")) {
            newValue.unshift("number");
          }
          field = "nonnegative"
          break;
        case "nullable":
          field = "nullable";
          break;
        case "min":
          field = "min";
          break;
        case "max":
          field = "max";
          break;
        case "integer":
          if (!newValue.includes("number")) {
            newValue.push("number");
          }
          field = "int";
          break;
      }
      if (field) {
        newValue.push(field + (args ? ":" + args : ""));
      }
    });
    if (!newValue.some(isPrimitive)) {
      newValue.unshift("any");
    }
    if (!isRequired) {
      newValue.push("optional");
    }
    return {
      ...acc,
      [key]: newValue,
    };
  }, {});
  return zodRules;
};

const isPrimitive = (ruleName: string) => {
  return ["string", "number", "bigint", "boolean", "date", "symbol"].includes(
    ruleName
  );
};
