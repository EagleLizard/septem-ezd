
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { helloMain } from './lib/hello';
import { spaceFillingMain } from './lib/space-filling/space-filling-main';
import { recursiveArrayFuncsMain } from './lib/recursive-array-funcs/recursive-array-funcs-main';
import { etopMain } from './lib/etop/etop-main';
import { cpuHogMain } from './lib/cpu-hog/cpu-hog-main';
import { txtMain } from './lib/txt/txt-main';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  // await helloMain();
  // await spaceFillingMain();
  // recursiveArrayFuncsMain();
  // await cpuHogMain();
  await etopMain();
  // await txtMain();
}
