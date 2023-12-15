import chalk from "chalk";

class Logger {
  info(message: any) {
    console.log(message);
  }

  debug(action: string, message: any) {
    if (!process.env.DEBUG) {
      return;
    }
    console.log(
      JSON.stringify({
        action: action,
        data: message,
      })
    );
  }

  error(message: any) {
    console.log(chalk.bold.red(message));
  }

  warning(message: any) {
    console.log(chalk.keyword("orange")(message));
  }
}

export const Log = new Logger();
