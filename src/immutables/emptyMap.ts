import { BinaryConsumer, FluentIterator } from 'ts-fluent-iterators';
import { isMap, NavigableMap } from '../maps';
import { hashIterableUnordered } from '../utils';

class EmptyMap<K, V> implements NavigableMap<K, V> {
  private static readonly EMPTY_MAP = new EmptyMap<never, never>();

  private constructor() {}

  lowerKey(_: K) {
    return undefined;
  }

  lowerEntry(_: K) {
    return undefined;
  }

  higherKey(_: K) {
    return undefined;
  }

  higherEntry(_: K) {
    return undefined;
  }

  floorEntry(_: K) {
    return undefined;
  }

  floorKey(_: K) {
    return undefined;
  }

  ceilingKey(_: K) {
    return undefined;
  }

  ceilingEntry(_: K) {
    return undefined;
  }

  firstEntry() {
    return undefined;
  }

  lastEntry() {
    return undefined;
  }

  firstKey() {
    return undefined;
  }

  lastKey() {
    return undefined;
  }

  reverseEntryIterator() {
    return FluentIterator.empty();
  }

  reverseKeyIterator() {
    return FluentIterator.empty();
  }

  reverseValueIterator() {
    return FluentIterator.empty();
  }

  *reverseEntries() {}

  *[Symbol.iterator]() {}

  static instance<K, V>(): EmptyMap<K, V> {
    return EmptyMap.EMPTY_MAP;
  }

  getEntry(_k: K) {
    return undefined;
  }

  get(_k: K) {
    return undefined;
  }

  getOrDefault(_k: K, defaultValue: V) {
    return defaultValue;
  }

  forEach(_consumer: BinaryConsumer<K, V>) {}

  containsKey(_: K) {
    return false;
  }

  containsValue(_: V) {
    return false;
  }

  *keys(): IterableIterator<K> {}

  *values(): IterableIterator<V> {}

  keyIterator() {
    return FluentIterator.empty();
  }

  valueIterator() {
    return FluentIterator.empty();
  }

  entryIterator() {
    return FluentIterator.empty();
  }

  *entries(): IterableIterator<[K, V]> {}

  toMap() {
    return new Map<K, V>();
  }

  toJSON() {
    return '{}';
  }

  hashCode() {
    return hashIterableUnordered(this);
  }

  clone() {
    return this;
  }

  equals(other: unknown) {
    if (other === this) return true;
    if (!isMap<K, V>(other)) return false;
    return other.isEmpty();
  }

  size() {
    return 0;
  }

  capacity() {
    return 0;
  }

  isEmpty() {
    return true;
  }
  isFull() {
    return true;
  }

  remaining() {
    return 0;
  }
}

export function emptyMap<K, V>(): EmptyMap<K, V> {
  return EmptyMap.instance();
}
