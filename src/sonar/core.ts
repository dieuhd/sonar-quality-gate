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
    branchPluginEnabled?: boolean;
    branchPluginMergeId?: number;
  }) {
    try {
      this.config = new SonarProperties({ projectDir: process.cwd() });
      this.host = this.config.getSonarURL();
      this.projectKey = this.config.getProjectKey();
    } catch (e: any) {
      Log.error(e.message);
      this.host = opt.host;
      this.projectKey = opt.projectKey;
    }
    this.qualityGate = new SonarReport({
      host: this.host,
      projectKey: this.projectKey,
      branchPluginEnabled: opt.branchPluginEnabled,
      branchPluginMergeId: opt.branchPluginMergeId,
    });

    const headers = {
      Authorization: "Bearer " + opt.tokenKey,
    };
    this.http = new Axios({ host: this.host, headers: headers });
  }

  async getQualityStatus() {
    const parameters: entity.SonarApiRequestParameters = {
      projectKey: this.projectKey,
    }

    if (this.qualityGate.branchPluginEnabled) {
      parameters.pullRequest = this.qualityGate.branchPluginMergeId;
    }

    Log.debug("sonar get quality status", SONAR_QUALITY_API);
    const response = await this.http.get<entity.Qualitygate>(
      SONAR_QUALITY_API,
      parameters
    );
    return response.data;
  }

  async getTaskStatus() {
    Log.debug("sonar get task status", SONAR_TASK_API);
    const response = await this.http.get<entity.Tasks>(SONAR_TASK_API, {
      component: this.projectKey,
      onlyCurrents: true,
    });
    return response.data;
  }

  private async findIssuesByPage(fromTime: string, page: number) {
    const parameters: entity.SonarApiRequestParameters = {
      componentKeys: this.projectKey,
      // sinceLeakPeriod: true, // get issues of new code on sonar
      p: page,
      ps: PAGE_SIZE,
      createdAfter: fromTime,
    };

    if (this.qualityGate.branchPluginEnabled) {
      parameters.pullRequest = this.qualityGate.branchPluginMergeId;
    }

    const response = await this.http.get<entity.IssueList>(SONAR_ISSUE_API, parameters);
    return response.data;
  }

  async findIssues(fromTime: string): Promise<entity.IssueList> {
    Log.debug("sonar find issues: ", {
      fromTime: fromTime,
    });
    // first page data
    const issues = await this.findIssuesByPage(fromTime, 1);
    const issueList = issues;
    if (issues) {
      const totalPage = Math.ceil(issues.total / issues.ps);
      for (let p = issues.p + 1; p <= totalPage; p++) {
        const issuePage = await this.findIssuesByPage(fromTime, p);
        if (!issuePage) {
          break;
        }
        issueList.issues.push(...issuePage.issues);
      }
    }
    return issueList;
  }
}
