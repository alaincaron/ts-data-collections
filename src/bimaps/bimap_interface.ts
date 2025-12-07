import { BinaryPredicate, FluentIterator, Predicate } from 'ts-fluent-iterators';
import { MapEntry, MapLike, MutableMap, OfferResult } from '../maps';
import { Container } from '../utils';

export interface ReadOnlyBiMap<K, V> extends Container, Iterable<[K, V]> {
  getValue(key: K): V | undefined;
  getKey(value: V): K | undefined;

  containsValue(value: V): boolean;
  containsKey(key: K): boolean;

  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;

  [Symbol.iterator](): Iterator<[K, V]>;

  keyIterator(): FluentIterator<K>;

  valueIterator(): FluentIterator<V>;

  entryIterator(): FluentIterator<MapEntry<K, V>>;

  entries(): IterableIterator<[K, V]>;

  toMap(): Map<K, V>;
  toIMap(): MutableMap<K, V>;

  toJSON(): string;

  hashCode(): number;

  clone(): ReadOnlyBiMap<K, V>;

  equals(other: unknown): boolean;

  inverse(): ReadOnlyBiMap<V, K>;
}

export interface MutableBiMap<K, V> extends ReadOnlyBiMap<K, V> {
  offer(key: K, value: V): OfferResult<V>;
  removeKey(key: K): V | undefined;
  removeValue(value: V): K | undefined;
  removeEntry(key: K, value: V): boolean;
  put(key: K, value: V): V | undefined;
  forcePut(key: K, value: V): V | undefined;
  putAll<K1 extends K, V1 extends V>(items: MapLike<K1, V1>): this;
  putAllForce<K1 extends K, V1 extends V>(items: MapLike<K1, V1>): this;
  filterKeys(predicate: Predicate<K>): number;

  filterValues(predicate: Predicate<V>): number;

  filterEntries(predicate: BinaryPredicate<K, V>): number;
  clear(): MutableBiMap<K, V>;

  clone(): MutableBiMap<K, V>;
  inverse(): MutableBiMap<V, K>;
}
