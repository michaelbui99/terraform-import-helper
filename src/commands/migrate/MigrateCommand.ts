import { Command } from "commander";
import { ICommand } from "../ICommand";
import { readFile } from "../../io";
import { AzureAdAppRoleAssignmentMapper, AzureAdApplicationImportMapper, AzureAdServicePrincipalDelegatedPermissionGrantImportMapper, AzureAdServicePrincipalImportMapper, IImportMapper, RandomUuidImportMapper } from "./ImportMapper";
import { ImportContext } from "./ImportContext";

export type TFStateFile = {
    version: number;
    terraform_version: string;
    serial: number;
    lineage: string;
    resources: TFResource[];
};

export type TFResource = {
    module?: string;
    mode: "data" | "managed";
    type: string;
    name: string;
    provider: string;
    instances: TFResourceInstance[];
};

export type TFResourceInstance = {
    schema_version: number;
    index_key: string;
    object_id: string;
    attributes: { [key: string]: any };
    dependencies?: string[];
};

export type MigrateCommandOptions = {
    // stateFile: string;
    environment: "prod" | "prodtest" | "test";
    project: string;
    filesConfig: string;
};

export type FilesConfig = {
    stateFiles: { [environment: string]: string[] };
}

export class MigrateCommand implements ICommand {
    register(program: Command): void {
        program
            .command("migrate")
            // .option("--state-file <string>", "Terraform state file")
            .option(
                "--environment <string>",
                "Environment (prod, prod-test, test)"
            )
            .option("--project <string>", "project (e.g. distribution)")
            .option("--files-config <string>", "Config file with state files list")
            .action((options: MigrateCommandOptions) => {
                const configContents = readFile(options.filesConfig);
                const config: FilesConfig = JSON.parse(configContents);

                console.log(`######### ${options.environment} imports #########`)
                for (let stateFile of config.stateFiles[options.environment]) {
                    const fileContents = readFile(stateFile);
                    const state: TFStateFile = JSON.parse(fileContents);
                    const context = new ImportContext(state.resources);

                    const mappers: { [type: string]: IImportMapper } = {
                        azuread_application: new AzureAdApplicationImportMapper(context),
                        azuread_service_principal: new AzureAdServicePrincipalImportMapper(context),
                        random_uuid: new RandomUuidImportMapper(context),
                        azuread_app_role_assignment: new AzureAdAppRoleAssignmentMapper(context),
                        azuread_service_principal_delegated_permission_grant: new AzureAdServicePrincipalDelegatedPermissionGrantImportMapper(context)
                    };

                    for (let resource of state.resources) {
                        if (resource.mode === "data") {
                            continue;
                        }

                        if (!mappers[resource.type]) {
                            continue;
                        }

                        try {
                            const mapper = mappers[resource.type];
                            console.log(
                                mapper.generateImports(
                                    options.environment,
                                    options.project,
                                    resource
                                )
                            );
                        } catch (err) {
                            console.warn(err);
                        }
                    }
                }
            });
    }
}
