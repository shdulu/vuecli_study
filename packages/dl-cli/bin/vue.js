#!/usr/bin/env node

const program = require("commander");

const pkg = require("../package.json");

program.version(`dl-cli ${pkg.version}`).usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a new project powered by dl-cli-service")
  .action((appName) => {
    require("../lib/create")(appName);
  });

program.parse(process.argv);
