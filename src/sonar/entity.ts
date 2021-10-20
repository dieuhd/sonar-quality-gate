export interface Qualitygate {
  projectStatus: ProjectStatus;
}

export interface ProjectStatus {
  status: string;
  ignoredConditions: boolean;
  conditions: Condition[];
}

export interface Condition {
  status: string;
  metricKey: string;
  actualValue: string;
}

export interface Issue {
  key: string;
  project: string;
  component: string;
  rule: string;
  status: string;
  message: string;
  severity: string;
  line: number;
  author?: string;
  assignee?: string;
  effort: string;
  tags: string[];
  type: string;
}

export interface IssueList {
  issues: Issue[];
  total: number;
  p: number;
  ps: number;
}

export interface Task {
  id: string;
  type: string;
  status: string;
  startedAt: Date;
  submittedAt: Date;
}

export interface Tasks {
  tasks: Task[];
}