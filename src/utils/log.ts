import chalk from "chalk";

class Logger {
  info(message: any) {
    console.log(message);
  }
  error(message: any) {
    console.log(chalk.bold.red(message))
  }
  warning(message: any) {
    console.log(chalk.keyword('orange')(message));
  }
}

export const Log = new Logger();