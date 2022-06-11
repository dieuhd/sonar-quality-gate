import { Git, GitMerge, GitReviewParam } from "../git";
import { Axios } from "../http";
import { Comment } from "./entity";

export class Github implements Git {
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

    const headers = {
      "Authorization": "token " + opt.token,
      "Accept": "application/vnd.github.v3+json"
    };
    this.headers = headers;
    this.http = new Axios({ host: opt.host, headers: headers });
  }
}

export class GithubMerge extends Github implements GitMerge {
  mergeRequestID: number;
  constructor(opt: {
    host: string;
    token: string;
    projectID: string;
    mergeRequestID: number;
  }) {
    super(opt);
    this.mergeRequestID = opt.mergeRequestID;
  }

  async getQualityDiscussion(headers?: any): Promise<Comment | null> {
    const api = `/repos/${this.projectID}/issues/${this.mergeRequestID}/comments`;
    const response = await this.http.get<Comment[]>(api, {}, headers);
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

  async createComment(comment: string, headers?: any): Promise<Comment> {
    const api = `/repos/${this.projectID}/issues/${this.mergeRequestID}/comments`;
    const response = await this.http.post(api, {
      body: comment
    }, {}, headers);
    return response.data
  }

  async updateComment(noteID: number, comment: string, headers?: any): Promise<Comment> {
    const api = `/repos/${this.projectID}/issues/comments/${noteID}`;
    const response = await this.http.patch(api, {
      body: comment
    }, {}, headers);
    return response.data
  }

  async saveQualityDiscussion(comment: string, headers?: any): Promise<Comment> {
    const discussion = await this.getQualityDiscussion();
    let data = null;
    if (discussion) {
      data = await this.updateComment(discussion.id, comment, headers);
    } else {
      data = await this.createComment(comment, headers);
    }
    return data;
  }

  async createReviewComments(
    params: GitReviewParam[]
  ): Promise<Comment | null> {
    const api = `/repos/${this.projectID}/pulls/${this.mergeRequestID}/reviews`;

    const comments: any = [];
    for (const i in params) {
      comments.push({
        path: params[i].path,
        line: params[i].line,
        body: params[i].comment
      });
    }
    if (comments.length == 0){
      return null;
    }

    const data = {
      body: "",
      event: "COMMENT",
      comments: comments
    };
    const response = await this.http.post(api, data, {});
    return response.data
  }
}