import fs from "fs";
import path from "path";

export function readFile(filePath: string): string {
    const resolvedPath = path.resolve(filePath);
    return fs.readFileSync(resolvedPath, "utf-8");
}
