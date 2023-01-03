
import tk from 'terminal-kit';

import { Logger } from '../../../../../util/logger';
import { MemSample } from '../../../monitor/mem-sampler';
import {
  TkElement,
  TkElementOpts,
} from '../../tk-element/tk-element';
import {
  getHorizontalBar,
} from '../../../horizontal-bar/horizontal-bar';

const logger = Logger.init();

export type MemWidgetBoxOpts = {

} & TkElementOpts;

export type MemWidgetBoxDrawOpts = {

};

export class MemWidgetBox extends TkElement {

  memData: MemSample['data'];

  leftPad: number;
  rightPad: number;
  topPad: number;
  bottomPad: number;
  contentHeight: number;

  constructor(opts: TkElementOpts) {
    let leftPad: number, rightPad: number,
      topPad: number, bottomPad: number,
      contentHeight: number
    ;
    leftPad = 1;
    rightPad = 1;
    topPad = 1;
    bottomPad = 1;
    contentHeight = 3;
    if(opts.screenBufOpts.height > (topPad + contentHeight + bottomPad)) {
      opts.screenBufOpts.height = topPad + contentHeight + bottomPad;
    }
    logger.log(opts.screenBufOpts.height);
    super(opts);
    this.leftPad = leftPad;
    this.rightPad = rightPad;
    this.topPad = topPad;
    this.bottomPad = bottomPad;
    this.contentHeight = contentHeight;
  }

  setData(memData: MemSample['data']) {
    this.memData = memData;
  }

  draw(opts: MemWidgetBoxDrawOpts = {}) {
    let usedMemory: number, usedMemoryPercentStr: string;
    let memBarWidth: number;
    let memBarValStr: string, memBarAttr: tk.ScreenBuffer.Attributes;

    let yPos: number;

    super._fill();

    yPos = this.topPad;

    memBarWidth = Math.floor(this.width / 2);
    memBarWidth = Math.floor(this.width - (this.leftPad + this.rightPad));

    usedMemory = this.getUsedMem();
    usedMemoryPercentStr = (usedMemory * 100).toFixed(3);
    memBarValStr = getHorizontalBar(memBarWidth * 8, usedMemory);
    if(memBarValStr.length < memBarWidth) {
      memBarValStr = `${memBarValStr}${' '.repeat(memBarWidth - memBarValStr.length)}`;
    }

    this.screenBuffer.put({
      x: 1,
      y: yPos,
      dx: 1,
      dy: 0,
      attr: {
        underline: true,
      },
      wrap: true,
    }, 'Memory');

    yPos++;
    this.screenBuffer.put({
      x: 1,
      y: yPos,
      dx: 1,
      dy: 0,
      attr: {},
      wrap: true,
    }, usedMemoryPercentStr);

    // memBarAttr = {
    //   color: 209,
    //   bgColor: 87,
    // };
    // memBarAttr = {
    //   color: 34,
    //   bgColor: 118,
    // };

    memBarAttr = {
      color: 88,
      bgColor: 76,
    };

    yPos++;
    this.screenBuffer.put({
      x: 1,
      y: yPos,
      dx: 1,
      dy: 0,
      attr: memBarAttr,
      wrap: true,
    }, memBarValStr);

    // █ ▉ ▊ ▋ ▌ ▍ ▎ ▏
    // █▉▊▋▌▍▎▏

    this.screenBuffer.draw({
      delta: true,
    });
  }

  private getUsedMem(): number {
    if(this.memData === undefined) {
      return 0;
    }
    return (1 - (this.memData.available / this.memData.total));
  }
}
