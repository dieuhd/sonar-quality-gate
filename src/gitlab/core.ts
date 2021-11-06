import { Axios } from "../http";
import { APIType } from "./enum";
import * as entity from "./entity";
import { Git, GitMerge, GitReviewParam } from "../git";

export class Gitlab implements Git {
  host: string;
  http: Axios;
  projectID: string;
  headers?: any;

  constructor(opt: {
    host: string;
    token: string;
    projectID: string;
  }) {
    this.host = opt.host;
    this.projectID = opt.projectID;

    const headers = { "PRIVATE-TOKEN": opt.token };
    this.headers = headers;
    this.http = new Axios({ host: opt.host, headers: headers });
  }
}

export class GitlabMerge extends Gitlab implements GitMerge {
  mergeRequestIID: number;
  constructor(opt: {
    host: string;
    token: string;
    projectID: string;
    mergeRequestIID: number;
  }) {
    super(opt);
    this.mergeRequestIID = opt.mergeRequestIID;
  }

  async getVersion(headers?: any): Promise<entity.MergeRequestVersion> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/versions`;
    const response = await this.http.get<entity.MergeRequestVersion[]>(api, {}, headers);
    return response.data[0];
  }

  async getQualityDiscussion(headers?: any): Promise<entity.Note | null> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/notes`;
    const response = await this.http.get<entity.Note[]>(api, {
      sort: "desc",
      order_by: "updated_at",
    }, headers);
    const pattern = /^# SonarQube Code Analytics/g;
    const notes = response.data;
    for (const i in notes) {
      const data = notes[i];
      if (pattern.test(data.body)) {
        return data;
      }
    }
    return null;
  }

  async createThread(comment: string, headers?: any): Promise<entity.Notes> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/notes`;
    const response = await this.http.post<entity.Notes>(api, {
      body: comment
    }, {}, headers);
    return response.data;
  }

  async updateThread(noteID: number, comment: string, headers?: any): Promise<entity.Notes> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/notes/${noteID}`;
    const response = await this.http.put<entity.Notes>(api, {
      body: comment
    }, {}, headers);
    return response.data;
  }

  async saveQualityDiscussion(comment: string, headers?: any): Promise<entity.Notes> {
    const discussion = await this.getQualityDiscussion();
    let data = null;
    if (discussion) {
      data = await this.updateThread(discussion.id, comment, headers);
    } else {
      data = await this.createThread(comment, headers);
    }
    return data;
  }

  async deleteThread(noteID: number, headers?: any): Promise<entity.Notes> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/notes/${noteID}`;
    const response = await this.http.delete<entity.Notes>(api, {}, headers);
    return response.data;
  }

  async createReviewComments(
    params: GitReviewParam[]
  ): Promise<entity.Notes[] | boolean> {
    let data: any;
    const version = await this.getVersion();
    if (!version) {
      return false;
    }
    for (const i in params) {
      const response = this.createCommitDiscussion(
        {
          comment: params[i].comment,
          path: params[i].path,
          line: params[i].line,
          version: version
        });
      data.push(response);
    }
    return data;
  }

  async createCommitDiscussion(
    param:
      {
        comment: string,
        path: string,
        line: number,
        version: any
      },
    headers?: any
  ): Promise<entity.Notes> {
    const api = `${APIType.Project}/${this.projectID}/merge_requests/${this.mergeRequestIID}/discussions`;
    const response = await this.http.post<entity.Notes>(
      api,
      {
        body: param.comment,
        position: {
          position_type: "text",
          head_sha: param.version.head_commit_sha,
          base_sha: param.version.base_commit_sha,
          start_sha: param.version.start_commit_sha,
          new_path: param.path,
          new_line: param.line
        }
      },
      {},
      headers
    );
    return response.data;
  }
}