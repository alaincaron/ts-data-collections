import { Comparator, Comparators } from 'ts-fluent-iterators';

export function bsearch<T>(arr: T[], el: T, compare?: Comparator<T>): number {
  compare ??= Comparators.defaultComparator;
  let m = 0;
  let n = arr.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = compare(el, arr[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return ~m;
}
