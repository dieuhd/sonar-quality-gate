export interface Git {
  host: string;
}

export interface GitMerge {
  getVersion(headers?: any): Promise<any>
  getQualityDiscussion(headers?: any): Promise<any>
  createThread(comment: string, headers?: any): Promise<any>
  updateThread(noteID: number, comment: string, headers?: any): Promise<any>
  createCommitComment(
    param: {
      commitSha: string,
      note: string,
      path: string,
      line: number
    },
    headers?: any): Promise<any>
  createCommitDiscussion(
    param:
      {
        comment: string,
        path: string,
        line: number,
        version: any
      },
    headers?: any
  ): Promise<any>
}