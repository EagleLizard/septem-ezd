
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const DEFAULT_CHARS = [
  ALPHABET.toLowerCase(),
  ALPHABET.toUpperCase(),
  '0123456789',
].join('');

export function randStr(strLen: number, charSet = DEFAULT_CHARS): string {
  let chars: string[];
  chars = Array(strLen).fill(0).map(() => {
    return charSet[randInt(0, charSet.length - 1)];
  });
  return chars.join('');
}

export function randInt(min: number, max: number): number {
  let result: number;
  result = Math.floor(Math.random() * (max - min + 1)) + min;
  return result;
}
