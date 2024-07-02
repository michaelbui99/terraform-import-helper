import { TFResourceInstance } from "./MigrateCommand";

export function extractModuleName(env: "prod" | "prodtest" | "test", project: string, instance: TFResourceInstance, attribute?: string): string {
  // distribution-test-aftale-api -> ["", "aftale-api"] -> "aftale-api" -> "aftale_api"
  if (attribute) {
    return instance.attributes[attribute].split(`${project}-${env}-`)[1].replaceAll("-", "_");
  }

  return instance.index_key
    ? instance.index_key.replaceAll("-", "_")
    : (
      instance.attributes[attribute ?? "display_name"].split(
        `${project}-${env}-`
      )[1] as string
    ).replaceAll("-", "_");
}

export function extractGroupAssignmentModuleName(instance: TFResourceInstance) {
  const principalDisplayName: string = instance.attributes["principal_display_name"] as string;

  // "afstemning-spa-MobileWeb_AfstemTurTst_Administrator" -> ['afstemning-spa', ''] -> afsteming-spa ->  afstemning_spa
  return instance.index_key.split(`-${principalDisplayName}`)[0].split("-").join("_");
}

export function importBlock(to: string, id: string): string {
  return `import {\n to = ${to}\n id = "${id}"\n}\n`;
}
