export class EnvironmentNamingMigrator {
    toNewEnvironmentNamingConvention(oldEnvironmentName: "prod" | "prodtest" | "test"): "prod" | "prod-test" | "test" {
        if (oldEnvironmentName === "prodtest") {
            return "prod-test";
        }

        return oldEnvironmentName;
    }
}