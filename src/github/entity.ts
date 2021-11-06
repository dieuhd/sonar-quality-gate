export interface User {
  id: number;
  login: string;
  avatarURL: string;
}

export interface Comment {
  id: number;
  nodeID: string;
  user: User;
  body: string;
  state: string;
  position: number;
  htmlURL: string;
  pullRequestURL: string;
  authorAssociation: string;
  submittedAt: Date;
  commitID: string;
}