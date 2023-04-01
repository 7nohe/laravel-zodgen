import { CLIOptions } from "./cli";
import path from "path";
import { getRules } from "./getRules";
import fs from "fs";
import glob from "glob";
import { defaultFormRequestPath } from "./constants";
import { createZodSchema, Rules } from "./createZodSchema";
import ts from "typescript";
import { createZodImport } from "./createZodImport";

export async function generate({
  formRequestPath,
  output,
  coercion,
}: CLIOptions) {
  const parsedFormRequestsPath = path
    .join(formRequestPath, "**", "*.php")
    .replace(/\\/g, "/");
  const formRequests = glob.sync(parsedFormRequestsPath);
  const rules: { [key: string]: Rules } = formRequests.reduce(
    (acc, formRequest) => ({
      ...acc,
      [path.basename(formRequest, path.extname(formRequest))]: getRules({
        formRequestPath: formRequest,
      }),
    }),
    {}
  );
  const schemas = Object.entries(rules).map(([key, value]) =>
    createZodSchema({ objectName: key, rules: value, coercion })
  );
  const sourceFile = ts.factory.createSourceFile(
    [createZodImport(), ...schemas],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    sourceFile,
    ts.createSourceFile(
      "schema.ts",
      "",
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    )
  );
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }
  fs.writeFileSync(path.join(output, "schema.ts"), result);
}
