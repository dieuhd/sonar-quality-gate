import fs from "fs";

const PROJECT_KEY_PROPERTY = "sonar.projectKey";
const HOST_URL_PROPERTY = "sonar.host.url";

const ENVIRONMENT_VARIABLE_REGEX = /^\$\{env\.(?<env>.*)\}$/;

export class SonarProperties {
  projectDir: string;
  private properties: { [key: string]: string; } = {};
  constructor(opt: {
    projectDir: string;
  }) {
    this.projectDir = opt.projectDir;

    // + "": converts buffer to string
    const config = fs.readFileSync(this.projectDir + "/sonar-project.properties") + "";
    const lines = config.split("\n");
    for (const i in lines) {
      const line = lines[i];
      if (/^#/g.test(line)) {
        continue;
      }
      const data = line.split("=");
      if (data.length != 2) {
        continue;
      }

      const match = ENVIRONMENT_VARIABLE_REGEX.exec(data[1]);
      if (match?.groups?.env && process.env[match.groups.env]) {
        this.properties[data[0]] = process.env[match.groups.env] as string;
      } else {
        this.properties[data[0]] = data[1];
      }
    }
  }

  get(key: string) {
    return this.properties[key];
  }

  getProjectKey() {
    return this.properties[PROJECT_KEY_PROPERTY];
  }

  getSonarURL() {
    return this.properties[HOST_URL_PROPERTY];
  }
}
