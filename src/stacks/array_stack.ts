import { Predicate } from 'ts-fluent-iterators';
import { Stack } from './stack';
import { buildCollection, CollectionInitializer } from '../collections';
import { ArrayDeque } from '../deques';
import { ContainerOptions } from '../utils';

export class ArrayStack<E> extends Stack<E> {
  private readonly buffer: ArrayDeque<E>;

  constructor(options?: number | ContainerOptions) {
    super(options);
    this.buffer = ArrayDeque.create(options);
  }

  static create<E>(initializer?: number | (ContainerOptions & CollectionInitializer<E>)) {
    return buildCollection<E, ArrayStack<E>>(ArrayStack, initializer);
  }

  size() {
    return this.buffer.size();
  }

  capacity() {
    return this.buffer.capacity();
  }

  clear() {
    this.buffer.clear();
  }

  isFull() {
    return this.buffer.isFull();
  }

  isEmpty() {
    return this.buffer.isEmpty();
  }

  offer(item: E) {
    return this.buffer.offer(item);
  }

  poll(): E | undefined {
    return this.buffer.pollLast();
  }

  peek(): E | undefined {
    return this.buffer.peekLast();
  }

  buildOptions() {
    return this.buffer.buildOptions();
  }

  clone(): ArrayStack<E> {
    return ArrayStack.create({ initial: this.buffer });
  }

  removeMatchingItem(predicate: Predicate<E>): E | undefined {
    return this.buffer.removeLastMatchingItem(predicate);
  }

  filter(predicate: (item: E) => boolean) {
    return this.buffer.filter(predicate);
  }

  [Symbol.iterator](): IterableIterator<E> {
    return this.buffer.reverseIterator();
  }
}
