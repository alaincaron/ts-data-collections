import { BinaryPredicate } from 'ts-fluent-iterators';
import { AbstractMap, buildMap } from './abstract_map';
import { MapInitializer, MutableMapEntry } from './mutable_map';
import { OverflowException, WithCapacity } from '../utils';

export interface AdapterMapOptions<K, V> {
  delegate?: Map<K, V>;
}

class AdapterMapEntry<K, V> implements MutableMapEntry<K, V> {
  constructor(
    private readonly map: Map<K, V>,
    private readonly _key: K,
    private _value: V
  ) {}
  get key() {
    return this._key;
  }
  get value() {
    return this._value;
  }
  set value(v: V) {
    this.map.set(this._key, v);
    this._value = v;
  }
}

export class AdapterMap<K, V> extends AbstractMap<K, V> {
  private readonly _delegate: Map<K, V>;

  constructor(options?: AdapterMapOptions<K, V>) {
    super();
    const delegate = typeof options === 'object' && options && 'delegate' in options ? options.delegate : undefined;
    this._delegate = delegate ?? new Map<K, V>();
  }

  static create<K, V>(initializer?: WithCapacity<AdapterMapOptions<K, V> & MapInitializer<K, V>>): AdapterMap<K, V> {
    return buildMap<K, V, AdapterMap<K, V>, AdapterMapOptions<K, V>>(AdapterMap, initializer);
  }

  delegate() {
    return this._delegate;
  }

  size() {
    return this._delegate.size;
  }

  clear(): AdapterMap<K, V> {
    this._delegate.clear();
    return this;
  }

  getEntry(key: K): MutableMapEntry<K, V> | undefined {
    const value = this._delegate.get(key);
    if (value === undefined) return undefined;
    return new AdapterMapEntry(this._delegate, key, value);
  }

  put(key: K, value: V): V | undefined {
    const old_value = this._delegate.get(key);
    if (old_value === undefined && this.isFull()) throw new OverflowException();
    this._delegate.set(key, value);
    return old_value;
  }

  remove(key: K): V | undefined {
    const old_value = this._delegate.get(key);
    this._delegate.delete(key);
    return old_value;
  }

  filterEntries(predicate: BinaryPredicate<K, V>): number {
    let count = 0;
    for (const [key, value] of this._delegate) {
      if (!predicate(key, value)) {
        ++count;
        this._delegate.delete(key);
      }
    }
    return count;
  }

  keys() {
    return this._delegate.keys();
  }

  values() {
    return this._delegate.values();
  }

  keyIterator() {
    return this._delegate.keyIterator();
  }

  valueIterator() {
    return this._delegate.valueIterator();
  }

  entries() {
    return this._delegate.entries();
  }

  entryIterator() {
    return this._delegate.iterator().map(([key, value]) => new AdapterMapEntry(this._delegate, key, value));
  }

  clone(): AdapterMap<K, V> {
    return AdapterMap.create({ initial: this });
  }
}

declare global {
  interface Map<K, V> {
    equals(other: unknown): boolean;
    asIMap(): AdapterMap<K, V>;
  }
}

Map.prototype.asIMap = function () {
  return AdapterMap.create({ delegate: this });
};

Map.prototype.equals = function (other: unknown) {
  if (this === other) return true;
  if (other instanceof Map) {
    return this.asIMap().equals(other.asIMap());
  }
  return false;
};
