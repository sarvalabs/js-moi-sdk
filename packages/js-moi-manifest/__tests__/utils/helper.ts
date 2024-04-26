import fs from "node:fs/promises";
import path from "node:path";
import type { LogicManifest } from "../../types/manifest";

export const loadFile = async (filepath: string) => {
    const file = path.resolve(__dirname, filepath);
    return await fs.readFile(file, "utf8");
}

export const loadManifestFromFile = async (filepath: string): Promise<LogicManifest.Manifest> => {
    const blob = await loadFile(filepath);
    return JSON.parse(blob);
}