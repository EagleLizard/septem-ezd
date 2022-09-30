
import tk from 'terminal-kit';

export type ScreenBufferOpts = Pick<tk.ScreenBuffer.Options,
'dst'
| 'width'
| 'height'
| 'x'
| 'y'
>;

export const TERM_FILL_ATTR: tk.ScreenBuffer.Attributes = {
  color: 'black',
  bgColor: 'black',
};

export type TkElementOpts = {
  screenBufOpts: ScreenBufferOpts,
};

export abstract class TkElement {
  screenBuffer: tk.ScreenBuffer;

  constructor(opts: TkElementOpts) {
    this.screenBuffer = new tk.ScreenBuffer(opts.screenBufOpts);
  }

  protected draw() {
    this.screenBuffer.fill({
      attr: TERM_FILL_ATTR,
    });
  }
}
