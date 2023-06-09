#!/usr/bin/env node
import { generate } from "./generate";
import { Command } from "commander";
import packageJson from "../package.json";
import { defaultFormRequestPath, defaultOutputPath } from "./constants";
import { CLIOptions } from "./types";

const program = new Command();

program
  .name("laravel-zodgen")
  .version(packageJson.version)
  .description("Generate Zod schemas from Laravel FormRequests")
  .option("-o, --output <value>", "Output directory", defaultOutputPath)
  .option(
    "--form-request-path",
    "Path for Laravel's FormRequest classes",
    defaultFormRequestPath
  )
  .option("--coercion", "Coercion for primitives", false)
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating zod code...`);

try {
  generate(options).then(() => {
    console.log(`Code generated successfully!!`);
  });
} catch {
  console.log("Failed to generate code.");
}
