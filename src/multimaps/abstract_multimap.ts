import {
  BinaryPredicate,
  Constructor,
  FlattenCollector,
  FluentIterator,
  Generators,
  iterator,
  Predicate,
} from 'ts-fluent-iterators';
import { MultiMapLike, MutableMultiMap } from './mutable_multimap';
import { MutableCollection } from '../collections';
import {
  AbstractContainer,
  CapacityMixin,
  ContainerOptions,
  equalsAny,
  extractOptions,
  hashIterableUnordered,
  Objects,
  WithCapacity,
} from '../utils';

export interface MultiMapInitializer<K, V> {
  initial?: MultiMapLike<K, V>;
}

export abstract class AbstractMultiMap<K, V> extends AbstractContainer implements MutableMultiMap<K, V> {
  abstract getValues(k: K): MutableCollection<V> | undefined;

  abstract removeEntry(key: K, value: V): boolean;
  abstract removeKey(key: K): MutableCollection<V> | undefined;

  offer(key: K, value: V) {
    if (this.isFull()) return false;
    return this.put(key, value);
  }

  abstract put(key: K, value: V): boolean;

  putAll<K1 extends K, V1 extends V>(map: MultiMapLike<K1, V1>) {
    FluentIterator.from(map).forEach(([k, v]) => this.put(k, v));
  }

  abstract clear(): this;

  containsKey(key: K) {
    const col = this.getValues(key);
    return col ? !col.isEmpty() : false;
  }

  containsValue(value: V) {
    for (const v of this.values()) {
      if (equalsAny(value, v)) return true;
    }
    return false;
  }

  containsEntry(key: K, value: V) {
    const col = this.getValues(key);
    if (!col) return false;
    return col.contains(value);
  }

  abstract filterKeys(predicate: Predicate<K>): number;
  abstract filterEntries(predicate: BinaryPredicate<K, V>): number;

  filterValues(predicate: Predicate<V>): number {
    return this.filterEntries((_, v) => predicate(v));
  }

  *keys(): IterableIterator<K> {
    for (const [k, _] of this.partitions()) {
      yield k;
    }
  }

  *values(): IterableIterator<V> {
    for (const [_, v] of this.partitions()) {
      yield* v;
    }
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [k, values] of this.partitions()) {
      for (const v of values) {
        yield [k, v];
      }
    }
  }

  abstract partitions(): IterableIterator<[K, MutableCollection<V>]>;

  keyIterator(): FluentIterator<K> {
    return this.partitionIterator().map(([k, _]) => k);
  }

  valueIterator(): FluentIterator<V> {
    return this.partitionIterator()
      .map(([_, values]) => values)
      .collectTo(new FlattenCollector());
  }

  partitionIterator(): FluentIterator<[K, MutableCollection<V>]> {
    return new FluentIterator(this.partitions());
  }

  entryIterator(): FluentIterator<[K, V]> {
    return this.partitionIterator()
      .map(([k, values]) => iterator(Generators.repeat(_ => k)).zip(values))
      .collectTo(new FlattenCollector());
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  abstract toJSON(): string;

  buildOptions() {
    return {};
  }

  abstract clone(): AbstractMultiMap<K, V>;

  hashCode() {
    return hashIterableUnordered(this.partitions());
  }

  equals(other: unknown) {
    if (this === other) return true;
    if (!isMultiMap<K, V>(other)) return false;
    if (other.size() !== this.size()) return false;

    for (const [k, values] of this.partitions()) {
      if (!equalsAny(values, other.getValues(k))) return false;
    }
    return true;
  }
}

export function isMultiMap<K, V>(obj: unknown): obj is MutableMultiMap<K, V> {
  if (!obj || typeof obj !== 'object') return false;
  if (!Objects.hasFunction(obj, 'size')) return false;
  if (!Objects.hasFunction(obj, 'getValues')) return false;
  return true;
}

export function buildMultiMap<
  K,
  V,
  M extends MutableMultiMap<K, V>,
  Options extends object = object,
  Initializer extends MultiMapInitializer<K, V> = MultiMapInitializer<K, V>,
>(factory: Constructor<M>, initializer?: WithCapacity<Options & Initializer>): M {
  const { options, initialElements } = extractOptions<MultiMapLike<K, V>>(initializer);
  const result = boundMultiMap(factory, options);

  if (initialElements) result.putAll(initialElements);
  return result;
}

function boundMultiMap<K, V, M extends MutableMultiMap<K, V>>(ctor: Constructor<M>, options?: ContainerOptions) {
  if (options && 'capacity' in options) {
    const boundedCtor: any = CapacityMixin(ctor);
    const tmp = new boundedCtor(options);
    return tmp as unknown as M;
  }
  return new ctor(options);
}
