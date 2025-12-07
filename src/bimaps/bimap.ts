import { BinaryPredicate, Constructor, FluentIterator, Predicate } from 'ts-fluent-iterators';
import { MutableBiMap, ReadOnlyBiMap } from './bimap_interface';
import { MapInitializer, MapLike, MutableMap, OfferResult } from '../maps';
import {
  AbstractContainer,
  buildOptions,
  CapacityMixin,
  ContainerOptions,
  equalsAny,
  IllegalArgumentException,
  Objects,
  OverflowException,
  WithCapacity,
} from '../utils';

export interface BiMapOptions<KeyOptions, ValueOptions> {
  keyOptions?: KeyOptions;
  valueOptions?: ValueOptions;
}

export class BiMap<K, V> extends AbstractContainer implements MutableBiMap<K, V> {
  private keyMapping: MutableMap<K, V>;
  private valueMapping: MutableMap<V, K>;

  private constructor({ keyMapping, valueMapping }: { keyMapping: MutableMap<K, V>; valueMapping: MutableMap<V, K> }) {
    super();
    this.keyMapping = keyMapping;
    this.valueMapping = valueMapping;
  }

  size() {
    return this.keyMapping.size();
  }

  getValue(k: K) {
    return this.keyMapping.get(k);
  }

  getKey(v: V) {
    return this.valueMapping.get(v);
  }

  containsKey(k: K) {
    return this.keyMapping.containsKey(k);
  }

  containsValue(v: V) {
    return this.valueMapping.containsKey(v);
  }

  private doForcePut(k: K, v: V): V | undefined {
    const oldV = this.keyMapping.put(k, v);
    if (oldV !== undefined) {
      this.valueMapping.remove(oldV);
    }
    const oldK = this.valueMapping.put(v, k);
    if (oldK !== undefined) this.keyMapping.remove(oldK);
    return oldV;
  }

  forcePut(k: K, v: V): V | undefined {
    if (this.isFull() && !this.containsKey(k) && !this.containsValue(v)) {
      throw new OverflowException();
    }
    return this.doForcePut(k, v);
  }

  offer(k: K, v: V): OfferResult<V> {
    if (this.isFull() && !this.containsKey(k) && !this.containsValue(v)) {
      return { accepted: false };
    }
    const oldV = this.doForcePut(k, v);
    return { accepted: true, previous: oldV };
  }

  put(k: K, v: V) {
    if (this.isFull() && !this.containsKey(k) && !this.containsValue(v)) {
      throw new OverflowException();
    }
    const oldK = this.getKey(v);
    if (oldK !== undefined && !equalsAny(oldK, k)) throw new IllegalArgumentException();
    return this.doForcePut(k, v);
  }

  putAll<K1 extends K, V1 extends V>(items: MapLike<K1, V1>) {
    FluentIterator.from(items).forEach(([k, v]) => this.put(k, v));
    return this;
  }

  putAllForce<K1 extends K, V1 extends V>(items: MapLike<K1, V1>) {
    FluentIterator.from(items).forEach(([k, v]) => this.forcePut(k, v));
    return this;
  }

  removeKey(k: K): V | undefined {
    const v = this.keyMapping.remove(k);
    if (v !== undefined) {
      this.valueMapping.remove(v);
    }
    return v;
  }

  removeValue(v: V): K | undefined {
    const k = this.valueMapping.remove(v);
    if (k !== undefined) {
      this.keyMapping.remove(k);
    }
    return k;
  }

  removeEntry(k: K, v: V) {
    const oldV = this.keyMapping.get(k);
    if (oldV === undefined || !equalsAny(oldV, v)) return false;
    this.keyMapping.remove(k);
    this.valueMapping.remove(v);
    return true;
  }

  filterEntries(predicate: BinaryPredicate<K, V>) {
    const result = this.keyMapping.filterEntries(predicate);
    if (result > 0) {
      this.valueMapping.filterValues(k => this.keyMapping.containsKey(k));
    }
    return result;
  }

