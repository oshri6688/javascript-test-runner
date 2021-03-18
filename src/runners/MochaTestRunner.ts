import { debug, WorkspaceFolder } from "vscode";

import { ITestRunnerInterface } from "../interfaces/ITestRunnerInterface";
import { ITestRunnerOptions } from "../interfaces/ITestRunnerOptions";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { TerminalProvider } from "../providers/TerminalProvider";

export class MochaTestRunner implements ITestRunnerInterface {
  public name: string = "mocha";
  public terminalProvider: TerminalProvider = null;
  public configurationProvider: ConfigurationProvider = null;
  public binPath: string;

  constructor({ terminalProvider, configurationProvider, binPath }: ITestRunnerOptions) {
    this.terminalProvider = terminalProvider;
    this.configurationProvider = configurationProvider;
    this.binPath = binPath;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  private escapeRegExp(testName: string): string {
    return testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  public runTest(rootPath: WorkspaceFolder, fileName: string, testName: string) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider.environmentVariables;

    testName = this.escapeRegExp(testName);

    const command = `${this.binPath} ${fileName} --grep="${testName}" ${additionalArguments}`;
    const terminal = this.terminalProvider.get({ env: environmentVariables }, rootPath);

    terminal.sendText(command, true);
    terminal.show(true);
  }

  public debugTest(rootPath: WorkspaceFolder, fileName: string, testName: string) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider.environmentVariables;

    debug.startDebugging(rootPath, {
      args: [fileName, "--grep", this.escapeRegExp(testName), "--no-timeout", ...additionalArguments.split(" ")],
      console: "integratedTerminal",
      env: environmentVariables,
      name: "Debug Test",
      program: "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      request: "launch",
      type: "node",
    });
  }
}
