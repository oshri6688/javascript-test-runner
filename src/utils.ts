import { exec } from "child_process";
import { realpath } from "fs";
import { promisify } from "util";
import { join } from "path";

const asyncExec = promisify(exec);
const asyncRealpath = promisify(realpath);

export async function findNodeModules(workspaceRoot: string) {
  try {
    let result: { stdout: string; stderr: string };
    switch (process.platform) {
      case "win32":
        result = await asyncExec('cmd /C "npm bin"', { cwd: workspaceRoot });
        break;
      case "linux":
        result = await asyncExec('sh -c "npm bin"', { cwd: workspaceRoot });
        break;
      default:
        result = await asyncExec('sh -c "npm bin"', { cwd: workspaceRoot });
        break;
    }
    return await asyncRealpath(join(result.stdout, ".."));
  } catch (err) {
    throw new Error(`command "npm bin" fail: ${err}`);
  }
}
