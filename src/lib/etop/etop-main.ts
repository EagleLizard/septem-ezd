
import {
  tkMain,
} from './tk/tk-main';
import {
  Logger,
} from '../../util/logger';
import {
  leafShuffle,
  splitLeafShuffle,
} from '../../util/shuffle';

export async function etopMain() {
  setProcName();
  console.log('etop main');
  console.log('init');

  const logger = Logger.init();
  logger.log('!'.repeat(50));
  logger.log('start');
  logger.log('!'.repeat(50));

  await tkMain();
}

function setProcName() {
  process.title = 'etop';
}
