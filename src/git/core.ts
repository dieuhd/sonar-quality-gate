import { Axios } from "../http";

export interface GitReviewParam {
  comment: string;
  path: string;
  line: number;
  [key: string]: any;
}

export interface Git {
  host: string;
  http: Axios;
  projectID: string;
}

export interface GitMerge {
  createReviewComments(params: GitReviewParam[]): Promise<any>
  saveQualityDiscussion(comment: string, headers?: any): Promise<any>
}