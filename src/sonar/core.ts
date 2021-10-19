import { Axios } from "../http";

import * as entity from "./entity";
import { SonarReport } from "./report";
import { SonarProperties } from "./properties";
import { Log } from "../utils";

const SONAR_QUALITY_API = "/api/qualitygates/project_status";
const SONAR_ISSUE_API = "/api/issues/search";
const SONAR_TASK_API = "/api/ce/activity";
const PAGE_SIZE = 200;

export class Sonar {
  host: string;
  http: Axios;
  projectKey?: string;
  qualityGate: SonarReport;
  config?: SonarProperties;

  constructor(opt: {
    tokenKey: string;
    host: string;
    projectKey: string;
  }) {
    try {
      this.config = new SonarProperties({projectDir: process.cwd()});
      this.host = this.config.getSonarURL();
      this.projectKey = this.config.getProjectKey();
    } catch (e: any){
      Log.error(e.message);
      this.host = opt.host;
      this.projectKey = opt.host;
    }
    this.qualityGate = new SonarReport({ host: this.host, projectKey: this.projectKey });

    const headers = {
      Authorization:
        "Basic " + Buffer.from(opt.tokenKey + ":" + "").toString("base64"),
    };
    this.http = new Axios({ host: this.host, headers: headers });
  }

  async getQualityStatus() {
    const response = await this.http.get<entity.Qualitygate>(SONAR_QUALITY_API, { projectKey: this.projectKey });
    return response.data;
  }

  async getTaskStatus() {
    const response = await this.http.get<entity.Tasks>(SONAR_TASK_API, {
      component: this.projectKey,
      onlyCurrents: true,
    });
    return response.data;
  }

  private async findIssuesByPage(fromTime: string, page: number) {
    const response = await this.http.get<entity.IssueList>(SONAR_ISSUE_API, {
      componentKeys: this.projectKey,
      // createdAfter: fromTime,
      sinceLeakPeriod: true,
      p: page,
      ps: PAGE_SIZE,
    })
    return response.data;
  };

  async findIssues(fromTime: string): Promise<entity.IssueList> {
    let issueList: any;
    // first page data
    const issues = await this.findIssuesByPage(fromTime, 1);
    issueList = issues;
    if (issues) {
      const totalPage = Math.ceil(issues.total / issues.ps);
      for (let p = issues.p + 1; p <= totalPage; p++) {
        let issuePage = await this.findIssuesByPage(fromTime, p);
        if (!issuePage) {
          break;
        }
        issueList.issues.push(...issuePage.issues);
      }
    }
    return issueList;
  }
}
