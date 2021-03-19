import { stat as oldStat } from "fs";
import { promisify } from "util";
import { join, dirname } from "path";

const stat = promisify(oldStat);

export async function findNodeModules(workspaceFolder: string): Promise<string> {
  let next = workspaceFolder;

  for (;;) {
    const nodeModulesPath = join(next, "node_modules");
    try {
      if ((await stat(nodeModulesPath)).isDirectory()) {
        return nodeModulesPath;
      }
    } catch (err) {
      // ignore
    }

    if (next === dirname(next)) {
      throw new Error("node_modules not found in workspace and parent folder");
    }

    next = dirname(next);
  }
}
