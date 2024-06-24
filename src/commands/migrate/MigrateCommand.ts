import { Command } from "commander";
import { ICommand } from "../ICommand";
import { readFile } from "../../io";
import { AzureAdApplicationImportMapper, IImportMapper } from "./ImportMapper";

export type TFStateFile = {
    version: number;
    terraform_version: string;
    serial: number;
    lineage: string;
    resources: TFResource[];
};

export type TFResource = {
    mode: "data" | "managed";
    type: string;
    name: string;
    provider: string;
    instances: TFResourceInstance[];
};

export type TFResourceInstance = {
    schemaVersion: number;
    index_key: string;
    object_id: string;
    attributes: { [key: string]: any };
};

export type MigrateCommandOptions = {
    stateFile: string;
    environment: "prod" | "prod-test" | "test";
    project: string;
};

export class MigrateCommand implements ICommand {
    register(program: Command): void {
        program
            .command("migrate")
            .option("--state-file <string>", "Terraform state file")
            .option(
                "--environment <string>",
                "Environment (prod, prod-test, test)"
            )
            .option("--project <string>", "project (e.g. distribution)")
            .action((options: MigrateCommandOptions) => {
                const fileContents = readFile(options.stateFile);
                const state: TFStateFile = JSON.parse(fileContents);

                const mappers: { [type: string]: IImportMapper } = {
                    azuread_application: new AzureAdApplicationImportMapper(),
                };

                for (let resource of state.resources) {
                    if (mappers[resource.type]) {
                        const mapper = mappers[resource.type];
                        console.log(
                            mapper.generateImports(
                                options.environment,
                                options.project,
                                resource
                            )
                        );
                    }
                }
            });
    }
}
