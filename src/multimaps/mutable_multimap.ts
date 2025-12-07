import { BinaryPredicate, FluentIterator, Predicate } from 'ts-fluent-iterators';
import { MultiMap } from './multimap';
import { MutableCollection } from '../collections';
import { MapLike } from '../maps';

export type MultiMapLike<K, V> = MapLike<K, V>;

export interface MutableMultiMap<K, V> extends MultiMap<K, V> {
  getValues(k: K): MutableCollection<V> | undefined;

  removeEntry(key: K, value: V): boolean;

  removeKey(key: K): MutableCollection<V> | undefined;

  offer(key: K, value: V): boolean;

  put(key: K, value: V): boolean;

  putAll<K1 extends K, V1 extends V>(map: MultiMapLike<K1, V1>): void;

  clear(): this;

  filterKeys(predicate: Predicate<K>): number;

  filterEntries(predicate: BinaryPredicate<K, V>): number;

  filterValues(predicate: Predicate<V>): number;

  partitions(): IterableIterator<[K, MutableCollection<V>]>;

  partitionIterator(): FluentIterator<[K, MutableCollection<V>]>;

  clone(): MutableMultiMap<K, V>;
}
