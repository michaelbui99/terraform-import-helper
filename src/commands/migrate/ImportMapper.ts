import { TFResource } from "./MigrateCommand";

export interface IImportMapper {
    handles(resourceType: string): boolean;
    generateImports(
        env: "prod" | "prod-test" | "test",
        project: string,
        resouce: TFResource
    ): string;
}

export class AzureAdApplicationImportMapper implements IImportMapper {
    handles(resourceType: string): boolean {
        return resourceType == "azuread_application";
    }

    generateImports(
        env: "prod" | "prod-test" | "test",
        project: string,
        resource: TFResource
    ): string {
        let output = "";

        for (let instance of resource.instances) {
            const moduleName = instance.index_key
                ? instance.index_key.replaceAll("-", "_")
                : instance.attributes["display_name"].split(
                      `${project}-${env}-`
                  )[1];
            const to = `module.${env}.module.${moduleName}.${resource.type}.${resource.name}`;
            const id = instance.attributes["id"];

            output += `{
                to = ${to}
                id = ${id}
            }\n`;
        }

        return output;
    }
}
