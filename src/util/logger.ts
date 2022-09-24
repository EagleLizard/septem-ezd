
import path from 'path';
import { createReadStream, createWriteStream, WriteStream } from 'fs';
import {
  mkdirIfNotExist, mkdirIfNotExistSync,
} from './files';

import {
  LOG_DIR_PATH,
  STDOUT_LOG_FILE_NAME,
  STDERR_LOG_FILE_NAME,
} from '../constants';

let loggerSingleton: Logger;

export class Logger {
  stdout: WriteStream;
  stderr: WriteStream;
  _console: Console;
  private constructor(
    stdout: WriteStream,
    stderr: WriteStream,
    console: Console,
  ) {
    this.stdout = stdout;
    this.stderr = stderr;
    this._console = console;
  }

  log(message?: any, ...optionalParams: any[]) {
    return this._console.log(message, ...optionalParams);
  }
  error(message?: any, ...optionalParams: any[]) {
    return this._console.error(message, ...optionalParams);
  }

  static init(): Logger {
    let stdoutWs: WriteStream, stderrWs: WriteStream;
    let _console: Console;
    let logger: Logger;

    if(loggerSingleton !== undefined) {
      return loggerSingleton;
    }

    mkdirIfNotExistSync(LOG_DIR_PATH);
    stdoutWs = createWriteStream([
      LOG_DIR_PATH,
      STDOUT_LOG_FILE_NAME,
    ].join(path.sep), {
      flags: 'a',
    });
    stderrWs = createWriteStream([
      LOG_DIR_PATH,
      STDERR_LOG_FILE_NAME,
    ].join(path.sep), {
      flags: 'a',
    });

    _console = new console.Console({
      stdout: stdoutWs,
      stderr: stderrWs,
    });

    logger = new Logger(
      stdoutWs,
      stderrWs,
      _console,
    );

    loggerSingleton = logger;

    return logger;
  }

  static getLoggerInstance(): Logger {
    if(loggerSingleton === undefined) {
      throw new Error('getLoggerInstance() called before Logger initialized');
    }
    return loggerSingleton;
  }
}
