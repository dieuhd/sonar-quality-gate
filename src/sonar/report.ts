import { Issue, ProjectStatus } from "./entity";
import { MetricKey, QualityStatus, SecurityLevel } from "./enum";

const IMAGE_DIR_LINK = "https://hsonar.s3.ap-southeast-1.amazonaws.com/images/";

export class SonarReport {
  host?: string;
  projectKey?: string;
  constructor(opt: {
    host?: string;
    projectKey?: string;
  }) {
    this.host = opt.host;
    this.projectKey = opt.projectKey;
  }

  private capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
  }

  private icon(name: string) {
    if (!name) {
      return "";
    }
    const iconImage = IMAGE_DIR_LINK + name.toLowerCase() + ".png";
    return `![${name}](${iconImage})`;
  }

  issueNote(issue: Issue) {
    const rule = issue.rule;
    const ruleLink = this.host + "/coding_rules?open=" + rule + "&rule_key=" + rule;
    let note = "";
    note += "**" + issue.message;
    note += "**  [<sub>Why is this an issue?</sub>](" + ruleLink + ") \n\n";
    note +=
      this.icon(issue.type) + " " + this.capitalize(issue.type.replace("_", ""));
    note += "　　" + this.icon(issue.severity) + " **" + this.capitalize(issue.severity) + "**";
    note += "　　:hourglass: *" + issue.effort + "* effort";
    if (issue.assignee) {
      note += "　　:bust_in_silhouette: @" + issue.assignee + "";
    }
    return note;
  }

  private securityLevel(value: string) {
    const val: number = parseInt(value);
    if (val >= 5) {
      return SecurityLevel.E;
    }
    const level: {[key: number]: string} = {
      1: SecurityLevel.A,
      2: SecurityLevel.B,
      3: SecurityLevel.C,
      4: SecurityLevel.D,
      5: SecurityLevel.E,
    };
    return level[val];
  }

  private getIssueURL(type: string) {
    return this.host + `/project/issues?id=${this.projectKey}&resolved=false&sinceLeakPeriod=true&types=${type}`;
  }

  private getMetricURL(metric: string) {
    return this.host + `/project/issues?id=${this.projectKey}&metric=${metric}&view=list`;
  }

  private getIssueSecurity(projectStatus: ProjectStatus) {
    let bugSecurity = "",
      vulSecurity = "",
      smellSecurity = "",
      hotspotSecurity = "";

    let duplicatedCode = -1,
      coverateValue = -1;
    for (const i in projectStatus.conditions) {
      const condition = projectStatus.conditions[i];
      const level = this.securityLevel(condition.actualValue);
      if (condition.metricKey == MetricKey.newReliabilityRrating) {
        bugSecurity = level;
      } else if (condition.metricKey == MetricKey.newMaintainabilityRating) {
        smellSecurity = level;
      } else if (condition.metricKey == MetricKey.newSecurityRating) {
        vulSecurity = level;
      } else if (condition.metricKey == MetricKey.newSecurityReviewRating) {
        hotspotSecurity = level;
      } else if (condition.metricKey == MetricKey.newDuplicatedLinesDensity) {
        duplicatedCode = parseFloat(condition.actualValue);
      } else if (condition.metricKey == MetricKey.newCoverage) {
        coverateValue = parseFloat(condition.actualValue);
      }
    }
    return [bugSecurity, vulSecurity, smellSecurity, duplicatedCode, coverateValue, hotspotSecurity];
  }

  templateReport(param: {
    status: string,
    bugCount: number,
    bugSecurity: string,
    vulnerabilityCount: number,
    vulnerabilitySecurity: string,
    codeSmellCount: number,
    codeSmellSecurity: string,
    coverageValue: number,
    duplicatedValue: number,
  }) {

    let coverageText = "**Coverage**";
    if (param.coverageValue >= 0) {
      coverageText = " [" + param.coverageValue.toFixed(2) + "% Coverage](" + this.getMetricURL("new_coverage") + ")";
    }
    let duplicatedText = "**Duplication**";
    if (param.duplicatedValue >= 0) {
      const duplicatedURL = this.getMetricURL("new_duplicated_lines_density");
      duplicatedText = " [" + param.duplicatedValue.toFixed(2) + "% Duplication](" + duplicatedURL + ")";
    }
    let status = "";
    if (param.status == QualityStatus.OK) {
      status = "passed";
    } else {
      status = "failed";
    }

    const report = `# SonarQube Code Analytics 
## Quality Gate ${status}

${this.icon(status)}

## Additional information
*The following metrics might not affect the Quality Gate status but improving them will improve your project code quality.*

## Issues
${this.icon("bug")}  ${this.icon(param.bugSecurity)} [${param.bugCount} Bugs](${this.getIssueURL("BUG")})

${this.icon("vulnerability")}  ${this.icon(param.vulnerabilitySecurity)} [${param.vulnerabilityCount} Vulnerabilities](${this.getIssueURL("VULNERABILITY")})

${this.icon("code_smell")}  ${this.icon(param.codeSmellSecurity)} [${param.codeSmellCount} Code Smells](${this.getIssueURL("CODE_SMELL")})

## Coverage and Duplications
${this.coverageIcon(param.coverageValue)} ${coverageText}

${this.duplicatedIcon(param.duplicatedValue)} ${duplicatedText}`;

    return report;
  }



  report(
    projectStatus: ProjectStatus,
    bugCount: number,
    vulnerabilityCount: number,
    codeSmellCount: number
  ) {
    const [bugSecurity, vulSecurity, smellSecurity, duplicatedCode, coverateValue] = this.getIssueSecurity(projectStatus)
    return this.templateReport({
      status: projectStatus.status,
      bugCount: bugCount,
      bugSecurity: bugSecurity as string,
      vulnerabilityCount: vulnerabilityCount,
      vulnerabilitySecurity: vulSecurity as string,
      codeSmellCount: codeSmellCount,
      codeSmellSecurity: smellSecurity as string,
      coverageValue: coverateValue as number,
      duplicatedValue: duplicatedCode as number,
    });
  }

  private duplicatedIcon(duplicatedCode: number): string {
    if (duplicatedCode < 0) {
      return "*No data*";
    }
    if (duplicatedCode < 3) {
      return this.icon("duplication_lt_3");
    }
    if (duplicatedCode < 5) {
      return this.icon("duplication_3_5");
    }
    if (duplicatedCode < 10) {
      return this.icon("duplication_5_10");
    }
    if (duplicatedCode < 20) {
      return this.icon("duplication_10_20");
    }
    return this.icon("duplication_lt_20");
  }

  private coverageIcon(coverage: number): string {
    if (coverage < 0) {
      return "*No data*";
    }
    if (coverage < 50) {
      return this.icon("coverage_lt_50");
    }
    if (coverage < 80) {
      return this.icon("coverage_gt_50");
    }
    return this.icon("coverage_gt_80");
  }
}
