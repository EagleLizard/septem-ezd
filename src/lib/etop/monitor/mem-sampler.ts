
import si from 'systeminformation';

import { Logger } from '../../../util/logger';
import { sleep } from '../../../util/sleep';

const DEFAULT_MEM_SAMPLE_INTERVAL_MS = 500;
// const DEFAULT_MEM_SAMPLE_INTERVAL_MS = 250;
// const DEFAULT_MEM_SAMPLE_INTERVAL_MS = 0;
const MAX_MEM_LOAD_SAMPLES = 1e5;

const logger = Logger.init();

export type MemSamplerOpts = {
  sampleIntervalMs?: number;
};

export type MemSample = {
  timestamp: number;
  data: si.Systeminformation.MemData;
};


export class MemSampler {
  sampleCount: number;
  sampleIntervalMs: number;
  memSamples: MemSample[];

  private doSample: boolean;

  private constructor(opts: MemSamplerOpts = {}) {
    this.sampleCount = 0;
    this.doSample = false;
    this.memSamples = [];

    this.sampleIntervalMs = opts.sampleIntervalMs ?? DEFAULT_MEM_SAMPLE_INTERVAL_MS;
  }

  static async init(opts: MemSamplerOpts = {}): Promise<MemSampler> {
    let memSampler: MemSampler;
    memSampler = new MemSampler(opts);
    await memSampler.sampleHandler();
    return memSampler;
  }

  async start() {
    this.doSample = true;
    while(this.doSample) {
      await this.sampleHandler();
      await sleep(this.sampleIntervalMs);
      this.sampleCount++;
    }
  }

  stop() {
    this.doSample = false;
  }

  private async sampleHandler() {
    let memData: si.Systeminformation.MemData;
    let currMemSample: MemSample;
    let pruneN: number;
    memData = await si.mem();
    if(this.memSamples.length >= MAX_MEM_LOAD_SAMPLES) {
      pruneN = Math.ceil(MAX_MEM_LOAD_SAMPLES / 32);
      pruneN = Math.min(pruneN, 1e3);
      this.memSamples.splice(0, pruneN);
    }
    currMemSample = {
      timestamp: Date.now(),
      data: memData,
    };
    this.memSamples.push(currMemSample);
  }
}
