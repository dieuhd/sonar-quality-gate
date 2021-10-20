import chalk from "chalk";
import figlet from "figlet";
import yargs from "yargs";
// import path from "path";

declare type ArgsOutput = (string | number)[];

interface Arguments {
  _: ArgsOutput;
  git: { [key: string]: string };
  sonar: { [key: string]: string };
  define: any;
  debug: boolean;
  help: any;
}
export function createOptions() {
  console.log(
    chalk.blue(
      figlet.textSync('quality-gate', { horizontalLayout: 'full' })
    )
  );

  // const version = require(path.resolve(__dirname, "../../package.json")).version as string;
  const argv: Arguments = yargs
    .usage("Usage: $0 [options]")
    .help()
    .option("help", { alias: "h", group: "Global Options:" })
    .option("define", {
      alias: "D",
      requiresArg: true,
      desc: "Define sonar property\n\Authentication:\n" +
        "sonar.login The authentication token or login of a SonarQube user with Execute Analysis permission on the project.\n" +
        "More parameters:\n" +
        "- https://docs.sonarqube.org/latest/analysis/analysis-parameters/",
      type: "array",
      group: "Global Options:",
    })
    .option("git", {
      desc: "Config git \n" +
        "  --git.url Git server URL. Default: $GIT_URL\n" +
        "  --git.token Git token. Default: $GIT_TOKEN\n" +
        "  --git.project_id Git project ID. Default: $CI_PROJECt_ID\n" +
        "  --git.merge_id Git merge request IID. Default: $CI_MERGE_REQUEST_IID\n",
      default: {},
      group: "Global Options:",
    })
    .option("sonar", {
      default: {},
      desc: "Config sonar \n" +
        "  --sonar.url Sonarqube server URL. Default: $SONAR_URL or sonar.host.url in file sonar-project.properties.\n" +
        "  --sonar.token The authentication token of a SonarQube user with Execute Analysis permission on the project. Default: $SONAR_TOKEN\n" +
        "  --sonar.project_key Sonar project key. Default: sonar.projectKey in file sonar-project.properties\n",
      group: "Global Options:",
    })
    .option("debug", {
      alias: "X",
      desc: "Produce execution debug output",
      boolean: true,
      default: false,
      group: "Global Options:",
    })
    // .option("version", { desc: "Print version number.", group: "Global Options:" })
    .version(false)
    .wrap(120)
    .locale("en").parseSync();

  return argv;
}