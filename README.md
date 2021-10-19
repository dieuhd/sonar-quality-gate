# Sonar quality gate code

Nowaday, Sonarqube have feature quality code gate, but it's not work for Community Edition. So, this plugin will be intergate to CI/CD, get quality code and push report to merge request when has change.

**quality-gate** is a command line interface for quality code gate.
- Analytics code: Use command `sonar-scanner` to analytic code, report and push issues to sonar servers.
- Push issue to code changes of merge request
- Generate report quality code of new code, and create note for merge request.

Result:

![Gitlab Quality Gate](./images/gitlab_quality_gate.png)

## Getting Started
```bash
$ npm install -g sonar-quality-gate
# Show help
$ quality-gate --help
```

## Run with Gitlab-CI
Use `quality-gate` instead of `sonar-scanner`.

Example:

``` bash
quality-gate -Dsonar.login=$SONAR_KEY
```
And config for gitlab-ci:

```yaml
stages:
  - CheckSonar

.CheckSonarqube: &CheckSonarqube |
  quality-gate -Dsonar.login=$SONAR_KEY

Sonar:
  stage: CheckSonar
  image: dieuhd/sonar-quality-gate
  rules:
    - if: '$CI_MERGE_REQUEST_TARGET_BRANCH_NAME == "master"'
  script:
    - *CheckSonarqube
```

**P/S: Only work for merge request. Becase, the plugin need Merge Request IID.**

## Contribute

```bash
$ git clone https://github.com/dieuhd/sonar-quality-gate.git
$ cd sonar-quality-gate
$ npm install
$ npm run start:dev
```

## License
MIT. See LICENSE.txt.
