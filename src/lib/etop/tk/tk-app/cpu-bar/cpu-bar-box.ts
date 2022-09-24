
import tk from 'terminal-kit';
import { Logger } from '../../../../../util/logger';
import { BrailleCanvas } from '../../../../braille/braille';
import { TERM_COLOR_CODES } from '../term-color';
import {
  ScreenBufferOpts, TERM_FILL_ATTR,
} from '../../element';

export type CpuBarBoxOpts = {
  screenBufOpts: ScreenBufferOpts;
  cpuIdx: number;
  numCpus: number;
};

export type CpuBarBoxDrawOpts = {
  cpuBarVal: number;
  logger: Logger;
}

export class CpuBarBox {
  screenBuffer: tk.ScreenBuffer;
  cpudIdx: number;
  numCpus: number;

  private maxY: number;
  private barX: number;
  private cpuBarLabel: string;

  constructor(opts: CpuBarBoxOpts) {
    this.screenBuffer = new tk.ScreenBuffer(opts.screenBufOpts);
    this.cpudIdx = opts.cpuIdx;
    this.numCpus = opts.numCpus;

    this.maxY = this.screenBuffer.height - 1;
    this.barX = this.screenBuffer.width - 1;
    this.cpuBarLabel = `${this.cpudIdx}`;
  }

  draw(opts: CpuBarBoxDrawOpts) {
    let color: number, currPercent: number;
    let maxBrailleY: number;
    let brailleCanvas: BrailleCanvas, brailleBarMatrix: string[][];

    maxBrailleY = this.maxY * 4;
    currPercent = opts.cpuBarVal / 100;
    color = getColor(
      this.cpudIdx,
      this.numCpus,
    );
    this.screenBuffer.fill({
      attr: TERM_FILL_ATTR,
    });

    brailleCanvas = new BrailleCanvas(2, maxBrailleY);
    for(let y = 0; y < maxBrailleY; ++y) {
      let yPos: number;
      if(y <= Math.round(currPercent * maxBrailleY)) {
        yPos = maxBrailleY - y;
        brailleCanvas.set(0, yPos);
        brailleCanvas.set(1, yPos);
      }
    }
    brailleBarMatrix = brailleCanvas.getStrMatrix();
    for(let y = 0; y < brailleBarMatrix.length; ++y) {
      let currBar: string;
      currBar = brailleBarMatrix[y][0];
      this.screenBuffer.put({
        x: this.barX,
        y,
        dx: 0,
        dy: 0,
        attr: {
          color,
          bold: true,
        },
        wrap: false,
      }, currBar);
    }
    // draw the label
    this.screenBuffer.put({
      x: this.screenBuffer.width - this.cpuBarLabel.length,
      y: this.maxY,
      dx: 1,
      dy: 0,
      attr: {
        color,
      },
      wrap: false,
    }, this.cpuBarLabel);
    this.screenBuffer.draw({
      delta: true,
    });
  }
}

function getColor(
  currPos: number,
  maxPos: number,
  rangeStart = 0,
  rangeEnd = TERM_COLOR_CODES.length - 1,
): number {
  let currPosPercent: number, _colorIdx: number;
  let rangeDiff = rangeEnd - rangeStart;
  currPosPercent = currPos / maxPos;
  _colorIdx = rangeStart + Math.round(currPosPercent * rangeDiff);
  return TERM_COLOR_CODES[_colorIdx];
}
