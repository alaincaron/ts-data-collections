import {
  BinaryConsumer,
  BinaryMapper,
  BinaryPredicate,
  Constructor,
  FluentIterator,
  Mapper,
  Predicate,
} from 'ts-fluent-iterators';
import { MapInitializer, MapLike, MutableMap, MutableMapEntry, OfferResult } from './mutable_map';
import {
  AbstractContainer,
  CapacityMixin,
  ContainerOptions,
  equalsAny,
  extractOptions,
  hashIterableUnordered,
  mapToJSON,
  Objects,
  OverflowException,
  WithCapacity,
} from '../utils';

export abstract class AbstractMap<K, V> extends AbstractContainer implements MutableMap<K, V> {
  abstract getEntry(key: K): MutableMapEntry<K, V> | undefined;

  get(key: K): V | undefined {
    return this.getEntry(key)?.value;
  }

  getOrDefault(key: K, defaultValue: V) {
    const entry = this.getEntry(key);
    return entry ? entry.value : defaultValue;
  }

  forEach(consumer: BinaryConsumer<K, V>) {
    this.entryIterator().forEach(e => consumer(e.key, e.value));
  }

  protected overflowHandler(_key: K, _value: V): boolean {
    return false;
  }

  protected handleOverflow(key: K, value: V): boolean {
    if (!this.isFull()) return false;
    if (this.overflowHandler(key, value)) return true;
    if (this.isFull()) throw new OverflowException();
    return false;
  }

  offer(key: K, value: V) {
    const result: OfferResult<V> = { accepted: true };
    if (this.isFull()) {
      const entry = this.getEntry(key);
      if (entry) {
        result.previous = entry.value;
      } else {
        result.accepted = false;
      }
    } else {
      const previous = this.put(key, value);
      if (previous != null) result.previous = previous;
    }
    return result;
  }

  abstract put(key: K, value: V): V | undefined;

  putIfAbsent(key: K, value: V): V | undefined {
    const entry = this.getEntry(key);
    if (!entry) this.put(key, value);
    return entry?.value;
  }

  containsKey(key: K) {
    return !!this.getEntry(key);
  }

  containsValue(value: V) {
    return this.valueIterator().contains(v => equalsAny(value, v));
  }

  abstract remove(key: K): V | undefined;

  filterKeys(predicate: Predicate<K>) {
    return this.filterEntries((k, _) => predicate(k));
  }

  filterValues(predicate: Predicate<V>) {
    return this.filterEntries((_, v) => predicate(v));
  }

  abstract filterEntries(predicate: BinaryPredicate<K, V>): number;

  putAll<K1 extends K, V1 extends V>(map: MapLike<K1, V1>) {
    FluentIterator.from(map).forEach(([k, v]) => this.put(k, v));
  }

  abstract clear(): AbstractMap<K, V>;

  *keys(): IterableIterator<K> {
    for (const e of this.entryIterator()) yield e.key;
  }

  *values(): IterableIterator<V> {
    for (const e of this.entryIterator()) yield e.value;
  }

  keyIterator() {
    return this.entryIterator().map(e => e.key);
  }

  valueIterator() {
    return this.entryIterator().map(e => e.value);
  }

  abstract entryIterator(): FluentIterator<MutableMapEntry<K, V>>;

  *entries(): IterableIterator<[K, V]> {
    for (const entry of this.entryIterator()) {
      yield [entry.key, entry.value];
    }
  }

  replace(key: K, value: V) {
    const entry = this.getEntry(key);
    const oldValue = entry?.value;
    if (entry) entry.value = value;
    return oldValue;
  }

  replaceValue(key: K, oldValue: V, newValue: V) {
    const entry = this.getEntry(key);
    if (entry && entry.value === oldValue) {
      entry.value = newValue;
      return true;
    }
    return false;
  }

  replaceValueIf(predicate: BinaryPredicate<K, V>, mapper: BinaryMapper<K, V, V>) {
    this.entryIterator()
      .filter(e => predicate(e.key, e.value))
      .forEach(e => (e.value = mapper(e.key, e.value)));
    return this;
  }

  replaceAll(mapper: BinaryMapper<K, V, V>) {
    this.entryIterator().forEach(e => (e.value = mapper(e.key, e.value)));
    return this;
  }

  transformValues(mapper: Mapper<V, V>) {
    this.entryIterator().forEach(e => (e.value = mapper(e.value)));
    return this;
  }

  mapValues<V2>(mapper: Mapper<V, V2>): MutableMap<K, V2> {
    const result = this.clone() as AbstractMap<K, unknown>;
    result.entryIterator().forEach(e => (e.value = mapper(e.value as V)));
    return result as MutableMap<K, V2>;
  }

  computeIfAbsent(key: K, mapper: Mapper<K, V | undefined | null>): V | undefined {
    const entry = this.getEntry(key);
    if (entry) return entry.value;

    const newV = mapper(key);
    if (newV != null) {
      this.put(key, newV);
      return newV;
    }
    return undefined;
  }

  computeIfPresent(key: K, mapper: BinaryMapper<K, V, V | undefined | null>): V | undefined {
    const entry = this.getEntry(key);
    if (!entry) return undefined;
    const newV = mapper(key, entry.value);
    if (newV != null) {
      entry.value = newV;
      return newV;
    }
    this.remove(key);
    return undefined;
  }

  toMap() {
    return new Map(this);
  }

  abstract clone(): AbstractMap<K, V>;

  [Symbol.iterator](): Iterator<[K, V]> {
    return this.entries();
  }

  buildOptions() {
    return {};
  }

  toJSON() {
    return mapToJSON(this);
  }

  hashCode() {
    return hashIterableUnordered(this);
  }

  equals(other: unknown) {
    if (this === other) return true;
    if (!isMap<K, V>(other)) return false;
    if (other.size() !== this.size()) return false;
    for (const [k, v] of this) {
      if (!equalsAny(v, other.get(k))) return false;
    }
    return true;
  }
}

export function isMap<K, V>(obj: unknown): obj is MutableMap<K, V> {
  if (!obj || typeof obj !== 'object') return false;
  if (!Objects.hasFunction(obj, 'size')) return false;
  if (!Objects.hasFunction(obj, 'toMap')) return false;
  if (!Objects.hasFunction(obj, 'get')) return false;
  return true;
}

export function buildMap<
  K,
  V,
  M extends MutableMap<K, V>,
  Options extends object = object,
  Initializer extends MapInitializer<K, V> = MapInitializer<K, V>,
>(factory: Constructor<M, [Options | undefined]>, initializer?: WithCapacity<Options & Initializer>): M {
  const { options, initialElements } = extractOptions<MapLike<K, V>>(initializer);
  const result = boundMap(factory, options);

  if (initialElements) result.putAll(initialElements);
  return result;
}

const constructorMap = new Map();

function boundMap<K, V, M extends MutableMap<K, V>>(ctor: Constructor<M>, options?: ContainerOptions) {
  if (options && 'capacity' in options && Number.isFinite(options.capacity)) {
    let boundedCtor = constructorMap.get(ctor);
    if (!boundedCtor) {
      boundedCtor = CapacityMixin(ctor);
      constructorMap.set(ctor, boundedCtor);
    }
    return new boundedCtor(options);
  }
  return new ctor(options);
}
