import { spawn } from 'child_process';
import { Log } from '../utils';

export class Shell {

  constructor() { }

  run(command: string, argv?: (string)[], callback?: () => void) {
    var child = spawn(command, argv);

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
      Log.info(code);
      if (callback) {
        callback();
      }
    });
  }
}
