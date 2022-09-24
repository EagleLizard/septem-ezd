
import * as readline from 'readline';
import { polyfillReadline } from '../../util/polyfill-readline';
import { sleep } from '../../util/sleep';

const TERMINAL_ROWS = process.stdout.rows;
const TERMINAL_COLUMNS = process.stdout.columns;

const FPS = 60;
const INTERVAL_MS = Math.round(1000 / FPS);

export async function spaceFillingMain() {
  let terminalMatrix: string[][];
  let rl: readline.ReadLine;

  polyfillReadline(readline);

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('close', () => {
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('gismt');
  });

  terminalMatrix = new Array(TERMINAL_ROWS).fill(0).map(() => {
    return new Array(TERMINAL_COLUMNS).fill(0).map(() => {
      return ' ';
    });
  });

  clear();
  await drawDots(rl, terminalMatrix);
  rl.close();
}

async function drawDots(rl: readline.ReadLine, terminalMatrix: string[][]) {
  for(let y = 0; y < terminalMatrix.length; ++y) {
    for(let x = 0; x < terminalMatrix[y].length; ++x) {
      terminalMatrix[y][x] = '.';
      draw(rl, terminalMatrix);
      await sleep(INTERVAL_MS);
    }
  }
}

function clear() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function draw(rl: readline.ReadLine, terminalMatrix: string[][]) {
  let rowStrs: string[];
  rowStrs = [];
  for(let y = 0; y < terminalMatrix.length; ++y) {
    let xChars: string[];
    xChars = [];
    for(let x = 0; x < terminalMatrix[y].length; ++x) {
      // console.log(`x: ${x}, y: ${y}`);
      // readline.cursorTo(process.stdout, x, y);
      // rl.write(terminalMatrix[y][x]);
      xChars.push(terminalMatrix[y][x]);
    }
    rowStrs.push(xChars.join(''));
    // rl.write(xChars.join(''));
  }
  readline.cursorTo(process.stdout, 0, 0);
  rl.write(rowStrs.join('\n'));
}
