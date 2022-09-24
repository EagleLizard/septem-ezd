
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
