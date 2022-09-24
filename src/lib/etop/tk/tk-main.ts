
import { Logger } from '../../../util/logger';
import { getIntuitiveTimeString } from '../../../util/print-util';
import { sleep } from '../../../util/sleep';
import { Timer } from '../../../util/timer';
import { CpuSampleData, CpuSampler } from '../monitor/cpu-sampler';
import { MemSampler } from '../monitor/mem-sampler';
import {
  setupTermKit,
  TkApp,
} from './tk-app/tk-app';

// const DRAW_FPS = 24;
const DRAW_FPS = 12;
const DRAW_INTERVAL_MS = Math.round(1000 / DRAW_FPS);

// const TK_APP_LOG_INTERVAL_MS = 1 * 1e3;
const TK_APP_LOG_INTERVAL_MS = 60 * 1e3;

export async function tkMain() {
  let tkApp: TkApp, doDraw: boolean;
  let cpuSampler: CpuSampler, currCpuSampleMap: Record<number, CpuSampleData>;
  let cpuSampleLookBackMs: number, cpuSampleStartTime: number;
  let tkAppLogTimer: Timer, tkAppTimer: Timer;
  const logger = Logger.init();
  // cpuSampler = new CpuSampler();
  cpuSampler = await CpuSampler.init();
  cpuSampler.start();

  tkApp = await setupTermKit({
    numCpus: cpuSampler.getNumCpus(),
  });

  tkAppTimer = Timer.start();
  tkAppLogTimer = Timer.start();
  // cpuSampleLookBackMs = 1e4;
  // cpuSampleLookBackMs = 1e3;
  // cpuSampleLookBackMs = 500;
  cpuSampleLookBackMs = 375;
  // cpuSampleLookBackMs = 250;
  do {
    cpuSampleStartTime = Date.now() - cpuSampleLookBackMs;
    currCpuSampleMap = cpuSampler.current(cpuSampleStartTime);
    tkApp.setCpuBarData(
      getCpuBarData(
        currCpuSampleMap
      )
    );
    if(tkAppLogTimer.currentMs() > TK_APP_LOG_INTERVAL_MS) {
      logger.log(`Running for: ${getIntuitiveTimeString(tkAppTimer.currentMs())}`);
      logger.log(`curr numSamples: ${currCpuSampleMap[0].loadSamples.length.toLocaleString()}`);
      logger.log(`total numSamples: ${cpuSampler.getNumSamples().toLocaleString()}`);
      logger.log('');
      tkAppLogTimer.reset();
    }
    // logger.log(currCpuSampleMap[0].loadSamples.length);
    // cpuSampler.resetSamples();
    doDraw = !(await tkApp.draw()).destroyed;
    await sleep(DRAW_INTERVAL_MS);
  } while(doDraw);
}

function getCpuBarData(cpuSampleMap: Record<number, CpuSampleData>): Record<number, number> {
  return Object.keys(cpuSampleMap).reduce((acc, curr) => {
    let sum: number, avg: number;
    let currSample: CpuSampleData;
    currSample = cpuSampleMap[+curr];
    sum = currSample.loadSamples.reduce((acc, curr) => {
      return acc + curr.load;
    }, 0);
    avg = sum / currSample.loadSamples.length;
    acc[+curr] = avg;
    return acc;
  }, {} as Record<number, number>);
}
