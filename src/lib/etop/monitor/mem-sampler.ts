
import si from 'systeminformation';

export type MemSamplerOpts = {
  sampleIntervalMs?: number;
};

const DEFAULT_MEM_SAMPLE_INTERVAL_MS = 2;

export class MemSampler {
  sampleCount: number;
  sampleIntervalMs: number;

  private doSample: boolean;

  private constructor(opts: MemSamplerOpts = {}) {
    this.sampleCount = 0;
    this.doSample = false;

    this.sampleIntervalMs = opts.sampleIntervalMs ?? DEFAULT_MEM_SAMPLE_INTERVAL_MS;
  }

  static async init(opts: MemSamplerOpts = {}): Promise<MemSampler> {
    let memSampler: MemSampler;
    memSampler = new MemSampler(opts);
    return memSampler;
  }

  async start() {
    this.doSample = true;
  }

  private async sampleHandler() {
    let memData: si.Systeminformation.MemData;
    // memData = await si.mem();
  }
}
