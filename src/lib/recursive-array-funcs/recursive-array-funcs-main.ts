
import { Timer } from '../../util/timer';

const NUM_TEST_VALS = 1e3;

export function recursiveArrayFuncsMain() {
  let testArr: number[];
  testArr = Array(NUM_TEST_VALS).fill(0).map((val, idx) => idx + 1);
  testForEach(testArr);
}

function testForEach(testArr: number[]) {
  let forEachResult: string[], rForEachResult: string[];

  forEachResult = [];
  testArr.forEach((val, idx) => {
    forEachResult.push(getValStr(val, idx));
  });

  rForEachResult = [];
  r_forEach(testArr, (val, idx) => {
    rForEachResult.push(getValStr(val, idx));
  });

  function getValStr(val: number, idx: number) {
    return `${val}:${idx}`;
  }
}

function r_forEach<T>(arr: T[], cb: (value?: T, index?: number, array?: T[]) => void) {

  _r_forEach(0);

  function _r_forEach(idx: number) {
    let val: T;
    if(idx >= arr.length) {
      return;
    }
    val = arr[idx];
    cb(val, idx, arr);
    _r_forEach(idx + 1);
  }
}

function r_map<T1, T2>(arr: T1[], cb: (value?: T1, index?: number, array?: T1[]) => T2): T2[] {
  let resArr: T2[];
  resArr = Array(arr.length).fill(0).map(() => undefined as T2);

  _r_map(arr.length - 1);

  return resArr;

  function _r_map(idx: number) {
    let val: T1, res: T2;
    val = arr[idx];
    if(idx > 0) {
      _r_map(idx - 1);
    }
    res = cb(val, idx, arr);
    resArr[idx] = res;
  }
}

function r_reduce<T1, T2>(
  arr: T1[],
  cb: (
    previousValue?: T2,
    currentValue?: T1,
    currentINdex?: number,
    array?: T1[]
  ) => T2,
  initialValue: T2
): T2 {

  _r_reduce(arr.length - 1);

  return initialValue;

  function _r_reduce(idx: number) {
    if(idx > 0) {
      _r_reduce(idx - 1);
    }
    initialValue = cb(initialValue, arr[idx], idx, arr);
  }
}
