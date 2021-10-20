import { GitlabMerge } from "../gitlab";
import { QualityGate } from "../quality-gate";
import { Sonar } from "../sonar";
import { Log } from "../utils";
import { createOptions, Arguments } from "./options";
import { Shell } from "./shell";
import commandExistsSync from "command-exists";

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
  gitMergeIID: string;

  constructor() {
    this.argv = createOptions();
    this.exec = new Shell();

    this.gitURL = this.argv.git.url ? this.argv.git.url : process.env.GIT_URL;
    this.gitToken = this.argv.git.token ? this.argv.git.token : process.env.GIT_TOKEN;
    this.gitProjectID = this.argv.git.project_id ? this.argv.git.project_id : process.env.CI_PROJECT_ID;
    this.gitMergeIID = this.argv.git.merge_iid ? this.argv.git.merge_iid : process.env.CI_MERGE_REQUEST_IID;
    this.sonarURL = this.argv.sonar.url ? this.argv.sonar.url : process.env.SONAR_URL;
    this.sonarToken = this.argv.sonar.token ? this.argv.sonar.token : process.env.SONAR_TOKEN;
    this.sonarProjectKey = this.argv.sonar.project_key;

    if (!this.validate()) {
      process.exit(1);
    }

    // check sonar-scanner installed
    if (!commandExistsSync.sync(SONAR_SCANNER_CMD)) {
      Log.error("sonar-scanner not installed! \nGo to https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/ to install sonar-scanner");
      process.exit(-1);
    }
  }

  run() {
    try {
      this.sonarScanner((this.generateReport).bind(this));
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
    if (!this.gitMergeIID) {
      Log.error("Missing config git merge iid.");
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

    const gitlabMerge = new GitlabMerge({
      host: this.gitURL,
      token: this.gitToken,
      projectID: parseInt(this.gitProjectID),
      mergeRequestIID: parseInt(this.gitMergeIID)
    });

    const qualityGate = new QualityGate({
      sonar: sonar,
      gitMerge: gitlabMerge
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
  private sonarScanner(callback: () => void) {
    const sonarScannerArgv = [];
    if (this.argv.define) {
      for (const i in this.argv.define) {
        sonarScannerArgv.push("-D" + this.argv.define[i]);
      }
    }
    return this.exec.run(SONAR_SCANNER_CMD, sonarScannerArgv, callback);
  }
}