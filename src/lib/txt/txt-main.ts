
import path from 'path';

import { mkdirIfNotExistRecursive } from '../../util/files';
import {
  EBookTxtFile,
  EBookTxtFileSrc,
  EBOOK_ENUM,
  EBOOK_ENUM_ARRAY,
  EBOOK_TXT_FILE_URI_MAP,
  TXT_DATA_DIR_PATH,
  TXT_OUT_DIR_PATH,
} from './txt-constants';
import { Timer } from '../../util/timer';
import { getIntuitiveTimeString } from '../../util/print-util';
import {
  downloadEBook,
  readEBook,
} from './e-book/e-book-service';
import { createWriteStream, WriteStream } from 'fs';

export async function txtMain() {
  let eBookTxtFileMap: Record<EBOOK_ENUM, EBookTxtFile>;
  let eBookCharCounts: Record<EBOOK_ENUM, Record<string, number>>;

  eBookCharCounts = EBOOK_ENUM_ARRAY.reduce((acc, curr) => {
    acc[curr] = {};
    return acc;
  }, {} as Record<EBOOK_ENUM, Record<string, number>>);

  eBookTxtFileMap = await downloadEBooks();

  console.log(eBookTxtFileMap);
  for(let i = 0; i < EBOOK_ENUM_ARRAY.length; ++i) {
    let currEBookMeta: EBookTxtFile;
    let currEbookTimer: Timer, currEBookDeltaMs: number;
    let lineCount: number,
      totalCharCount: number,
      chunkCount: number
    ;
    let eBookStartFlag: boolean;
    let charCountMap: Record<string, number>;
    charCountMap = {};

    lineCount = 0;
    totalCharCount = 0;

    const lineCb = (line: string) => {
      for(let k = 0; k < line.length; ++k) {
        let currChar: string;
        currChar = line[k];
        if(charCountMap[currChar] === undefined) {
          charCountMap[currChar] = 0;
        }
        charCountMap[currChar]++;
        totalCharCount++;
      }
      lineCount++;
    };

    chunkCount = 0;
    const chunkCb = (chunk: string | Buffer) => {
      chunkCount++;
    };

    currEBookMeta = eBookTxtFileMap[EBOOK_ENUM_ARRAY[i]];
    console.log(`reading ${currEBookMeta.title}`);

    currEbookTimer = Timer.start();
    await readEBook(currEBookMeta, {
      lineCb,
      chunkCb,
    });
    currEBookDeltaMs = currEbookTimer.stop();

    // console.log(charCountMap);

    console.log(`lineCount: ${lineCount.toLocaleString()}`);
    console.log(`totalCharCount: ${totalCharCount.toLocaleString()}`);
    console.log(`chunks: ${chunkCount}`);
    console.log(getIntuitiveTimeString(currEBookDeltaMs));
    console.log('');
  }

  await mkdirIfNotExistRecursive(TXT_OUT_DIR_PATH);

  for(let i = 0; i < EBOOK_ENUM_ARRAY.length; ++i) {
    let currEBookKey: EBOOK_ENUM, currCharCountMap: Record<string, number>;
    let charCountTuples: [ string, number ][];
    let outFilePath: string, ws: WriteStream;
    currEBookKey = EBOOK_ENUM_ARRAY[i];
    currCharCountMap = eBookCharCounts[currEBookKey];
    charCountTuples = Object.entries(currCharCountMap);
    charCountTuples.sort((a, b) => {
      let aCount: number, bCount: number;
      aCount = a[1];
      bCount = b[1];
      if(aCount > bCount) {
        return -1;
      } else if(aCount < bCount) {
        return 1;
      } else {
        return 0;
      }
    });
    outFilePath = `${TXT_OUT_DIR_PATH}${path.sep}${eBookTxtFileMap[currEBookKey].title}.char-count.txt`;
    ws = createWriteStream(outFilePath);
    await new Promise<void>((resolve, reject) => {
      ws.on('error', err => {
        reject(err);
      });
      ws.once('ready', () => {
        charCountTuples.forEach(charCountTuple => {
          ws.write(`'${charCountTuple[0]}' : ${charCountTuple[1]}\n`);
        });
        ws.end(() => {
          resolve();
        });
      });
    });
  }
}

async function downloadEBooks(): Promise<Record<EBOOK_ENUM, EBookTxtFile>> {
  let eBookTxtFileMap: Record<EBOOK_ENUM, EBookTxtFile>;
  let eBookPromises: Promise<EBookTxtFile>[];

  await mkdirIfNotExistRecursive(TXT_DATA_DIR_PATH);

  eBookTxtFileMap = EBOOK_ENUM_ARRAY.reduce((acc, curr) => {
    acc[curr] = getEbookTxtFileWithPath(EBOOK_TXT_FILE_URI_MAP[curr]);
    return acc;
  }, {} as Record<string, EBookTxtFile>);

  eBookPromises = [];

  for(let i = 0; i < EBOOK_ENUM_ARRAY.length; ++i) {
    let currEBookPromise: Promise<EBookTxtFile>;
    currEBookPromise = downloadEBook(eBookTxtFileMap[EBOOK_ENUM_ARRAY[i]]);
    eBookPromises.push(currEBookPromise);
  }
  await Promise.all(eBookPromises);
  return eBookTxtFileMap;
}

function getEbookTxtFileWithPath(eBookMetaSrc: EBookTxtFileSrc): EBookTxtFile {
  let filePath: string;
  filePath = `${TXT_DATA_DIR_PATH}${path.sep}${eBookMetaSrc.title}.txt`;
  return {
    key: eBookMetaSrc.key,
    title: eBookMetaSrc.title,
    uri: eBookMetaSrc.uri,
    filePath,
  };
}
