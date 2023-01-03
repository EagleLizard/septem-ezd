
import { Logger } from '../../../../../util/logger';
import { NetSample } from '../../../monitor/net-sampler';
import { TkElement, TkElementOpts } from '../../tk-element/tk-element';

const logger = Logger.init();

export type NetWidgetBoxOpts = {

} & TkElementOpts;

export type MemWidgetBoxDrawOpts = {
  getNetworkSamples: (startTime: number) => NetSample[];
};

export class NetWidgetBox extends TkElement {

  leftPad: number;
  rightPad: number;
  topPad: number;
  bottomPad: number;
  contentHeight: number;

  constructor(opts: NetWidgetBoxOpts) {
    let leftPad: number, rightPad: number,
      topPad: number, bottomPad: number,
      contentHeight: number, labelHeight: number
    ;
    // Height must be at least 2 and divisible by 2
    if(opts.screenBufOpts.height < 2) {
      throw new Error('NetWidgetBox height must be at least 2');
    }
    if((opts.screenBufOpts.height % 2) !== 0) {
      throw new Error('NetWidgetBox height must be divisible by 2');
    }
    leftPad = 1;
    rightPad = 1;
    topPad = 1;
    bottomPad = 1;
    labelHeight = 2;
    contentHeight = labelHeight + opts.screenBufOpts.height;
    // opts.screenBufOpts.height = topPad + contentHeight + bottomPad;
    opts.screenBufOpts = {
      ...opts.screenBufOpts,
      height: topPad + (contentHeight) + bottomPad
    };
    // if(opts.screenBufOpts.height > (topPad + contentHeight + bottomPad)) {
    //   opts.screenBufOpts.height = topPad + contentHeight + bottomPad;
    // }
    logger.log(opts.screenBufOpts.height);
    logger.log(opts.screenBufOpts.y);
    super(opts);
    this.leftPad = leftPad;
    this.rightPad = rightPad;
    this.topPad = topPad;
    this.bottomPad = bottomPad;
    this.contentHeight = contentHeight;
  }

  draw(opts: MemWidgetBoxDrawOpts) {
    let yPos: number;
    let contentWidth: number;
    let lookBackMs: number, startTime: number;
    let lookBackSamples: NetSample[];
    super._fill();
    yPos = this.topPad;
    this.screenBuffer.put({
      x: 1,
      y: yPos,
      dx: 1,
      dy: 0,
      attr: {
        underline: true,
      },
      wrap: true,
    }, 'Network');

    this.screenBuffer.draw({
      delta: true,
    });

    contentWidth = this.width - (this.leftPad + this.rightPad);

    lookBackMs = contentWidth * 2 * 1000;
    startTime = Date.now() - lookBackMs;

    lookBackSamples = opts.getNetworkSamples(startTime);
    // logger.log(lookBackSamples.length);
    // logger.log(lookbackMs);

    // logger.log(opts.getNetworkSamples(100));
  }
}
