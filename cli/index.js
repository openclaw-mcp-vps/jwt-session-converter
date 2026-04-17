#!/usr/bin/env node

const path = require("node:path");
const fs = require("fs-extra");
const { Command } = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");

const { detectJwtPatterns } = require("./analyzers/jwt-detector");
const { generateMigrationFiles } = require("./generators/session-migrator");

const program = new Command();

program
  .name("jwt-session-converter")
  .description("Convert JWT auth implementations to secure server-side sessions")
  .option("-p, --project <dir>", "Path to project to analyze", process.cwd())
  .option("-o, --out <dir>", "Output directory for generated migration files", "./jwt-session-migration")
  .option("--yes", "Skip interactive confirmation", false)
  .action(async (options) => {
    const projectDir = path.resolve(options.project);
    const outputDir = path.resolve(options.out);

    console.log(chalk.cyan("\nJWT Session Converter"));
    console.log(chalk.gray(`Project: ${projectDir}`));
    console.log(chalk.gray(`Output: ${outputDir}\n`));

    const exists = await fs.pathExists(projectDir);
    if (!exists) {
      console.error(chalk.red(`Project path does not exist: ${projectDir}`));
      process.exit(1);
    }

    if (!options.yes) {
      const response = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: "Run JWT usage analysis and generate session migration files?",
          default: true
        }
      ]);
      if (!response.proceed) {
        console.log(chalk.yellow("Cancelled."));
        process.exit(0);
      }
    }

    try {
      const analysis = await detectJwtPatterns(projectDir);

      console.log(chalk.green(`Scanned ${analysis.filesScanned} files.`));
      console.log(
        chalk.yellow(
          `Findings: high=${analysis.summary.high}, medium=${analysis.summary.medium}, low=${analysis.summary.low}`
        )
      );

      const generated = await generateMigrationFiles(outputDir, analysis);

      console.log(chalk.green("\nGenerated migration artifacts:"));
      console.log(chalk.white(`- ${generated.reportPath}`));
      console.log(chalk.white(`- ${generated.migrationPath}`));
      console.log(chalk.white(`- ${generated.templatesDir}`));
      console.log(chalk.cyan("\nNext step: apply templates into your auth stack and rerun analyzer after each milestone."));
    } catch (error) {
      console.error(chalk.red("CLI execution failed."));
      console.error(error instanceof Error ? error.stack : error);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
