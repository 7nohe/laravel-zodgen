import ts from "typescript";

export const createZodImport = () => {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("z"))
      ])
    ),
    ts.factory.createStringLiteral("zod"),
    undefined
  );
};
