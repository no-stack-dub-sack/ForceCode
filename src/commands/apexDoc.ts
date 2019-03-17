import { execSync } from 'child_process';
import * as vscode from 'vscode';

// define ApexDoc2 Config object
interface ApexDoc2Config {
  sourceDirectory: string;
  targetDirectory: string;
  sourceControlURL: string;
  homePagePath: string;
  bannerPagePath: string;
  scope: string[];
  title: string;
  showTOCSnippets: boolean;
  sortOrder: string;
};

export default function(): void {
  const config: ApexDoc2Config = getApexDocConfig();
  const command = buildCommand(config);
  execSync(command, { encoding: 'utf-8' });
}

function buildCommand(config: ApexDoc2Config): string {
  const apexDoc2 = vscode.window.forceCode.storageRoot + '\\assets\\ApexDoc2-1.0.0.jar';
  const sourceControlURL = config.sourceControlURL;
  const homePagePath = config.homePagePath;
  const bannerPagePath = config.bannerPagePath;

  const command = `
    java -jar ${apexDoc2}
      -s "${config.sourceDirectory}"
      -t "${config.targetDirectory}"
      -p ${config.scope.join(';')}
      -d "${config.title}"
      -c ${config.showTOCSnippets}
      -o ${config.sortOrder}
      ${sourceControlURL ? '-u "' + sourceControlURL + '"' : ''}
      ${homePagePath ? '-h "' + homePagePath + '"' : ''}
      ${bannerPagePath ? '-b "' + bannerPagePath + '"' : ''}
  `;

  return command.replace(/\s+/g, ' ');
}

function getApexDocConfig(): ApexDoc2Config {
  // Clone object when fetching config to avoid 'read only' field error when trying to overwrite defaults.
  const config: ApexDoc2Config = { ...vscode.workspace.getConfiguration('force')['apexDocConfig'] };

  // if user has not overridden defaults defined in package.json
  // or if has just not added these required fields, add them here
  if (config.sourceDirectory === '') {
    config.sourceDirectory = vscode.window.forceCode.projectRoot + '\\classes';
  }
  if (config.targetDirectory === '') {
    config.targetDirectory = vscode.window.forceCode.projectRoot + '\\documentation\\apex';
  }

  return config;
}