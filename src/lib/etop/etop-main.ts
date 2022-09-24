
import {
  tkMain,
} from './tk/tk-main';
import {
  Logger,
} from '../../util/logger';

export async function etopMain() {
  console.log('etop main');
  console.log('init');
  const logger = Logger.init();
  logger.log('start');
  await tkMain();
}
