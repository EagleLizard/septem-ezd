
import { Timer } from '../../util/timer';
import { getIntuitiveTimeString } from '../../util/print-util';


const INT_PRINT_MS = 1e2;

const N_MAX = Number.MAX_SAFE_INTEGER;
// const N_MAX = 1e7;

export async function cpuHogMain() {
  await incrementInt();
}

async function incrementInt() {
  let n: number, timer: Timer, totalTimer: Timer;
  let doPrint: boolean;

  doPrint = true;
  n = 0;
  timer = Timer.start();
  totalTimer = Timer.start();

  while(n < N_MAX) {
    n++;
    if(timer.currentMs() > INT_PRINT_MS) {
      timer.reset();
      console.log(n.toLocaleString());
      console.log(getIntuitiveTimeString(totalTimer.currentMs()));
      console.log('');
    }
  }
}
