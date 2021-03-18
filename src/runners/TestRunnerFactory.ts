import { exists } from "fs";
import { join } from "path";
import { WorkspaceFolder } from "vscode";
import { ITestRunnerInterface } from "../interfaces/ITestRunnerInterface";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { TerminalProvider } from "../providers/TerminalProvider";
import { ReactScriptsTestRunner } from "./ReactScriptsTestRunner";
import { JestTestRunner } from "./JestTestRunner";
import { MochaTestRunner } from "./MochaTestRunner";
import { findNodeModules } from "../utils";

const terminalProvider = new TerminalProvider();

function doesFileExist(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    exists(filePath, (doesExist) => {
      resolve(doesExist);
    });
  });
}

async function getAvailableTestRunner(testRunners: ITestRunnerInterface[]): Promise<ITestRunnerInterface> {
  for (const runner of testRunners) {
    const doesRunnerExist = await doesFileExist(runner.binPath);

    if (doesRunnerExist) {
      return runner;
    }
  }

  throw new Error("No test runner in your project. Please install one.");
}

export async function getTestRunner(rootPath: WorkspaceFolder): Promise<ITestRunnerInterface> {
  const configurationProvider = new ConfigurationProvider(rootPath);
  const nodeModules = await findNodeModules(rootPath.uri.fsPath);
  const executableSuffix = process.platform === "win32" ? ".cmd" : "";

  const reactScriptsTestRunner = new ReactScriptsTestRunner({
    configurationProvider,
    terminalProvider,
    binPath: join(nodeModules, ".bin", "react-scripts" + executableSuffix),
  });

  const jestTestRunner = new JestTestRunner({
    configurationProvider,
    terminalProvider,
    binPath: join(nodeModules, ".bin", "jest" + executableSuffix),
  });

  const mochaTestRunner = new MochaTestRunner({
    configurationProvider,
    terminalProvider,
    binPath: join(nodeModules, ".bin", "mocha" + executableSuffix),
  });

  return getAvailableTestRunner([reactScriptsTestRunner, jestTestRunner, mochaTestRunner]);
}
