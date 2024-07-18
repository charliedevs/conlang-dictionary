export function unique<T>(value: T, index: number, arr: T[]) {
  return arr.indexOf(value) === index;
}
