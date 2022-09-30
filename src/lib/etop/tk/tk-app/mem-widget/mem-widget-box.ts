
import {
  TkElement,
  TkElementOpts,
} from '../../tk-element/tk-element';

export type MemWidgetBoxOpts = {

} & TkElementOpts;

export type MemWidgetBoxDrawOpts = {

};

export class MemWidgetBox extends TkElement {
  constructor(opts: TkElementOpts) {
    super(opts);
  }

  draw(opts: MemWidgetBoxDrawOpts = {}) {
    super.draw();
    this.screenBuffer.put({
      x: 1,
      y: 1,
      dx: 1,
      dy: 0,
      attr: {},
      wrap: true,
    }, 'Memory');
  }
}
