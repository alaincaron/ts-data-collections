import { Collector, IteratorLike, Predicate } from 'ts-fluent-iterators';
import { Collection, MutableCollection } from '../collections';

export class ImmutableCollection<E> implements Collection<E> {
  constructor(protected readonly _delegate: Collection<E>) {}

  protected get delegate() {
    return this._delegate;
  }

  clone() {
    return this;
  }

  contains(item: E) {
    return this._delegate.contains(item);
  }

  includes(item: E) {
    return this._delegate.includes(item);
  }

  toArray() {
    return this._delegate.toArray();
  }

  toCollector<R>(c: Collector<E, R>) {
    return this._delegate.toCollector(c);
  }

  toCollection<C extends MutableCollection<E>>(c: C) {
    c.addFully(this);
    return c;
  }

  find(predicate: Predicate<E>) {
    return this._delegate.find(predicate);
  }

  containsAll<E1 extends E>(iteratorLike: IteratorLike<E1>) {
    return this._delegate.containsAll(iteratorLike);
  }

  disjoint<E1 extends E>(iteratorLike: IteratorLike<E1>) {
    return this._delegate.containsAll(iteratorLike);
  }

  iterator() {
    return this._delegate.iterator();
  }

  hashCode() {
    return this._delegate.hashCode();
  }

  equals(other: unknown) {
    return this._delegate.equals(other);
  }

  size() {
    return this._delegate.size();
  }

  capacity() {
    return this._delegate.size();
  }

  isEmpty() {
    return this._delegate.isEmpty();
  }

  isFull() {
    return true;
  }

  remaining() {
    return 0;
  }

  toJSON() {
    return this._delegate.toJSON();
  }

  [Symbol.iterator]() {
    return this._delegate[Symbol.iterator]();
  }

  asReadOnly() {
    return this;
  }

  toReadOnly() {
    return this;
  }
}
