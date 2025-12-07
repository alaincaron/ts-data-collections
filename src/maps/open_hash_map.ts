import { BinaryPredicate, FluentIterator } from 'ts-fluent-iterators';
import { AbstractMap, buildMap } from './abstract_map';
import { HashMapOptions } from './hash_map';
import { MapInitializer, MutableMapEntry } from './mutable_map';
import { equalsAny, FNV1a32HashFunction, hashAny, MAX_ARRAY_SIZE, nextPrime, WithCapacity } from '../utils';

const DEFAULT_INITIAL_SIZE = 5; // should be prime.
const DEFAULT_LOAD_FACTOR = 0.7;
const DELETED = 'DELETED';

interface HashEntry<K, V> extends MutableMapEntry<K, V> {
  hash: number;
}

type Entry<K, V> = HashEntry<K, V> | 'DELETED' | undefined;

export class OpenHashMap<K, V> extends AbstractMap<K, V> {
  private _size: number;
  public readonly loadFactor: number;
  private slots: Array<Entry<K, V>>;
  private _occupancy: number;

  constructor(options?: HashMapOptions) {
    super();
    this._size = this._occupancy = 0;
    this.loadFactor = DEFAULT_LOAD_FACTOR;
    this.slots = new Array(DEFAULT_INITIAL_SIZE);

    if (options?.loadFactor != null) {
      if (options.loadFactor <= 0.0) throw new Error(`Invalid load factor: ${options.loadFactor}`);
      this.loadFactor = options.loadFactor;
    }
  }

  static create<K, V>(initializer?: WithCapacity<HashMapOptions | MapInitializer<K, V>>): OpenHashMap<K, V> {
    return buildMap<K, V, OpenHashMap<K, V>, HashMapOptions>(OpenHashMap, initializer);
  }

  size(): number {
    return this._size;
  }

  clear(): OpenHashMap<K, V> {
    const tmp: Entry<K, V>[] = this.slots;
    for (let i = 0; i < tmp.length; ++i) {
      tmp[i] = undefined;
    }
    this._size = this._occupancy = 0;
    return this;
  }

  filterEntries(predicate: BinaryPredicate<K, V>) {
    let count = 0;
    for (let i = 0; i < this.slots.length; ++i) {
      const e = this.slots[i];
      if (!e || e === DELETED || predicate(e.key, e.value)) continue;
      this.slots[i] = DELETED;
      --this._size;
      ++count;
    }
    return count;
  }

  protected *entryGenerator(): IterableIterator<MutableMapEntry<K, V>> {
    for (const e of this.slots) {
      if (!e || e === DELETED) continue;
      yield e;
    }
  }

  entryIterator() {
    return new FluentIterator(this.entryGenerator());
  }

  clone(): OpenHashMap<K, V> {
    return OpenHashMap.create({ initial: this });
  }

  buildOptions() {
    return {
      ...super.buildOptions(),
      loadFactor: this.loadFactor,
    };
  }

  private computeProbe(h: number, nbEntries: number) {
    const probeRange = nbEntries - 2;
    let p = FNV1a32HashFunction.instance().hashNumber(h).asNumber() % probeRange;
    if (p < 0) p += probeRange;
    return p + 1;
  }

  private findIndex(key: K): number {
    const h = hashAny(key);
    let idx = h % this.slots.length;
    if (idx < 0) idx += this.slots.length;
    const probe = this.computeProbe(h, this.slots.length);

    for (let i = 0; i < this.slots.length; ++i) {
      idx = (idx + probe) % this.slots.length;
      const e = this.slots[idx];
      if (!e) break;
      if (e === DELETED) continue;
      if (e.hash === h && equalsAny(key, e.key)) return idx;
    }
    return -1;
  }

  containsKey(key: K) {
    return this.findIndex(key) >= 0;
  }

  getEntry(key: K) {
    const idx = this.findIndex(key);
    return idx >= 0 ? (this.slots[idx] as MutableMapEntry<K, V>) : undefined;
  }

  put(key: K, value: V) {
    return this.doPut(key, value, true);
  }

  putIfAbsent(key: K, value: V) {
    return this.doPut(key, value, false);
  }

  private doPut(key: K, value: V, updateExisting: boolean) {
    const h = hashAny(key);
    let idx = this.findIndexForInsertion(key, h, this.slots);
    if (idx < 0) {
      // this should not really happen since we perform a rehash if necessary
      // after insertion.
      // But better err on the safe of safety.
      this.rehashIfNecessary();
      idx = this.findIndexForInsertion(key, h, this.slots);
    }

    const e = this.slots[idx];
    if (!e || e === DELETED) {
      if (this.handleOverflow(key, value)) return undefined;
      if (!e) ++this._occupancy;
      ++this._size;
      this.slots[idx] = { key, value, hash: h };
      this.rehashIfNecessary();
      return undefined;
    }
    const old_value = e.value;
    if (updateExisting) e.value = value;
    return old_value;
  }

  rehashIfNecessary() {
    const threshold = this.slots.length * this.loadFactor;
    if (this._occupancy < threshold) {
      return;
    }

    const nbRemoved = this._occupancy - this._size;
    this._occupancy = this._size;
    if ((this._size >= threshold || nbRemoved > this._size / 2) && this.slots.length < MAX_ARRAY_SIZE) {
      this.resize();
    } else {
      this.rehash();
    }
  }

  resize(newCap?: number) {
    newCap ??= this.slots.length * 2;
    if (newCap < 0 || newCap > MAX_ARRAY_SIZE) {
      throw new Error(`Array is too big`);
    }

    newCap = nextPrime(newCap);

    const tmp: Entry<K, V>[] = new Array(newCap);

    for (const e of this.slots) {
      if (!e || e === DELETED) {
        continue;
      }

      const idx = this.findIndexForInsertion(e.key, e.hash, tmp);
      tmp[idx] = e;
    }
    this.slots = tmp;
  }

  findIndexForInsertion<K, V>(key: K, h: number, entries: Entry<K, V>[]): number {
    let idx = h % entries.length;
    if (idx < 0) idx += entries.length;
    let firstDeleted = -1;
    const probe = this.computeProbe(h, entries.length);

    for (let i = 0; i < entries.length; ++i) {
      idx = (idx + probe) % entries.length;
      const e = entries[idx];
      if (!e) {
        return firstDeleted < 0 ? idx : firstDeleted;
      }
      if (e === DELETED) {
        if (firstDeleted < 0) {
          firstDeleted = idx;
        }
        continue;
      }
      if (e.hash === h && equalsAny(key, e.key)) {
        return idx;
      }
    }
    return firstDeleted;
  }

  rehash() {
    const tmp: HashEntry<K, V>[] = new Array(this._size);
    let j = 0;
    for (let i = 0; i < this.slots.length; ++i) {
      const e = this.slots[i];
      if (e && e != DELETED) {
        tmp[j++] = e;
      }
      this.slots[i] = undefined;
    }
    for (const e of tmp) {
      const idx = this.findIndexForInsertion(e.key, e.hash, this.slots);
      this.slots[idx] = e;
    }
  }

  private removeEntry(key: K): HashEntry<K, V> | undefined {
    const idx = this.findIndex(key);
    if (idx < 0) {
      return undefined;
    }

    const entry: HashEntry<K, V> = this.slots[idx] as HashEntry<K, V>;
    this.slots[idx] = DELETED;
    --this._size;
    return entry;
  }

  remove(key: K) {
    return this.removeEntry(key)?.value;
  }
}
