import { BinaryConsumer, FluentIterator } from 'ts-fluent-iterators';
import { isMap, MapEntry, SortedMap } from '../maps';
import { equalsAny, hashIterableUnordered, mapToJSON } from '../utils';

export class SingletonMap<K, V> implements SortedMap<K, V> {
  protected readonly entry: MapEntry<K, V>;

  constructor(key: K, value: V) {
    this.entry = Object.freeze({ key, value });
  }

  firstEntry() {
    return this.entry;
  }

  lastEntry() {
    return this.entry;
  }

  firstKey() {
    return this.entry.key;
  }

  lastKey(): K | undefined {
    return this.entry.key;
  }

  reverseEntryIterator() {
    return FluentIterator.singleton(this.entry);
  }

  reverseKeyIterator() {
    return FluentIterator.singleton(this.entry.key);
  }

  reverseValueIterator() {
    return FluentIterator.singleton(this.entry.value);
  }

  *reverseEntries() {
    yield [this.entry.key, this.entry.value] as [K, V];
  }

  clone() {
    return this;
  }

  getEntry(key: K) {
    return equalsAny(this.entry.key, key) ? this.entry : undefined;
  }

  get(key: K): V | undefined {
    return equalsAny(this.entry.key, key) ? this.entry.value : undefined;
  }

  getOrDefault(key: K, defaultValue: V) {
    return this.get(key) ?? defaultValue;
  }

  forEach(consumer: BinaryConsumer<K, V>) {
    consumer(this.entry.key, this.entry.value);
  }

  containsKey(key: K): boolean {
    return equalsAny(this.entry.key, key);
  }

  containsValue(value: V): boolean {
    return equalsAny(this.entry.value, value);
  }

  *keys() {
    yield this.entry.key;
  }

  *values() {
    yield this.entry.value;
  }

  keyIterator() {
    return FluentIterator.singleton(this.entry.key);
  }

  valueIterator() {
    return FluentIterator.singleton(this.entry.value);
  }

  entryIterator() {
    return FluentIterator.singleton(this.entry);
  }

  *entries() {
    yield [this.entry.key, this.entry.value] as [K, V];
  }

  toMap() {
    return new Map().set(this.entry.key, this.entry.value);
  }

  toJSON() {
    return mapToJSON(this);
  }

  hashCode() {
    return hashIterableUnordered(this);
  }

  equals(other: unknown): boolean {
    if (other === this) return true;
    return isMap<K, V>(other) && other.size() === 1 && equalsAny(other.get(this.entry.key), this.entry.value);
  }

  *[Symbol.iterator]() {
    yield [this.entry.key, this.entry.value] as [K, V];
  }

  size() {
    return 1;
  }

  capacity() {
    return 1;
  }

  isEmpty() {
    return false;
  }

  isFull() {
    return true;
  }

  remaining() {
    return 0;
  }
}
