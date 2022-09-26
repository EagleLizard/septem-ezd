
import {
  tkMain,
} from './tk/tk-main';
import {
  Logger,
} from '../../util/logger';
import {
  cardShuffle,
} from '../../util/shuffle';

export async function etopMain() {
  setProcName();
  console.log('etop main');
  console.log('init');

  const logger = Logger.init();
  logger.log('!'.repeat(50));
  logger.log('start');
  logger.log('!'.repeat(50));

  // let arr: number[], shuffledArr: number[];
  // arr = Array(52).fill(0).map((v, idx) => idx + 1);

  // logger.log(arr);
  // shuffledArr = cardShuffle(arr, 3);

  // return;

  await tkMain();
}

function setProcName() {
  process.title = 'etop';
}
