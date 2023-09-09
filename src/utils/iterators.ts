import { IteratorLike, ArrayLike } from '../utils';

export function* take<E>(n: number, iter: Iterator<E>): Iterator<E> {
  for (let i = 0; i < n; ++i) {
    const item = iter.next();
    if (item.done) break;
    yield item.value;
  }
}

export function* seedToIterator<E>(n: number, seed: (i: number) => E) {
  for (let i = 0; i < n; ++i) {
    yield seed(i);
  }
}

export function arrayLikeToIterator<E>(arrayLike: ArrayLike<E>): Iterator<E> {
  const { seed, length }: { seed: any; length: number } = arrayLike;
  if (typeof seed === 'function') {
    return seedToIterator(length, seed);
  }
  if (typeof seed.next === 'function') {
    return take(length, seed as Iterator<E>);
  } else if (typeof seed[Symbol.iterator] === 'function') {
    return take(length, (seed as Iterable<E>)[Symbol.iterator]());
  }
  throw new Error('Unable to convert object into an Iterator');
}

export function toIterator<E>(x: ArrayLike<E> | IteratorLike<E>): Iterator<E> {
  const iter: any = x as any;
  if (typeof iter[Symbol.iterator] === 'function') {
    return iter[Symbol.iterator]();
  } else if (typeof iter.iterator === 'function') {
    return iter.iterator();
  } else if (typeof iter === 'function') {
    return seedToIterator(Number.MAX_SAFE_INTEGER, iter);
  } else {
    return arrayLikeToIterator(iter as unknown as ArrayLike<E>);
  }
}