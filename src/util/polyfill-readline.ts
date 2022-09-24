
export function polyfillReadline(readline: any) {
  (readline.Interface.prototype as any)._insertString = function(c: any) {
    if(this.cursor < this.line.length) {
      let beg = this.line.slice(0, this.cursor);
      let end = this.line.slice(this.cursor, this.line.length);

      this.line = beg + c + end;
      this.cursor += c.length;
      this._refreshLine();
    } else {
      this.line += c;
      this.cursor += c.length;
      this.output.write(c);
      this._moveCursor(0);
    }
  };
}
