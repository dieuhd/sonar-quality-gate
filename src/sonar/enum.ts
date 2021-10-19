export enum IssueType {
  Bug = "BUG",
  Vulnerability = "VULNERABILITY",
  CodeSmell = "CODE_SMELL"
}

export enum SecurityLevel {
  A = "security_a",
  B = "security_b",
  C = "security_c",
  D = "security_d",
  E = "security_e",
}


export enum MetricKey {
  newReliabilityRrating = "new_reliability_rating",
  newMaintainabilityRating = "new_maintainability_rating",
  newSecurityRating = "new_security_rating",
  newSecurityReviewRating = "new_security_review_rating",
  newDuplicatedLinesDensity = "new_duplicated_lines_density",
  newCoverage = "new_coverage"
}

export enum QualityStatus {
  OK = "OK",
  Error = "ERROR",
}