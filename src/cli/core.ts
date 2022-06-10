import fs from "fs";

import { GitMerge } from "../git";
import { GitlabMerge } from "../gitlab";
import { QualityGate } from "../quality-gate";
import { Sonar } from "../sonar";
import { Log } from "../utils";
import { createOptions, Arguments, Provide } from "./options";
import { Shell } from "./shell";
import commandExistsSync from "command-exists";
import { GithubMerge } from "../github";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GIT_TOKEN: string;
      GIT_URL: string;
      SONAR_URL: string;
      SONAR_TOKEN: string;
      CI_PROJECT_ID: string;
      CI_COMMIT_SHA: string;
      CI_MERGE_REQUEST_IID: string;
      CI_PROJECT_DIR: string;
      GITHUB_EVENT_PATH: string;
      GITHUB_REPOSITORY: string;
    }
  }
}

const SONAR_SCANNER_CMD = "sonar-scanner";
export class Cli {
  argv: Arguments;
  exec: Shell;
  gitURL: string;
  gitToken: string;
  sonarToken: string;
  sonarURL: string;
  sonarProjectKey: string;
  gitProjectID: string;
  gitMergeID: string;

  constructor() {
    this.argv = createOptions();
    this.exec = new Shell();
    
    this.gitURL = this.argv.git.url ? this.argv.git.url : process.env.GIT_URL;
    this.gitToken = this.argv.git.token ? this.argv.git.token : process.env.GIT_TOKEN;
    this.gitProjectID = this.getProjectID(this.argv);
    this.gitMergeID = this.getMergeID(this.argv);
    this.sonarURL = this.argv.sonar.url ? this.argv.sonar.url : process.env.SONAR_URL;
    this.sonarToken = this.argv.sonar.token ? this.argv.sonar.token : process.env.SONAR_TOKEN;
    this.sonarProjectKey = this.argv.sonar.project_key;
    
    if (!this.validate()) {
      process.exit(1);
    }

    // check sonar-scanner installed
    if (!this.argv.skipScanner && !commandExistsSync.sync(SONAR_SCANNER_CMD)) {
      Log.error("sonar-scanner not installed! \nGo to https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/ to install sonar-scanner");
      process.exit(-1);
    }
  }

  run() {
    try {
      if (this.argv.skipScanner) {
        this.generateReport();
      } else {
        this.runSonarScanner((this.generateReport).bind(this));
      }
    } catch (e) {
      Log.error(e);
    }
  }

  private validate() {
    let isValid = true;
    if (!this.gitURL) {
      Log.error("Missing config git url.");
      isValid = false;
    }
    if (!this.gitToken) {
      Log.error("Missing config git token.");
      isValid = false;
    }
    if (!this.gitProjectID) {
      Log.error("Missing config git project id.");
      isValid = false;
    }
    if (!this.gitMergeID) {
      Log.error("Missing config git merge id.");
      isValid = false;
    }
    if (!this.sonarToken) {
      Log.error("Missing config sonar token.");
      isValid = false;
    }
    return isValid;
  }

  private generateReport() {
    const sonar = new Sonar({
      tokenKey: this.sonarToken,
      host: this.sonarURL,
      projectKey: this.sonarProjectKey
    });

    let gitMerge: GitMerge;
    if (this.argv.provide == Provide.Github) {
      gitMerge = new GithubMerge({
        host: this.gitURL,
        token: this.gitToken,
        projectID: this.gitProjectID,
        mergeRequestID: parseInt(this.gitMergeID)
      })
    } else {
      gitMerge = new GitlabMerge({
        host: this.gitURL,
        token: this.gitToken,
        projectID: this.gitProjectID,
        mergeRequestIID: parseInt(this.gitMergeID)
      });
    }

    const qualityGate = new QualityGate({
      sonar: sonar,
      gitMerge: gitMerge
    })

    qualityGate.handler().then(result => {
      if (!result) {
        Log.error("Quality Gate ran failed.");
        process.exit(1);
      }
      Log.info("Quality Gate ran successful.");
    }).catch(error => {
      Log.error(error);
    });
  }

  private runSonarScanner(callback: () => void) {
    const sonarScannerArgv = [];
    if (this.argv.define) {
      for (const i in this.argv.define) {
        sonarScannerArgv.push("-D" + this.argv.define[i]);
      }
    }
    return this.exec.run(SONAR_SCANNER_CMD, sonarScannerArgv, callback);
  }

  private getMergeID(argv: Arguments): string {
    if (argv.git.merge_id) {
      return argv.git.merge_id;
    }
    if (process.env.CI_MERGE_REQUEST_IID) {
      return process.env.CI_MERGE_REQUEST_IID
    }
    if (process.env.GITHUB_EVENT_PATH) {
      return this.getGithubPullNumber();
    }
    return "";
  }

  private getProjectID(argv: Arguments): string {
    if (argv.git.project_id) {
      return argv.git.project_id;
    }
    if (process.env.CI_PROJECT_ID) {
      return process.env.CI_PROJECT_ID;
    }
    if (process.env.GITHUB_REPOSITORY) {
      return process.env.GITHUB_REPOSITORY;
    }
    return "";
  }

  private getGithubPullNumber() {
    const ev = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )
    return ev.pull_request.number;
  }
}