
const NUM_TEST_VALS = 1e6;
const NUM_TEST_INTERATIONS = 10;

const NUMBER_CHARS = '0123456789'.split('');

(() => {
  try {
    main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

function main() {
  console.log(`Testing ${NUM_TEST_VALS.toLocaleString()} vals over ${NUM_TEST_INTERATIONS.toLocaleString()} test runs.`);
  unitTestFn(parseFloatConst);
  unitTestFn(parseFloatLet);
  testHandler(parseFloatConst);
  testHandler(parseFloatLet);
}

function testHandler(fn) {
  let testVals, testResults, filteredResults;
  let testRunMsArr, startMs, deltaMs;
  let testRunMsSum, testRunMsAvg;
  testRunMsArr = [];
  for(let i = 0; i < NUM_TEST_INTERATIONS; ++i) {
    testVals = getTestVals(NUM_TEST_VALS);
    testResults = [];
    startMs = Date.now();
    for(let k = 0; k < testVals.length; ++k) {
      testResults.push(
        fn(testVals[k])
      );
    }
    deltaMs = Date.now() - startMs;
    testRunMsArr.push(deltaMs);

    filteredResults = testResults.filter(testResult => !isNaN(testResult));
    filteredResults.forEach(filteredResult => {
      if(isNaN(+filteredResult)) {
        throw new Error(filteredResult);
      }
    });
  }
  testRunMsSum = testRunMsArr.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  testRunMsAvg = testRunMsSum / testRunMsArr.length;
  console.log(`${fn.name}() took an average of ${Math.round(testRunMsAvg).toLocaleString()}ms`);
}

function unitTestFn(fn) {
  let validVals;
  validVals = [
    '0',
    '0.0',
    '1',
    '1.0',
    '3.25',
    '-0.0',
    '-1',
    '-1.0',
    '-3.25',
    '1e3',
    '1e-3',
    '1.1e3',
    '-1e3',
    '-1e-3',
    '-1.1e3',
  ];
  validVals.forEach(validVal => {
    if(isNaN(fn(validVal))) {
      throw new Error(`Expected ${fn.name}('${validVal}') to be valid, returned NaN.`);
    }
  });
}

function getTestVals(numTestVals) {
  return Array(numTestVals).fill(0).map(() => {
    return randStr(32, '0123456789-e.');
  });
}

function parseFloatConst(numStr) {
  let numberPart;
  let intPart;
  const hasExponent = numStr.includes('e');
  if(hasExponent) {
    const exponentParts = numStr.split('e');
    if(exponentParts.length !== 2) {
      return NaN;
    }
    numberPart = exponentParts[0].trim();
    const exponentPart = exponentParts[1].trim();

    if(exponentPart.length < 1) {
      return NaN;
    }

    for(let i = 0; i < exponentPart.length; ++i) {
      const currChar = exponentPart[i];
      if(i === 0) {
        if(
          (currChar !== '-')
          && !NUMBER_CHARS.includes(currChar)
        ) {
          return NaN;
        }
      } else if(!NUMBER_CHARS.includes(currChar)) {
        return NaN;
      }
    }
  } else {
    numberPart = numStr.trim();
  }

  if(numberPart.length < 1) {
    return NaN;
  }

  const hasFraction = numberPart.includes('.');

  if(hasFraction) {
    const fractionParts = numberPart.split('.');
    if(fractionParts.length !== 2) {
      return NaN;
    }
    intPart = fractionParts[0].trim();
    const fractionPart = fractionParts[1].trim();

    if(fractionPart.length < 1) {
      return NaN;
    }

    for(let i = 0; i < fractionPart.length; ++i) {
      if(!NUMBER_CHARS.includes(fractionPart[i])) {
        return NaN;
      }
    }
  } else {
    intPart = numberPart.trim();
  }
  if(intPart.length < 1) {
    return NaN;
  }
  for(let i = 0; i < intPart.length; ++i) {
    if(!NUMBER_CHARS.includes(intPart[i])) {
      if(
        !(
          (i === 0)
          && (intPart[i] === '-')
        )
      ) {
        return NaN;
      }
    }
  }
  return numStr;
}

function parseFloatLet(numStr) {
  let hasExponent, exponentParts, exponentPart;
  let numberPart;
  let hasFraction, fractionParts, intPart, fractionPart;
  hasExponent = numStr.includes('e');
  if(hasExponent) {
    exponentParts = numStr.split('e');
    if(exponentParts.length !== 2) {
      return NaN;
    }
    numberPart = exponentParts[0].trim();
    exponentPart = exponentParts[1].trim();

    if(exponentPart.length < 1) {
      return NaN;
    }

    for(let i = 0; i < exponentPart.length; ++i) {
      let currChar;
      currChar = exponentPart[i];
      if(i === 0) {
        if(
          (currChar !== '-')
          && !NUMBER_CHARS.includes(currChar)
        ) {
          return NaN;
        }
      } else if(!NUMBER_CHARS.includes(currChar)) {
        return NaN;
      }
    }
  } else {
    numberPart = numStr.trim();
  }

  if(numberPart.length < 1) {
    return NaN;
  }

  hasFraction = numberPart.includes('.');

  if(hasFraction) {
    fractionParts = numberPart.split('.');
    if(fractionParts.length !== 2) {
      return NaN;
    }
    intPart = fractionParts[0].trim();
    fractionPart = fractionParts[1].trim();

    if(fractionPart.length < 1) {
      return NaN;
    }

    for(let i = 0; i < fractionPart.length; ++i) {
      if(!NUMBER_CHARS.includes(fractionPart[i])) {
        return NaN;
      }
    }
  } else {
    intPart = numberPart.trim();
  }
  if(intPart.length < 1) {
    return NaN;
  }
  for(let i = 0; i < intPart.length; ++i) {
    if(!NUMBER_CHARS.includes(intPart[i])) {
      if(
        !(
          (i === 0)
          && (intPart[i] === '-')
        )
      ) {
        return NaN;
      }
    }
  }
  return numStr;
}

function randStr(strLen, charSet) {
  let chars;
  chars = Array(strLen).fill(0).map(() => {
    return charSet[randInt(0, charSet.length - 1)];
  });
  return chars.join('');
}

function randInt(min, max) {
  let result;
  result = Math.floor(Math.random() * (max - min + 1)) + min;
  return result;
}
