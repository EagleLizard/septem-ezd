import { sleep } from '../../util/sleep';
import { Timer } from '../../util/timer';
import { isPromise } from '../type-validation/validate-primitives';

const DEFAULT_INTERVAL_MS = 1000;

export type EtopLoopEvent = {
  iter: number;
};

export type EtopLoopEventHandler = (
  ((evt?: EtopLoopEvent) => void)
  | ((evt?: EtopLoopEvent) => Promise<void>)
);

export class EtopLoop {

  intervalMs: number;
  runLoop: boolean;

  private currIter: number;
  private handlers: EtopLoopEventHandler[];

  constructor(intervalMs?: number) {
    this.currIter = 0;
    this.handlers = [];
    this.intervalMs = intervalMs ?? DEFAULT_INTERVAL_MS;
    this.runLoop = false;
  }

  register(cb: EtopLoopEventHandler) {
    this.handlers.push(cb);
  }

  unregister(cb: EtopLoopEventHandler) {
    let foundIdx: number;
    foundIdx = this.handlers.findIndex(handler => {
      return handler === cb;
    });
    if(foundIdx === -1) {
      return;
    }
    this.handlers.splice(foundIdx, 1);
  }

  async trigger(evt?: EtopLoopEvent) {
    let evtPromises: Promise<void>[];
    evt = evt ?? {
      iter: this.currIter,
    };
    evtPromises = [];
    for(let i = 0; i < this.handlers.length; ++i) {
      let currHandler: EtopLoopEventHandler, currResult: void | Promise<void>;
      currHandler = this.handlers[i];
      currResult = currHandler(evt);
      if(isPromise(currResult)) {
        evtPromises.push(currResult);
      }
    }
    if(evtPromises.length) {
      await Promise.all(evtPromises);
    }
  }

  async start() {
    let evt: EtopLoopEvent, loopTimer: Timer, currLoopMs: number, sleepMs: number;
    this.runLoop = true;
    while(this.runLoop) {
      evt = {
        iter: this.currIter,
      };
      loopTimer = Timer.start();
      await this.trigger(evt);
      currLoopMs = loopTimer.currentMs();
      sleepMs = Math.round(this.intervalMs - currLoopMs);
      if(sleepMs < 0) {
        sleepMs = 0;
      }
      await sleep(sleepMs);
      this.currIter++;
    }
  }
}
