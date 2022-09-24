
import { sleep } from '../util/sleep';
import { rand } from '../util/math';

export async function helloMain() {
  let msg: string;
  msg = [
    'The quick brown fox jumped over the lazy dog.',
    // 'THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG.',
    // 'The Quick Brown Fox Jumped Over The Lazy Dog.',
    'ThE qUiCk BrOwN fOx JuMpEd OvEr ThE lAzY dOg.',
    'I added some rules to make it seem more natural.',
    ' For instance, everything on the home row is a bit faster.',
    ' I also added some random variance for each keystroke.'
  ].join('\n');
  await writeMessage(msg);
}

let charMods: Record<string, number>;
charMods = {
  ' ': -0.75,
};

'asdfghjkl'.split('').forEach(char => {
  const mod = -0.35;
  charMods[char] = mod;
  charMods[char.toUpperCase()] = mod;
});
'qwertyuiop'.split('').forEach(char => {
  const mod = -0.25;
  charMods[char] = mod;
  charMods[char.toUpperCase()] = mod;
});
'zxcvbnm'.split('').forEach(char => {
  const mod = 0.1;
  charMods[char] = mod;
  charMods[char.toUpperCase()] = mod;
});

async function writeMessage(msg: string) {
  /*
    250 chars per minute
    approx. 1 char every 4s
    1 char every 250ms
  */
  let baseMs: number;
  let chars: string[], ms: number;

  chars = msg.split('');
  baseMs = Math.round(cpmToMs(800));

  printc('\n');
  for(let i = 0; i < chars.length; ++i) {
    let char: string;
    let randMod: number;

    char = chars[i];
    ms = baseMs;
    if(charMods[char] !== undefined) {
      ms = ms + (ms * charMods[char]);
    }

    randMod = rand(-0.5, 0);
    ms = ms + Math.round(ms * (randMod ?? 0));

    printc(char);
    await sleep(ms);
  }
  printc('\n');
}

function printc(char: string) {
  process.stdout.write(char);
}

function cpmToMs(cpm: number) {
  return 1000 / (cpm / 60);
}
