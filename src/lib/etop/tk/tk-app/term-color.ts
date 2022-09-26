
import { createHash, Hash, getHashes } from 'crypto';

const ALL_TERM_COLOR_CODES = Array(256).fill(0).map((v, i) => i);

const OMIT_COLOR_CODES: number[] = [
  ...getRangeInclusive(16, 27),
  // ...getRangeInclusive(28, 33),
  ...getRangeInclusive(52, 81),
  ...getRangeInclusive(88, 117),
  ...getRangeInclusive(124, 159),
  ...getRangeInclusive(160, 177),
  // ...getRangeInclusive(160, 195),
  // 0,
  // 4,
  // 7,
  // 8,
  // 15,
  // 16, 17, 18, 19, 20, 21,
  // 22, 23
];

let TERM_COLOR_CODES = ALL_TERM_COLOR_CODES
  .slice(16, 232) // min:16 max:231
  .filter(termColorCode => !OMIT_COLOR_CODES.includes(termColorCode))
;

export {
  TERM_COLOR_CODES,
};

function getRangeInclusive(start: number, end: number): number[] {
  return Array((end + 1) - start).fill(0).map((v, i) => i + start);
}

export function shuffleColorsHash(colorCodes: number[]): number[] {
  let truncHashVals: number[], truncHashTuples: [ number, number ][];
  let shuffledColorCodes: number[];
  colorCodes = colorCodes.slice();
  truncHashVals = colorCodes.map(colorCode => {
    let hashVal: string, truncVal: number;
    hashVal = createHash('md5')
      .update(new Int32Array(colorCode))
      .digest('hex')
    ;
    truncVal = parseInt(hashVal.substring(0, 5), 16);
    return truncVal;
  });
  truncHashTuples = colorCodes.map((colorCode, idx) => {
    return [
      colorCode,
      truncHashVals[idx],
    ];
  });
  truncHashTuples.sort((a, b) => {
    let aTrunc: number, bTrunc: number;
    aTrunc = a[1];
    bTrunc = b[1];
    if(aTrunc > bTrunc) {
      return -1;
    } else if(aTrunc < bTrunc) {
      return 1;
    } else {
      return 0;
    }
  });
  shuffledColorCodes = truncHashTuples.map(truncHashTuple => {
    return truncHashTuple[0];
  });
  return shuffledColorCodes;
}
