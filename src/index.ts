import { Command } from "commander";
import { commands } from "./commands";

const program = new Command();
program
    .name("terraform-import-helper")
    .description("Utility CLI for work specific migration")
    .version("0.1.0");

commands.forEach((command) => command.register(program));

program.parse();
