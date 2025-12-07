import { ArrayGenerator, BinaryConsumer, FluentIterator } from 'ts-fluent-iterators';
import { Container, ContainerInitializer, LengthProvider } from '../utils';

export interface MapEntry<K, V> {
  get key(): K;
  get value(): V;
}

/**
 * Describes an object that can behave like a Map.  It has a
 * `size` or `length` and it is possible to iterate through its
 * elements.
 */

export type MapLike<K, V> = (Iterable<[K, V]> & LengthProvider) | ArrayGenerator<[K, V]>;

/**
 * Interface used to specify initial elements in a create method for a {@link Map}.
 */
export type MapInitializer<K, V> = ContainerInitializer<MapLike<K, V>>;

export interface IMap<K, V> extends Container, Iterable<[K, V]> {
  getEntry(key: K): MapEntry<K, V> | undefined;

  get(key: K): V | undefined;

  getOrDefault(key: K, defaultValue: V): V;

  containsKey(key: K): boolean;

  containsValue(value: V): boolean;

  keys(): IterableIterator<K>;

  values(): IterableIterator<V>;

  [Symbol.iterator](): Iterator<[K, V]>;

  keyIterator(): FluentIterator<K>;

  valueIterator(): FluentIterator<V>;

  entryIterator(): FluentIterator<MapEntry<K, V>>;

  entries(): IterableIterator<[K, V]>;

  forEach(consumer: BinaryConsumer<K, V>): void;

  toMap(): Map<K, V>;

  toJSON(): string;

  hashCode(): number;

  clone(): IMap<K, V>;

  equals(other: unknown): boolean;
}
