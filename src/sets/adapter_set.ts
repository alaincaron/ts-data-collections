import { Predicate } from 'ts-fluent-iterators';
import { ISet } from './set';
import { buildCollection, CollectionInitializer } from '../collections';
import { OverflowException, WithCapacity } from '../utils';

export interface AdapterSetOptions<E> {
  delegate?: Set<E>;
}

export class AdapterSet<E> extends ISet<E> {
  protected readonly _delegate: Set<E>;

  constructor(options?: AdapterSetOptions<E>) {
    super();
    this._delegate = options?.delegate ?? new Set();
  }

  static create<E>(initializer?: WithCapacity<AdapterSetOptions<E> | CollectionInitializer<E>>): AdapterSet<E> {
    return buildCollection<E, AdapterSet<E>, AdapterSetOptions<E>>(AdapterSet, initializer);
  }

  protected delegate() {
    return this._delegate;
  }

  size() {
    return this._delegate.size;
  }

  offer(item: E) {
    if (this.isFull() && !this._delegate.has(item)) return false;
    this._delegate.add(item);
    return true;
  }

  add(item: E) {
    const initial_size = this.size();
    if (!this.offer(item)) throw new OverflowException();
    return this.size() > initial_size;
  }

  removeMatchingItem(predicate: Predicate<E>): E | undefined {
    for (const value of this) {
      if (predicate(value)) {
        this._delegate.delete(value);
        return value;
      }
    }
    return undefined;
  }

  filter(predicate: Predicate<E>): number {
    let count = 0;
    for (const value of this) {
      if (!predicate(value)) {
        this._delegate.delete(value);
        ++count;
      }
    }
    return count;
  }

  clear() {
    this._delegate.clear();
  }

  [Symbol.iterator]() {
    return this._delegate[Symbol.iterator]();
  }

  toSet() {
    return this._delegate;
  }

  clone(): AdapterSet<E> {
    return AdapterSet.create({ initial: this });
  }
}
