import { spawn } from 'child_process';
import { Log } from '../utils';

export class Shell {
  run(command: string, argv?: (string)[], callback?: () => void) {
    const child = spawn(command, argv);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
      if (data.toString() != "") {
        Log.info(data.toString().trimEnd());
      }
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
      if (data.toString() != "") {
        Log.info(data.toString().trimEnd());
      }
    });

    child.on('close', function (code) {
      Log.info("error code = " + code);
      if (callback) {
        callback();
      }
    });
  }
}
