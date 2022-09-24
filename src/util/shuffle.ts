import { Logger } from './logger';

const logger = Logger.init();

export function cardShuffle<T>(arr: T[], numShuffles = 1): T[] {
  let n: number;
  arr = arr.slice();

  n = numShuffles;
  while(n > 0) {
    logger.log('');
    logger.log(`shuffle ${(numShuffles - n) + 1} / ${numShuffles}:`);
    n--;
    arr = doShuffle(arr);
  }

  return arr;

  function doShuffle(_arr: T[]): T[] {
    let firstHalf: T[], lastHalf: T[];
    let zippedArr: T[];
    [
      firstHalf,
      lastHalf,
    ] = splitDeck(arr);
    logger.log('firstHalf');
    logger.log(firstHalf);
    logger.log('lastHalf');
    logger.log(lastHalf);
    zippedArr = zipMerge(lastHalf, firstHalf);
    logger.log('zippedArr');
    logger.log(zippedArr);

    return zippedArr;
  }
}

function splitDeck<T>(_arr: T[]): [ T[], T[] ] {
  let middleIdx: number;
  let aHalf: T[], bHalf: T[];
  middleIdx = Math.floor(_arr.length / 2);
  aHalf = _arr.slice(0, middleIdx);
  bHalf = _arr.slice(middleIdx);
  return [
    aHalf,
    bHalf,
  ];
}

function zipMerge<T>(a: T[], b: T[]): T[] {
  let maxLen: number, n: number;
  let merged: T[];
  a = a.slice();
  b = b.slice();
  // iterate over the larger array
  maxLen = Math.max(a.length, b.length);
  merged = [];
  n = 0;
  while(n < maxLen) {
    let aVal: T, bVal: T;
    if(n < a.length) {
      aVal = a[n];
      merged.push(aVal);
    }
    if(n < b.length) {
      bVal = b[n];
      merged.push(bVal);
    }
    n++;
  }
  return merged;
}
