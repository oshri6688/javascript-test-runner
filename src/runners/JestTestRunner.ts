import { debug, WorkspaceFolder } from "vscode";

import { ITestRunnerInterface } from "../interfaces/ITestRunnerInterface";
import { ITestRunnerOptions } from "../interfaces/ITestRunnerOptions";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { TerminalProvider } from "../providers/TerminalProvider";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
function escapeRegExp(text: string) {
  return text.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export class JestTestRunner implements ITestRunnerInterface {
  public name: string = "jest";
  public terminalProvider: TerminalProvider = null;
  public configurationProvider: ConfigurationProvider = null;
  public binPath: string;

  constructor({ terminalProvider, configurationProvider, binPath }: ITestRunnerOptions) {
    this.terminalProvider = terminalProvider;
    this.configurationProvider = configurationProvider;
    this.binPath = binPath;
  }

  public runTest(rootPath: WorkspaceFolder, fileName: string, testName: string) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider.environmentVariables;
    // We force slash instead of backslash for Windows
    const cleanedFileName = fileName.replace(/\\/g, "/");

    const command = `${this.binPath} ${cleanedFileName} --testNamePattern="${escapeRegExp(
      testName
    )}" ${additionalArguments}`;

    const terminal = this.terminalProvider.get({ env: environmentVariables }, rootPath);

    terminal.sendText(command, true);
    terminal.show(true);
  }

  public debugTest(rootPath: WorkspaceFolder, fileName: string, testName: string) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider.environmentVariables;
    // We force slash instead of backslash for Windows
    const cleanedFileName = fileName.replace(/\\/g, "/");

    debug.startDebugging(rootPath, {
      name: "Debug Test",
      type: "node",
      request: "launch",
      args: [cleanedFileName, `--testNamePattern`, testName, "--runInBand", ...additionalArguments.split(" ")],
      env: environmentVariables,
      console: "integratedTerminal",
      program: "${workspaceFolder}/node_modules/jest/bin/jest.js",
    });
  }
}
