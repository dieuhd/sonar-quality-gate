
export interface MergeRequestVersion {
  id: number;
  headCommitSha: string;
  baseCommitSha: string;
  startCommitSha: string;
  mergeRequestID: number;
  state: string;
}

export interface Author {
  id: number;
  name: string;
  username: string;
  state: string;
}

export interface NotePosition {
  headSha: string;
  baseSha: string;
  startSha: string;
  newPath: string;
  oldPath?: string;
  positionType: string;
  oldLine?: number;
  newLine: number;
  lineRange?: string;
}

export interface Note {
  id: number;
  type: string;
  author: Author;
  noteableType?: string;
  body: string;
  createdAt: Date;
  noteableIID: number;
  commitID?: string;
  position?: NotePosition;
}

export interface Notes {
  id: string;
  individualNote: boolean;
  notes: Note[];
}
