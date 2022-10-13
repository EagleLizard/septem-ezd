
import si from 'systeminformation';
import { sleep } from '../../../util/sleep';

const DEFAULT_NET_SAMPLE_INTERVAL_MS = 25;

const MAX_NET_LOAD_SAMPLES = 1e5;

export type NetSamplerOpts = {
  sampleIntervalMs?: number;
}

export type NetSample = {
  timestamp: number;
  data: si.Systeminformation.NetworkStatsData;
};

export class NetSampler {

  sampleCount: number;
  sampleIntervalMs: number;
  netSamples: NetSample[];

  iface: string;

  private doSample: boolean;

  private constructor(iface: string, opts: NetSamplerOpts = {}) {
    this.sampleCount = 0;
    this.doSample = false;
    this.netSamples = [];

    this.iface = iface;
    this.sampleIntervalMs = opts.sampleIntervalMs ?? DEFAULT_NET_SAMPLE_INTERVAL_MS;
  }

  static async init(opts: NetSamplerOpts = {}): Promise<NetSampler> {
    let iface: string, netSampler: NetSampler;
    iface = await si.networkInterfaceDefault();
    netSampler = new NetSampler(iface, opts);
    await netSampler.sampleHandler();
    return netSampler;
  }

  private async sampleHandler() {
    let netData: si.Systeminformation.NetworkStatsData;
    let currNetSample: NetSample;
    let pruneN: number;
    netData = (await si.networkStats(this.iface))[0];
    if(this.netSamples.length >= MAX_NET_LOAD_SAMPLES) {
      pruneN = Math.ceil(MAX_NET_LOAD_SAMPLES / 32);
      pruneN = Math.min(pruneN, 1e3);
      this.netSamples.splice(0, pruneN);
    }
    currNetSample = {
      timestamp: Date.now(),
      data: netData,
    };
    this.netSamples.push(currNetSample);
  }

  getSamples(startTime = 0): NetSample[] {
    let lookBackNetSamples: NetSample[];
    let startTimeSampleIdx: number;

    startTimeSampleIdx = -1;
    for(let i = this.netSamples.length - 1; i >= 0; --i) {
      if(this.netSamples[i].timestamp < startTime) {
        startTimeSampleIdx = i + 1;
        break;
      }
    }
    if(startTimeSampleIdx === -1) {
      startTimeSampleIdx = 0;
    }
    lookBackNetSamples = this.netSamples.slice(startTimeSampleIdx);
    return lookBackNetSamples;
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
}
