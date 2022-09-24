
import path from 'path';

import {
  DATA_DIR_PATH,
} from '../../constants';

export type EBookTxtFileSrc = {
  key: EBOOK_ENUM,
  title: string,
  uri: string,
};

export type EBookTxtFile = {
  filePath: string;
} & EBookTxtFileSrc;

export const TXT_DATA_DIRNAME = 'txt';
export const TXT_DATA_DIR_PATH = [
  DATA_DIR_PATH,
  TXT_DATA_DIRNAME,
].join(path.sep);
export const TXT_OUT_DIRNAME = 'txt-out';
export const TXT_OUT_DIR_PATH = [
  DATA_DIR_PATH,
  TXT_OUT_DIRNAME,
].join(path.sep);

export enum EBOOK_ENUM {
  SHAKESPEARE = 'SHAKESPEARE',
  MISERABLES = 'MISERABLES',
  WAR_AND_PEACE = 'WAR_AND_PEACE',
  MONTE_CRISTO = 'MONTE_CRISTO',
  THE_INFERNO = 'THE_INFERNO',
  KING_JAMES_BIBLE = 'KING_JAMES_BIBLE',
}

export const EBOOK_ENUM_ARRAY = Object.values(EBOOK_ENUM);

export const EBOOK_TXT_FILE_URI_MAP: Record<EBOOK_ENUM, EBookTxtFileSrc> = {
  [EBOOK_ENUM.SHAKESPEARE]: {
    key: EBOOK_ENUM.SHAKESPEARE,
    title: 'shakespeare',
    uri: 'https://www.gutenberg.org/files/100/100-0.txt',
  },
  [EBOOK_ENUM.MISERABLES]: {
    key: EBOOK_ENUM.MISERABLES,
    title: 'les-miserables',
    uri: 'https://www.gutenberg.org/files/135/135-0.txt',
  },
  [EBOOK_ENUM.WAR_AND_PEACE]: {
    key: EBOOK_ENUM.WAR_AND_PEACE,
    title: 'war-and-peace',
    uri: 'https://www.gutenberg.org/files/2600/2600-0.txt',
  },
  [EBOOK_ENUM.MONTE_CRISTO]: {
    key: EBOOK_ENUM.MONTE_CRISTO,
    title: 'count-of-monte-cristo',
    uri: 'https://www.gutenberg.org/files/1184/1184-0.txt',
  },
  [EBOOK_ENUM.THE_INFERNO]: {
    key: EBOOK_ENUM.THE_INFERNO,
    title: 'the-inferno',
    uri: 'https://www.gutenberg.org/files/41537/41537-0.txt',
  },
  [EBOOK_ENUM.KING_JAMES_BIBLE]: {
    key: EBOOK_ENUM.KING_JAMES_BIBLE,
    title: 'king-james-bible',
    uri: 'https://www.gutenberg.org/files/10/10-0.txt',
  }
};
