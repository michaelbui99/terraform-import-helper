import { TFResource, TFResourceInstance } from "./MigrateCommand";

export type LookupResult = {
    resource: TFResource;
    instance: TFResourceInstance;
}

export interface IImportContext {
    lookupResourcesByDependency(query: string): LookupResult[];
}


export class ImportContext implements IImportContext {
    private resources: TFResource[];

    constructor(resources: TFResource[]) {
        this.resources = resources ?? [];
    }

    lookupResourcesByDependency(query: string): LookupResult[] {
        let res: LookupResult[] = [];

        for (let resource of this.resources) {
            for (let instance of resource.instances) {
                if (!instance.dependencies) {
                    continue;
                }

                if (instance.dependencies.some(dep => dep.includes(query))) {
                    res.push({
                        resource,
                        instance
                    })
                }
            }
        }

        return res;
    }
}