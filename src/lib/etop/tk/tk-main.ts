
import si from 'systeminformation';

import { Logger } from '../../../util/logger';
import { getIntuitiveTimeString } from '../../../util/print-util';
import { sleep, sleepImmediate, sleepIncremental } from '../../../util/sleep';
import { Timer } from '../../../util/timer';
import { CpuSampleData, CpuSampler } from '../monitor/cpu-sampler';
import { MemSample, MemSampler } from '../monitor/mem-sampler';
import { NetSample, NetSampler } from '../monitor/net-sampler';
import {
  setupTermKit,
  TkApp,
} from './tk-app/tk-app';

// const DRAW_FPS = 120;
// const DRAW_FPS = 60;
// const DRAW_FPS = 48;
const DRAW_FPS = 24;
// const DRAW_FPS = 12;
// const DRAW_FPS = 1;
const DRAW_INTERVAL_MS = Math.round(1000 / DRAW_FPS);

const TK_APP_LOG_INTERVAL_MS = 1 * 1e3;
// const TK_APP_LOG_INTERVAL_MS = 5 * 1e3;
// const TK_APP_LOG_INTERVAL_MS = 60 * 1e3;

const logger = Logger.init();

export async function tkMain() {
  let tkApp: TkApp, doDraw: boolean;
  let tkAppLogTimer: Timer, tkAppTimer: Timer;
  let frameTimer: Timer;
  let frameDeltaMs: number, frameDrawMs: number, drawDiffMs: number, diffMs: number;
  let actualDrawIntervalMs: number, frameMisses: number;

  let cpuSampler: CpuSampler, currCpuSampleMap: Record<number, CpuSampleData>;
  let cpuSampleLookBackMs: number, cpuSampleStartTime: number;

  let memSampler: MemSampler, currMemSamples: MemSample[];
  let memSampleLookBackMs: number, memSampleStartTime: number;
  let currMemSampleData: MemSample['data'];

  let netSampler: NetSampler, currNetSamples: NetSample[];
  let netSampleLookbackMs: number, netSampleStartTime: number;

  cpuSampler = await CpuSampler.init();
  cpuSampler.start();

  memSampler = await MemSampler.init();
  memSampler.start();

  netSampler = await NetSampler.init();
  netSampler.start();

  tkApp = await setupTermKit({
    numCpus: cpuSampler.getNumCpus(),
    onInput: handleInput,
  });

  tkAppTimer = Timer.start();
  tkAppLogTimer = Timer.start();

  // cpuSampleLookBackMs = 500;
  cpuSampleLookBackMs = 375;
  // cpuSampleLookBackMs = 250;

  // memSampleLookBackMs = 3000;
  memSampleLookBackMs = 1750;

  netSampleLookbackMs = 375;

  frameTimer = Timer.start();
  frameMisses = 0;

  do {

    frameTimer.reset();

    cpuSampleStartTime = Date.now() - cpuSampleLookBackMs;
    currCpuSampleMap = cpuSampler.current(cpuSampleStartTime);

    memSampleStartTime = Date.now() - memSampleLookBackMs;
    currMemSamples = memSampler.getSamples(memSampleStartTime);

    netSampleStartTime = Date.now() - netSampleLookbackMs;
    currNetSamples = netSampler.getSamples(netSampleStartTime);

    currMemSampleData = getMemSampleData(currMemSamples);

    tkApp.setCpuBarData(
      getCpuBarData(
        currCpuSampleMap
      )
    );

    tkApp.setMemData(currMemSampleData);

    if(tkAppLogTimer.currentMs() > TK_APP_LOG_INTERVAL_MS) {
      printStats();
      tkAppLogTimer.reset();
    }

    doDraw = !(await tkApp.draw()).destroyed;

    actualDrawIntervalMs = DRAW_INTERVAL_MS - Math.ceil(frameTimer.currentMs());

    await sleep(actualDrawIntervalMs);

    frameDeltaMs = frameTimer.currentMs();
    diffMs = frameDeltaMs - DRAW_INTERVAL_MS;

    if(
      (frameDeltaMs > DRAW_INTERVAL_MS)
      && ((diffMs / DRAW_INTERVAL_MS) > 0.15)
    ) {
      frameMisses++;
    }

  } while(doDraw);

  function handleInput(keyName: string, matches: string[]) {
    switch(keyName) {
      case 'p':
        printStats();
        break;
      // default:
      //   logger.log('Keyboard Input:');
      //   logger.log(`keyName: ${keyName}`);
      //   logger.log(`matches: ${matches}`);
    }
  }

  function printStats() {
    let tkAppCurrentMs: number;
    let frameMissesPerSec: number;

    tkAppCurrentMs = tkAppTimer.currentMs();
    frameMissesPerSec = frameMisses / (tkAppCurrentMs / 1000);

    logger.log('~'.repeat(40));
    logger.log(`${getIntuitiveTimeString(tkAppCurrentMs)}`);
    logger.log(`tkApp drawCount: ${tkApp.getDrawCount().toLocaleString()}`);
    logger.log('');
    logger.log(`curr cpu numSamples: ${currCpuSampleMap[0].loadSamples.length.toLocaleString()}`);
    logger.log(`lookback cpu numSamples: ${cpuSampler.getNumSamples().toLocaleString()}`);
    logger.log(`total cpu numSamples: ${cpuSampler.sampleCount.toLocaleString()}`);
    logger.log('');
    logger.log(`curr mem numSamples: ${currMemSamples.length.toLocaleString()}`);
    logger.log(`mem numSamples: ${memSampler.memSamples.length.toLocaleString()}`);
    logger.log(`total mem numSamples: ${memSampler.sampleCount.toLocaleString()}`);
    logger.log('');
    logger.log(`curr net numSamples: ${currNetSamples.length.toLocaleString()}`);
    logger.log(`net numSamples: ${netSampler.netSamples.length.toLocaleString()}`);
    logger.log(`total net numSamples: ${netSampler.sampleCount.toLocaleString()}`);
    logger.log('');
    logger.log(`frameMisses: ${frameMisses}`);
    logger.log(`frameMisses/s: ${frameMissesPerSec.toFixed(3)}`);
    logger.log('');

  }
}

function getMemSampleData(memSamples: MemSample[]): MemSample['data'] {
  let memSampleAcc: si.Systeminformation.MemData,
    memSampleDataKeys: (keyof si.Systeminformation.MemData)[]
  ;

  memSampleAcc = {
    total: 0,
    free: 0,
    used: 0,
    active: 0,
    available: 0,
    buffcache: 0,
    buffers: 0,
    cached: 0,
    slab: 0,
    swaptotal: 0,
    swapused: 0,
    swapfree: 0,
  };
  memSampleDataKeys = Object.keys(memSampleAcc)as (keyof MemSample['data'])[];
  memSamples.forEach(memSample => {
    memSampleDataKeys.forEach(memSampleKey => {
      memSampleAcc[memSampleKey] += memSample.data[memSampleKey];
    });
  });
  memSampleDataKeys.forEach(memSampleKey => {
    memSampleAcc[memSampleKey] = memSampleAcc[memSampleKey] / memSamples.length;
  });
  return memSampleAcc;
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
