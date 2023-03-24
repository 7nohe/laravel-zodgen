#!/usr/bin/env node
import { generate } from "./generate";
import { Command } from "commander";
import packageJson from "../package.json";
import {  defaultOutputPath } from "./constants";

export type CLIOptions = {
  output: string;
};

const program = new Command();

program
  .name("laravel-zodgen")
  .version(packageJson.version)
  .description("Generate TypeScript types from your Laravel code")
  .option("-o, --output <value>", "Output directory", defaultOutputPath)
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating zod code...`);

try {
  generate(options).then(() => {
    console.log(`Code generated successfully!!`);
  });
} catch {
  console.log('Failed to generate code.')
}
