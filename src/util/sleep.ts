import { Timer } from './timer';
import { Logger } from './logger';

const logger = Logger.init();

export function sleep(ms = 0) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function sleepImmediate(ms = 1) {
  return new Promise<void>(resolve => {
    let timer: Timer;
    timer = Timer.start();
    if(ms < 1) {
      ms = 1;
    }
    (function _loop() {
      if(timer.currentMs() < ms) {
        setImmediate(_loop);
      } else {
        resolve();
      }
    })();
  });
}
