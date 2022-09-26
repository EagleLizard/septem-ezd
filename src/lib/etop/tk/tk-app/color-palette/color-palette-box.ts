
import tk from 'terminal-kit';
import { cardShuffle } from '../../../../../util/shuffle';

import { ScreenBufferOpts, TERM_FILL_ATTR } from '../../element';
import { shuffleColorsHash, TERM_COLOR_CODES } from '../term-color';

export type ColorPaletteBoxOpts = {
  screenBufOpts: ScreenBufferOpts;
};

export type ColorPaletteBoxDrawOpts = {

};

export class ColorPaletteBox {
  screenBuffer: tk.ScreenBuffer;

  constructor(opts: ColorPaletteBoxOpts) {
    this.screenBuffer = new tk.ScreenBuffer(opts.screenBufOpts);
  }

  draw(opts: ColorPaletteBoxDrawOpts = {}) {
    let x: number, y: number;
    let colorLabels: string[], maxLabelLength: number;
    let colorSampleWidth: number, printWidth: number,
      labelWidth: number, leftPad: number;
    let colorCodes: number[];

    colorCodes = TERM_COLOR_CODES;
    // colorCodes = shuffleColorsHash(TERM_COLOR_CODES);
    // colorCodes = cardShuffle(TERM_COLOR_CODES, 3);

    colorLabels = colorCodes.map(colorCode => `${colorCode}`);
    maxLabelLength = -Infinity;
    colorLabels.forEach(colorLabel => {
      if(colorLabel.length > maxLabelLength) {
        maxLabelLength = colorLabel.length;
      }
    });
    x = 0;
    y = 0;
    labelWidth = maxLabelLength;
    colorSampleWidth = 2;
    leftPad = 1;
    printWidth = leftPad + labelWidth + colorSampleWidth;

    this.screenBuffer.fill({
      attr: TERM_FILL_ATTR,
    });

    for(let i = 0; i < colorCodes.length; ++i) {
      let currColorCode: number, currLabel: string;
      currColorCode = colorCodes[i];
      currLabel = colorLabels[i];
      if(y > this.screenBuffer.height - 1) {
        y = 0;
        x = x + printWidth;
      }
      this.screenBuffer.put({
        x: labelWidth +  x,
        y,
        dx: 1,
        dy: 0,
        attr: {
          color: currColorCode,
          bold: true,
        },
        wrap: false,
      }, ' ⣿');
      this.screenBuffer.put({
        x: x + (labelWidth - currLabel.length),
        y,
        dx: 1,
        dy: 0,
        attr: {
          color: currColorCode,
        },
        wrap: false,
      }, currLabel);
      ++y;
    }
    this.screenBuffer.draw({
      delta: true,
    });
  }

}
