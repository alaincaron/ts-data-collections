import { Comparator, Comparators, Predicate } from 'ts-fluent-iterators';
import { AbstractQueue, QueueOptions } from './abstract_queue';
import { FluentQueueIterator, QueueIterator } from './queue';
import { buildCollection, CollectionInitializer } from '../collections';
import { HeapUtils, nextPowerOfTwo, qsort, WithCapacity } from '../utils';

export interface PriorityQueueOptions<E> extends QueueOptions {
  comparator?: Comparator<E>;
}

export type PriorityQueueInitializer<E> = PriorityQueueOptions<E> & CollectionInitializer<E>;

const MIN_SIZE = 8;

export class PriorityQueue<E> extends AbstractQueue<E> {
  private buffer: Array<E>;
  private _size: number;
  private readonly comparator: Comparator<E>;

  constructor(options?: PriorityQueueOptions<E>) {
    super(options);

    this._size = 0;
    this.buffer = new Array(MIN_SIZE);
    this.comparator = options?.comparator ?? Comparators.natural;
  }

  static create<E>(initializer?: WithCapacity<PriorityQueueInitializer<E>>): PriorityQueue<E> {
    return buildCollection<E, PriorityQueue<E>, PriorityQueueOptions<E>>(PriorityQueue, initializer);
  }

  size(): number {
    return this._size;
  }

  offer(item: E) {
    if (this.isFull()) return false;
    if (this.buffer.length === this._size) this.buffer.length = nextPowerOfTwo(this._size + 1);
    this.buffer[this._size] = item;
    this.heapifyUp(this._size);
    ++this._size;
    return true;
  }

  private swap(i: number, j: number) {
    HeapUtils.swap(this.buffer, i, j);
  }

  private heapifyUp(child: number): boolean {
    return HeapUtils.heapifyUp(this.buffer, child, this.comparator);
  }

  private heapifyDown(parent: number): boolean {
    return HeapUtils.heapifyDown(this.buffer, parent, this.comparator, this._size);
  }

  peek(): E | undefined {
    if (this.isEmpty()) return undefined;
    return this.buffer[0];
  }

  poll(): E | undefined {
    if (this.isEmpty()) return undefined;
    const result = this.buffer[0];
    --this._size;
    this.buffer[0] = this.buffer[this._size];
    this.buffer[this._size] = undefined!;
    this.heapifyDown(0);
    return result;
  }

  removeMatchingItem(predicate: Predicate<E>): E | undefined {
    let i = 0;
    while (i < this._size && !predicate(this.buffer[i])) ++i;
    if (i >= this._size) return undefined;
    const item = this.buffer[i];
    --this._size;
    this.buffer[i] = undefined!;
    if (i < this._size) {
      this.swap(i, this._size);
      if (!this.heapifyUp(i)) this.heapifyDown(i);
    }
    return item;
  }

  filter(predicate: Predicate<E>) {
    let i = 0;
    let count = 0;
    while (i < this._size) {
      const item = this.buffer[i];
      if (predicate(item)) {
        ++i;
      } else {
        ++count;
        --this._size;
        this.buffer[i] = undefined!;
        if (i < this._size) this.swap(i, this._size);
      }
    }
    if (count) HeapUtils.heapify(this.buffer, this.comparator, this._size);
    return count;
  }

  clear() {
    this.buffer = new Array(MIN_SIZE);
    this._size = 0;
    return this;
  }

  clone(): PriorityQueue<E> {
    return PriorityQueue.create({ initial: this });
  }

  buildOptions(): WithCapacity<PriorityQueueOptions<E>> {
    return {
      ...super.buildOptions(),
      comparator: this.comparator,
    };
  }

  *[Symbol.iterator](): IterableIterator<E> {
    let cursor = 0;
    while (cursor < this._size) yield this.buffer[cursor++];
  }

  sort() {
    qsort(this.buffer, 0, this._size, this.comparator);
    return this;
  }

  private getQueueIterator(step: -1 | 1): QueueIterator<E> {
    let lastReturn = -1;
    let cursor = step === 1 ? 0 : this._size;
    this.sort();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        const done = step === 1 ? cursor >= this._size : cursor <= 0;
        if (done) return { done, value: undefined };
        if (step === 1) {
          lastReturn = cursor++;
        } else {
          lastReturn = --cursor;
        }
        return { done: false, value: this.buffer[lastReturn] };
      },
      remove: () => {
        if (lastReturn === -1) throw new Error('Error invoking remove: Can only be done once per iteration');
        const value = this.buffer[lastReturn];
        this.buffer.copyWithin(lastReturn, lastReturn + 1, this._size);
        this.buffer[--this._size] = undefined!;

        cursor = lastReturn;
        lastReturn = -1;
        return value;
      },
    };
  }

  queueIterator(): FluentQueueIterator<E> {
    return new FluentQueueIterator(this.getQueueIterator(1));
  }

  reverseQueueIterator(): FluentQueueIterator<E> {
    return new FluentQueueIterator(this.getQueueIterator(-1));
  }
}
