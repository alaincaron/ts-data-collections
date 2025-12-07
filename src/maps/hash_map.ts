import { BinaryPredicate, FluentIterator } from 'ts-fluent-iterators';
import { AbstractMap, buildMap } from './abstract_map';
import { MapInitializer, MutableMapEntry } from './mutable_map';
import { equalsAny, hashAny, LARGEST_PRIME, nextPrime, WithCapacity } from '../utils';

export interface HashEntry<K, V> extends MutableMapEntry<K, V> {
  next: HashEntry<K, V> | undefined;
  readonly hash: number;
}

export enum AccessType {
  GET,
  INSERT,
  MODIFY,
  REMOVE,
}

export interface HashMapOptions {
  loadFactor?: number;
}

const MIN_INITIAL_CAPACITY = nextPrime(5);
const DEFAULT_LOAD_FACTOR = 0.75;

export class HashMap<K, V> extends AbstractMap<K, V> {
  private _size: number;
  private slots: Array<HashEntry<K, V> | undefined>;
  public readonly loadFactor: number;

  protected recordAccess(_e: HashEntry<K, V>, _accessType: AccessType) {}

  constructor(options?: HashMapOptions) {
    super();
    this._size = 0;
    this.slots = new Array(MIN_INITIAL_CAPACITY);

    this.loadFactor = options?.loadFactor ?? DEFAULT_LOAD_FACTOR;
    if (this.loadFactor <= 0.0) throw new Error(`Invalid load factor: ${this.loadFactor}`);
  }

  static create<K, V>(initializer?: WithCapacity<HashMapOptions & MapInitializer<K, V>>): HashMap<K, V> {
    return buildMap<K, V, HashMap<K, V>, HashMapOptions>(HashMap, initializer);
  }

  size(): number {
    return this._size;
  }

  private getSlot(h: number, slots: Array<HashEntry<K, V> | undefined>): number {
    h = h % slots.length;
    if (h < 0) h += slots.length;
    return h;
  }

  getEntry(key: K): MutableMapEntry<K, V> | undefined {
    const h = hashAny(key);
    const slot = this.getSlot(h, this.slots);
    let e = this.slots[slot];
    while (e && (e.hash !== h || !equalsAny(key, e.key))) e = e.next;
    if (e) this.recordAccess(e, AccessType.GET);
    return e;
  }

  put(key: K, value: V): V | undefined {
    return this.doPut(key, value, true);
  }

  putIfAbsent(key: K, value: V): V | undefined {
    return this.doPut(key, value, false);
  }

  private doPut(key: K, value: V, updateExisting: boolean): V | undefined {
    const hash = hashAny(key);
    const slot = this.getSlot(hash, this.slots);
    let prev: HashEntry<K, V> | undefined = undefined;
    let e = this.slots[slot];
    while (e && (e.hash !== hash || !equalsAny(key, e.key))) {
      prev = e;
      e = e.next;
    }
    if (!e) {
      if (this.handleOverflow(key, value)) return undefined;

      e = { key, value, next: undefined, hash };
      this.recordAccess(e, AccessType.INSERT);
      ++this._size;
      if (prev) {
        prev.next = e;
      } else {
        this.slots[slot] = e;
      }
      if (this.slots.length * this.loadFactor < this._size) this.rehash();
      return undefined;
    } else {
      const old = e.value;
      if (updateExisting) {
        e.value = value;
        this.recordAccess(e, AccessType.MODIFY);
      }
      return old;
    }
  }

  private rehash() {
    let newLength = this.slots.length * 2;
    if (newLength < 0 || newLength >= LARGEST_PRIME) {
      newLength = LARGEST_PRIME;
    } else {
      newLength = nextPrime(newLength);
    }
    const newSlots = new Array(newLength);
    for (let i = 0; i < this.slots.length; ++i) {
      let e = this.slots[i];
      while (e) {
        const next = e.next;
        const slot = this.getSlot(e.hash, newSlots);
        e.next = newSlots[slot];
        newSlots[slot] = e;
        e = next;
      }
    }
    this.slots = newSlots;
  }

  private removeEntry(key: K): HashEntry<K, V> | undefined {
    const h = hashAny(key);
    const slot = this.getSlot(h, this.slots);
    let prev: HashEntry<K, V> | undefined = undefined;
    let e = this.slots[slot];
    while (e && (e.hash !== h || !equalsAny(key, e.key))) {
      prev = e;
      e = e.next;
    }
    if (!e) return undefined;
    if (prev) {
      prev.next = e.next;
    } else {
      this.slots[slot] = e.next;
    }
    --this._size;
    this.recordAccess(e, AccessType.REMOVE);

    return e;
  }

  remove(key: K): V | undefined {
    return this.removeEntry(key)?.value;
  }

  filterEntries(predicate: BinaryPredicate<K, V>): number {
    let count = 0;
    for (let i = 0; i < this.slots.length; ++i) {
      let prev: HashEntry<K, V> | undefined = undefined;
      let e = this.slots[i];
      while (e) {
        if (!predicate(e.key, e.value)) {
          if (prev) {
            prev.next = e.next;
          } else {
            this.slots[i] = e.next;
          }
          this.recordAccess(e, AccessType.REMOVE);
          --this._size;
          ++count;
        } else {
          prev = e;
        }
        e = e.next;
      }
    }
    return count;
  }

  clear(): HashMap<K, V> {
    for (let i = 0; i < this.slots.length; ++i) this.slots[i] = undefined;
    this._size = 0;
    return this;
  }

  protected *entryGenerator(): IterableIterator<MutableMapEntry<K, V>> {
    for (let i = 0; i < this.slots.length; ++i) {
      let e = this.slots[i];
      while (e) {
        yield e as unknown as MutableMapEntry<K, V>;
        e = e.next;
      }
    }
  }

  entryIterator() {
    return new FluentIterator(this.entryGenerator());
  }

  clone(): HashMap<K, V> {
    return HashMap.create({ initial: this });
  }

  buildOptions() {
    return {
      ...super.buildOptions(),
      loadFactor: this.loadFactor,
    };
  }
}
