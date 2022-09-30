
import tk from 'terminal-kit';

import {
  CpuBarBox,
} from './cpu-bar/cpu-bar-box';
import { Logger } from '../../../../util/logger';
import { TERM_COLOR_CODES } from './term-color';

import {
  ColorPaletteBox,
} from './color-palette/color-palette-box';
import { leafShuffle, splitLeafShuffle } from '../../../../util/shuffle';

export type TkAppOpts = {
  numCpus: number;
  onInput?: (keyName: string, matches: string[]) => void;
};

export type TkAppState = {
  destroyed: boolean;
};

export type TkApp = {
  draw: () => Promise<TkAppState>;
  setCpuBarData: (data: Record<number, number>) => void;
  getDrawCount: () => number;
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
  let doRedraw: boolean, drawCount: number;
  let termColors: number[];

  let cpuBarData: Record<number, number>;

  const logger = Logger.init();

  termColors = splitLeafShuffle(TERM_COLOR_CODES.slice());
  // termColors = leafShuffle(TERM_COLOR_CODES.slice());
  // termColors = TERM_COLOR_CODES.slice();

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
    // logger.log(keyName);
    switch(keyName) {
      case 'q':
      case 'CTRL_C':
        $destroy();
        break;
    }
    opts.onInput?.(keyName, matches);
  });

  process.on('exit', (code) => {
    $destroy();
    logger.log(`'exit' event with code: ${code}`);
    // process.exit(0);
  });
  process.once('SIGUSR2', () => {
    $destroy();
    logger.log('SIGUSR2 kill code ...');
    process.kill(process.pid, 'SIGUSR2');
  });
  process.once('SIGINT', () => {
    logger.log('SIGINT kill code ...');
    $destroy();
    process.kill(process.pid, 'SIGINT');
  });

  term.on('resize', (width: number, height: number) => {
    $initElements();
    $redraw();
  });

  $initElements();

  doRedraw = true;
  drawCount = 0;

  return {
    draw: async () => {
      $redraw();
      return {
        destroyed: !doRedraw,
      };
    },
    setCpuBarData: updateCpuData,
    getDrawCount: () => drawCount,
  };

  function updateCpuData(data: Record<number, number>) {
    Object.keys(data).forEach(cpuKey => {
      cpuBarData[+cpuKey] = data[+cpuKey];
    });
  }

  function $initElements() {
    let maxCpuBoxHeight: number, targetBoxHeight: number, boxHeight: number;

    screen = new tk.ScreenBuffer({
      dst: term,
      height: term.height,
      width: term.width,
      noFill: true,
    });

    maxCpuBoxHeight = Infinity;
    targetBoxHeight = Math.round(screen.height / 3);

    boxHeight = (targetBoxHeight > maxCpuBoxHeight)
      ? maxCpuBoxHeight
      : targetBoxHeight
    ;

    cpuBarBoxContainer = new tk.ScreenBuffer({
      dst: screen,
      height: boxHeight,
      width: opts.numCpus * cpuBarLabelWidth,
      x: 0,
      y: 0,
    });

    cpuBarBoxes = Array(opts.numCpus).fill(0).map((val, idx) => {
      let colorIdx: number, color: number;
      let cpuBoxColors: number[];
      cpuBoxColors = termColors.slice();
      colorIdx = Math.floor(cpuBoxColors.length / opts.numCpus) * idx;
      color = cpuBoxColors[colorIdx];
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
        color,
      });
    });

    colorPaletteBox = new ColorPaletteBox({
      screenBufOpts: {
        dst: screen,
        height: screen.height - cpuBarBoxContainer.height,
        width: screen.width - cpuBarBoxContainer.width - 2,
        // x: cpuBarBoxContainer.width + 1,
        // y: 0,
        x: 0,
        y: cpuBarBoxContainer.height,
      },
      colors: termColors,
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

    drawCount++;
  }

  function $redrawColorPalette() {
    colorPaletteBox.draw();
  }

  function $redrawCpuBox() {
    cpuBarBoxes.forEach((cpuBarBox, idx) => {
      let colorIdx: number, color: number;
      colorIdx = Math.floor(termColors.length / cpuBarBoxes.length) * idx;
      color = termColors[colorIdx];
      // term.getColor(color, rgb => {
      //   logger.log(`color: ${color}`);
      //   logger.log(rgb);
      // });
      cpuBarBox.draw({
        cpuBarVal: cpuBarData[idx],
        // color,
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
    term.processExit(undefined);
    // term.asyncCleanup().then(() => {
    //   logger.log('exiting...');
    //   process.exit(0);
    // });
  }
}
