
import tk from 'terminal-kit';

import {
  CpuBarBox,
} from './cpu-bar/cpu-bar-box';
import { Logger } from '../../../../util/logger';
import { OMIT_COLOR_CODES, TERM_COLOR_CODES } from './term-color';

import {
  ColorPaletteBox,
} from './color-palette/color-palette-box';
import { leafShuffle, splitLeafShuffle } from '../../../../util/shuffle';
import { MemWidgetBox } from './mem-widget/mem-widget-box';
import { NetWidgetBox } from './net-widget/net-widget-box';
import { MemSample } from '../../monitor/mem-sampler';
import { Timer } from '../../../../util/timer';
import { NetSample } from '../../monitor/net-sampler';

export type TkAppOpts = {
  numCpus: number;
  getNetworkSamples: (startTime: number) => NetSample[];
  onInput?: (keyName: string, matches: string[]) => void;
};

export type TkAppState = {
  destroyed: boolean;
};

export type TkApp = {
  draw: () => Promise<TkAppState>;
  getDrawCount: () => number;
  setCpuBarData: (data: Record<number, number>) => void;
  setMemData: (data: MemSample['data']) => void;
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
  let memWidgetBox: MemWidgetBox;
  let netWidgetBox: NetWidgetBox;

  let doRedraw: boolean, drawCount: number;
  let termColors: number[];

  let cpuBarData: Record<number, number>;

  const logger = Logger.init();

  // termColors = splitLeafShuffle(TERM_COLOR_CODES.slice(), 1);
  // termColors = leafShuffle(TERM_COLOR_CODES.slice(), 1);
  termColors = TERM_COLOR_CODES.slice();

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
    getDrawCount: () => drawCount,
    setCpuBarData: updateCpuData,
    setMemData: (memData) => {
      memWidgetBox.setData(memData);
    }
  };

  function updateCpuData(data: Record<number, number>) {
    Object.keys(data).forEach(cpuKey => {
      let cpuIdx: number;
      cpuIdx = +cpuKey;
      cpuBarData[cpuIdx] = data[cpuIdx];
      cpuBarBoxes[cpuIdx].setData(cpuBarData[cpuIdx]);
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
    targetBoxHeight = Math.floor(screen.height / 3);

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
      cpuBoxColors = termColors
        .slice()
        .filter(termColorCode => !OMIT_COLOR_CODES.includes(termColorCode))
      ;
      // cpuBoxColors = splitLeafShuffle(cpuBoxColors, 1);
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

    memWidgetBox = new MemWidgetBox({
      screenBufOpts: {
        dst: screen,
        height: Math.floor(screen.height / 3),
        width: Math.floor(screen.width / 3),
        x: 0,
        y: cpuBarBoxContainer.height,
      }
    });

    netWidgetBox = new NetWidgetBox({
      screenBufOpts: {
        dst: screen,
        height: 4,
        width: Math.floor(screen.width / 3),
        x: 0,
        y: memWidgetBox.y + memWidgetBox.height,
      },
    });

    colorPaletteBox = new ColorPaletteBox({
      screenBufOpts: {
        dst: screen,
        height: screen.height - (
          netWidgetBox.y + netWidgetBox.height
        ),
        width: screen.width - cpuBarBoxContainer.width - 2,
        // width: screen.width - 2,
        // x: cpuBarBoxContainer.width + 1,
        // y: 0,
        x: 0,
        y: netWidgetBox.y + netWidgetBox.height,
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
    memWidgetBox.draw();
    netWidgetBox.draw({
      getNetworkSamples: opts.getNetworkSamples,
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
        // color,
      });
    });

    cpuBarBoxContainer.draw({
      delta: true,
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