  filterKeys(predicate: Predicate<K>) {
    return this.filterEntries((k, _) => predicate(k));
  }

  filterValues(predicate: Predicate<V>) {
    return this.filterEntries((_, v) => predicate(v));
  }

  clear(): this {
    this.keyMapping.clear();
    this.valueMapping.clear();
    return this;
  }

  clone(): BiMap<K, V> {
    return BiMap.boundMap(this.keyMapping.clone(), this.valueMapping.clone(), this.capacity());
  }

  inverse(): BiMap<V, K> {
    return BiMap.boundMap(this.valueMapping, this.keyMapping, this.capacity());
  }

  keys() {
    return this.keyMapping.keys();
  }

  values() {
    return this.valueMapping.keys();
  }

  keyIterator() {
    return this.keyMapping.keyIterator();
  }

  valueIterator() {
    return this.valueMapping.keyIterator();
  }

  entryIterator() {
    return this.keyMapping.entryIterator().map(({ key, value }) => ({ key, value }));
  }

  entries() {
    return this.keyMapping.entries();
  }

  toMap() {
    return this.keyMapping.toMap();
  }

  toIMap() {
    return this.keyMapping.clone();
  }

  toJSON() {
    return this.keyMapping.toJSON();
  }

  hashCode() {
    return this.keyMapping.hashCode();
  }

  [Symbol.iterator]() {
    return this.keyMapping[Symbol.iterator]();
  }

  equals(other: unknown) {
    if (other === this) return true;
    if (!isBiMap(other)) return false;
    if (other.size() !== this.size()) return false;
    for (const [k, v] of this) {
      if (!equalsAny(v, other.getValue(k))) return false;
    }
    return true;
  }

  buildOptions() {
    const result: any = {};
    const keyOptions = buildOptions(this.keyMapping);
    const valueOptions = buildOptions(this.valueMapping);
    if (Object.keys(keyOptions).length) result.keyOptions = keyOptions;
    if (Object.keys(valueOptions).length) result.valueOptions = valueOptions;
    return result as ContainerOptions;
  }

  static create<
    K,
    V,
    M1 extends MutableMap<K, V>,
    M2 extends MutableMap<V, K>,
    Options1 extends object = object,
    Options2 extends object = object,
    Options extends BiMapOptions<Options1, Options2> = BiMapOptions<Options1, Options2>,
    Initializer extends MapInitializer<K, V> = MapInitializer<K, V>,
  >(
    factory1: Constructor<M1, [Options1 | undefined]>,
    factory2: Constructor<M2, [Options2 | undefined]>,
    initializer?: WithCapacity<Options & Initializer>
  ): BiMap<K, V> {
    const m1 = new factory1(initializer?.keyOptions);
    const m2 = new factory2(initializer?.valueOptions);
    const result = BiMap.boundMap(m1, m2, initializer?.capacity);
    if (initializer?.initial) result.putAll(initializer.initial);
    return result;
  }

  private static readonly boundedCtor: any = CapacityMixin(BiMap as any);

  private static boundMap<K, V>(
    keyMapping: MutableMap<K, V>,
    valueMapping: MutableMap<V, K>,
    capacity?: number
  ): BiMap<K, V> {
    if (capacity !== undefined && Number.isFinite(capacity)) {
      return new BiMap.boundedCtor({ capacity, keyMapping, valueMapping });
    }
    return new BiMap({ keyMapping, valueMapping });
  }
}

function isBiMap<K, V>(obj: unknown): obj is ReadOnlyBiMap<K, V> {
  if (!obj || typeof obj !== 'object') return false;
  if (obj instanceof BiMap) return true;
  if (!Objects.hasFunction(obj, Symbol.iterator)) return false;
  if (!Objects.hasFunction(obj, 'inverse')) return false;
  return true;
}
