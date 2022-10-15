
import si from 'systeminformation';

import { sleep } from '../../../util/sleep';

// const DEFAULT_CPU_SAMPLE_INTERVAL_MS = 0;
// const DEFAULT_CPU_SAMPLE_INTERVAL_MS = 5;
// const DEFAULT_CPU_SAMPLE_INTERVAL_MS = 15;
const DEFAULT_CPU_SAMPLE_INTERVAL_MS = 25;
// const DEFAULT_CPU_SAMPLE_INTERVAL_MS = 50;

const MAX_CPU_LOAD_SAMPLES = 1e5;
// const MAX_CPU_LOAD_SAMPLES = 2e5;

export type CpuLoadSample = {
  timestamp: number;
  load: number;
}

export type CpuSampleData = {
  loadSamples: CpuLoadSample[];
};

export type CpuSamplerOpts = {
  sampleIntervalMs?: number;
};

export class CpuSampler {

  sampleIntervalMs: number;
  sampleCount: number;

  private doSample: boolean;
  private cpuSampleMap: Record<number, CpuSampleData>;

  private constructor(opts: CpuSamplerOpts = {}) {
    this.sampleCount = 0;
    this.doSample = false;
    this.cpuSampleMap = {};

    this.sampleIntervalMs = opts.sampleIntervalMs ?? DEFAULT_CPU_SAMPLE_INTERVAL_MS;
  }

  static async init(opts: CpuSamplerOpts = {}): Promise<CpuSampler> {
    let cpuSampler: CpuSampler;
    cpuSampler = new CpuSampler(opts);
    await cpuSampler.sampleHandler();
    return cpuSampler;
  }

  getNumSamples(): number {
    return this.cpuSampleMap[0].loadSamples.length;
  }

  getNumCpus(): number {
    return Object.keys(this.cpuSampleMap).length;
  }

  current(startTime = 0) {
    let currCpuSampleMap: Record<number, CpuSampleData>;
    currCpuSampleMap = Object.keys(this.cpuSampleMap).reduce((acc, curr) => {
      let currKey: number, currSamples: CpuLoadSample[], nextSamples: CpuLoadSample[];
      let startTimeSampleIdx: number;
      currKey = +curr;
      currSamples = this.cpuSampleMap[currKey].loadSamples;
      startTimeSampleIdx = -1;
      for(let i = currSamples.length - 1; i >= 0; --i) {
        if(currSamples[i].timestamp < startTime) {
          startTimeSampleIdx = i + 1;
          break;
        }
      }
      if(startTimeSampleIdx === -1) {
        startTimeSampleIdx = 0;
      }
      nextSamples = currSamples.slice(startTimeSampleIdx);
      acc[currKey] = {
        loadSamples: nextSamples,
      };

      return acc;
    }, {} as Record<number, CpuSampleData>);
    return currCpuSampleMap;
  }

  resetSamples() {
    this.cpuSampleMap = {};
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
    let loadData: si.Systeminformation.CurrentLoadData;
    let currCpuSample: CpuLoadSample;
    let pruneN: number;
    loadData = await si.currentLoad();
    loadData.cpus.forEach((cpu, i) => {
      let currCpuSampleData: CpuSampleData;
      if(this.cpuSampleMap[i] === undefined) {
        this.cpuSampleMap[i] = {
          loadSamples: [],
        };
      }
      currCpuSampleData = this.cpuSampleMap[i];
      if(currCpuSampleData.loadSamples.length >= MAX_CPU_LOAD_SAMPLES) {
        // currCpuSampleData.loadSamples.shift();
        // currCpuSampleData.loadSamples.splice(0, 1);

        pruneN = Math.ceil(MAX_CPU_LOAD_SAMPLES / 32);
        pruneN = Math.min(pruneN, 1e3);
        // pruneN = Math.ceil(MAX_CPU_LOAD_SAMPLES / 512);
        currCpuSampleData.loadSamples.splice(0, pruneN);
      }
      currCpuSample = {
        timestamp: Date.now(),
        load: cpu.load,
      };
      currCpuSampleData.loadSamples.push(currCpuSample);
    });
  }

}
