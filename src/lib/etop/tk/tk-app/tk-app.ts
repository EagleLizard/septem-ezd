
import tk from 'terminal-kit';

import {
  CpuBarBox,
} from './cpu-bar/cpu-bar-box';
import { Logger } from '../../../../util/logger';
import { TERM_COLOR_CODES } from './term-color';

import {
  ColorPaletteBox,
} from './color-palette/color-palette-box';

export type TkAppOpts = {
  numCpus: number;
};

export type TkAppState = {
  destroyed: boolean;
};

export type TkApp = {
  draw: () => Promise<TkAppState>;
  setCpuBarData: (data: Record<number, number>) => void;
};

const TERM_FILL_ATTR: tk.ScreenBuffer.Attributes = {
  color: 'black',
  bgColor: 'black',
};

export async function setupTermKit(opts: TkAppOpts): Promise<TkApp> {
  let term: tk.Terminal, screen: tk.ScreenBuffer;
  let cpuBarBoxContainer: tk.ScreenBuffer, cpuBarLabelWidth: number;
  let cpuBarBoxes: CpuBarBox[];
  let colorPaletteBox: ColorPaletteBox;
  let doRedraw: boolean;

  let cpuBarData: Record<number, number>;

  const logger = Logger.init();

  cpuBarLabelWidth = -Infinity;
  cpuBarData = Array(opts.numCpus).fill(0).reduce((acc, curr, idx) => {
    let currLabelLen: number;
    currLabelLen = `${idx}`.length;
    if(currLabelLen > cpuBarLabelWidth) {
      cpuBarLabelWidth = currLabelLen;
    }
    acc[idx] = 0;
    return acc;
  }, {} as Record<number, number>);

  cpuBarLabelWidth = cpuBarLabelWidth + 0; // + 1 for some padding

  term = tk.terminal;
  // term.fullscreen(true);
  term.grabInput(true);
  term.hideCursor(true);

  // logger.log((term as any).support);

  logger.log(`term width: ${term.width}`);
  logger.log(`term height: ${term.height}`);

  term.on('key', (keyName: string, matches: string[]) => {
    switch(keyName) {
      case 'q':
      case 'CTRL_C':
        $destroy();
        break;
    }
  });

  screen = new tk.ScreenBuffer({
    dst: term,
    height: term.height,
    width: term.width,
    noFill: true,
  });

  cpuBarBoxContainer = new tk.ScreenBuffer({
    dst: screen,
    height: Math.round(screen.height / 2),
    width: opts.numCpus * cpuBarLabelWidth,
    x: 0,
    y: 0,
  });

  cpuBarBoxes = Array(opts.numCpus).fill(0).map((val, idx) => {
    return new CpuBarBox({
      screenBufOpts: {
        dst: cpuBarBoxContainer,
        height: cpuBarBoxContainer.height,
        width: cpuBarLabelWidth,
        x: idx * cpuBarLabelWidth,
        y: 0
      },
      cpuIdx: idx,
      numCpus: opts.numCpus,
    });
  });

  colorPaletteBox = new ColorPaletteBox({
    screenBufOpts: {
      dst: screen,
      height: cpuBarBoxContainer.height,
      width: screen.width - cpuBarBoxContainer.width - 2,
      // x: cpuBarBoxContainer.width + 1,
      // y: 0,
      x: 0,
      y: cpuBarBoxContainer.height,
    },
  });

  term.on('resize', (width: number, height: number) => {
    logger.log('resize');
    logger.log(`width: ${width}`);
    logger.log(`width: ${height}`);
  });

  doRedraw = true;

  return {
    draw: async () => {
      $redraw();
      return {
        destroyed: !doRedraw,
      };
    },
    setCpuBarData: updateCpuData,
  };

  function updateCpuData(data: Record<number, number>) {
    Object.keys(data).forEach(cpuKey => {
      cpuBarData[+cpuKey] = data[+cpuKey];
    });
  }

  function $redraw() {

    cpuBarBoxContainer.fill({
      attr: TERM_FILL_ATTR,
    });
    screen.fill({
      attr: TERM_FILL_ATTR,
    });

    $redrawCpuBox();
    $redrawColorPalette();

    cpuBarBoxContainer.draw({
      delta: true,
    });
    screen.draw({
      delta: true,
    });
  }

  function $redrawColorPalette() {
    colorPaletteBox.draw();
  }

  function $redrawCpuBox() {
    cpuBarBoxes.forEach((cpuBarBox, idx) => {
      cpuBarBox.draw({
        cpuBarVal: cpuBarData[idx],
        logger,
      });
    });
  }

  function $destroy() {
    doRedraw = false;
    term.hideCursor(false);
    term.styleReset();
    term.resetScrollingRegion();
    term.moveTo(term.width, term.height);
    term('\n');
    term.processExit(0);
  }
}
