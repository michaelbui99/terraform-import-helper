import { EnvironmentNamingMigrator } from "./EnvironmentNamingMigrator";
import { IImportContext } from "./ImportContext";
import { TFResource } from "./MigrateCommand";
import { extractModuleName, importBlock } from "./util";

export interface IImportMapper {
    context: IImportContext;
    handles(resourceType: string): boolean;
    generateImports(
        env: "prod" | "prodtest" | "test",
        roject: string,
        resource: TFResource
    ): string;
}

export class AzureAdApplicationImportMapper implements IImportMapper {
    context: IImportContext;

    constructor(context: IImportContext) {
        this.context = context;
    }

    handles(resourceType: string): boolean {
        return resourceType == "azuread_application";
    }

    generateImports(
        env: "prod" | "prodtest" | "test",
        project: string,
        resource: TFResource
    ): string {
        const environmentNamingMigrator = new EnvironmentNamingMigrator();
        let output = "";

        for (let instance of resource.instances) {
            const moduleName = extractModuleName(env, project, instance);

            let to = "";
            if (instance.attributes["display_name"] && instance.attributes["display_name"].includes("devx")) {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.devx_release_dashboard.module.${resource.name}.${resource.type}.${resource.name}`
            }
            else {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.${moduleName}.${resource.type}.${resource.name}`;
            }
            const id = instance.attributes["object_id"];

            output += importBlock(to, id);
        }

        return output;
    }
}

export class AzureAdServicePrincipalImportMapper implements IImportMapper {
    context: IImportContext;

    constructor(context: IImportContext) {
        this.context = context;
    }

    handles(resourceType: string): boolean {
        return resourceType === "azuread_service_principal";
    }
    generateImports(env: "prod" | "prodtest" | "test", project: string, resource: TFResource): string {
        const environmentNamingMigrator = new EnvironmentNamingMigrator();

        let output = "";

        for (let instance of resource.instances) {
            const moduleName = extractModuleName(env, project, instance);

            let to: string = "";
            if (moduleName.includes("_spa")) {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.${moduleName}.${resource.type}.user`;
            } else if (instance.attributes["display_name"] && instance.attributes["display_name"].includes("devx-bff")) {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.devx_release_dashboard.module.bff.${resource.type}.bff`
            } else if (instance.attributes["display_name"] && instance.attributes["display_name"].includes("devx-portal")) {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.devx_release_dashboard.module.portal.${resource.type}.user`
            } else {
                to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.${moduleName}.${resource.type}.${resource.name}`;
            }

            const id = instance.attributes["object_id"];

            output += importBlock(to, id);
        }

        return output;
    }
}

export class RandomUuidImportMapper implements IImportMapper {
    context: IImportContext;

    constructor(context: IImportContext) {
        this.context = context;
    }

    private moduleAppRolesIndexMap: { [project: string]: number } = {};

    handles(resourceType: string): boolean {
        return resourceType === "random_uuid";
    }
    generateImports(env: "prod" | "prodtest" | "test", _: string, resource: TFResource): string {
        const environmentNamingMigrator = new EnvironmentNamingMigrator();
        let output = "";

        for (let instance of resource.instances) {
            // aftale-api-read -> ["aftale", "api"] -> aftale_api
            if (instance.index_key) {
                const module = instance.index_key
                    .split("-")
                    .slice(0, -1)
                    .join("_");

                if (this.moduleAppRolesIndexMap[module] == undefined) {
                    this.moduleAppRolesIndexMap[module] = -1;
                }
                this.moduleAppRolesIndexMap[module] = this.moduleAppRolesIndexMap[module] + 1;

                const index = this.moduleAppRolesIndexMap[module];
                const to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.${module}.random_uuid.app_roles[${index}]`
                const id = instance.attributes["id"];

                output += importBlock(to, id);
            } else if (resource.name === "scope_id") {
                // scope_id is only used for DevX board related modules
                const to = `module.${environmentNamingMigrator.toNewEnvironmentNamingConvention(env)}.module.devx_release_dashboard.module.bff.random_uuid.${resource.name}`
                const id = instance.attributes["id"];

                output += importBlock(to, id);
            }
        }

        return output;
    }
}