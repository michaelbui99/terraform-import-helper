import { TFResourceInstance } from "./MigrateCommand";

export function extractModuleName(env: "prod" | "prodtest" | "test", project: string, instance: TFResourceInstance): string {
    // distribution-test-aftale-api -> ["", "aftale-api"] -> "aftale-api" -> "aftale_api"
    return instance.index_key
        ? instance.index_key.replaceAll("-", "_")
        : (
            instance.attributes["display_name"].split(
                `${project}-${env}-`
            )[1] as string
        ).replaceAll("-", "_");
}

export function importBlock(to: string, id: string): string {
    return `import {\n to = ${to}\n id = "${id}"\n}\n`;
}