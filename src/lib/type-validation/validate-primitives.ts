
export function isString(val: unknown): val is string {
  if((typeof val) === 'string') {
    return true;
  }
  return false;
}

export function isObject(val: unknown): val is Record<string, unknown> {
  if((typeof val) !== 'object') {
    return false;
  }
  return true;
}

export function isPromise(val: unknown): val is Promise<unknown> {
  if(!isObject(val)) {
    return false;
  }
  if(val instanceof Promise) {
    return true;
  }
  return (typeof (val as any)?.then) === 'function';
}

