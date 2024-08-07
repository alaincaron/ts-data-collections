import { List, ListIterator } from './list';
import { buildCollection, CollectionInitializer } from '../collections';
import { DoubleLinkedList, UnderflowException, WithCapacity } from '../utils';

interface ListEntry<E> {
  value: E;
}

type LinkedListEntry<E> = DoubleLinkedList.Entry & ListEntry<E>;

export class LinkedList<E> extends List<E> {
  private readonly linkedList: DoubleLinkedList<LinkedListEntry<E>>;
  private _size: number;

  static create<E>(initializer?: WithCapacity<CollectionInitializer<E>>): LinkedList<E> {
    return buildCollection<E, LinkedList<E>>(LinkedList, initializer);
  }

  constructor() {
    super();
    this._size = 0;
    this.linkedList = new DoubleLinkedList();
  }

  size(): number {
    return this._size;
  }

  private getEntryAt(idx: number): LinkedListEntry<E> {
    const x = this.size() - idx;
    let e = this.linkedList.header;
    if (idx < x) {
      for (let i = 0; i <= idx; ++i) e = e.after!;
    } else {
      for (let i = 0; i < x; ++i) e = e.before!;
    }
    return e as LinkedListEntry<E>;
  }

  getAt(idx: number): E {
    this.checkBound(idx);
    const e = this.getEntryAt(idx);
    return e.value;
  }

  getFirst() {
    if (this.isEmpty()) throw new UnderflowException();
    return (this.linkedList.header.after as unknown as ListEntry<E>).value;
  }

  getLast() {
    if (this.isEmpty()) throw new UnderflowException();
    return (this.linkedList.header.before as unknown as ListEntry<E>).value;
  }

  offerAt(idx: number, item: E): boolean {
    if (this.isFull()) return false;
    this.checkBoundForAdd(idx);
    const e = { value: item } as LinkedListEntry<E>;
    const existing = this.getEntryAt(idx);
    this.linkedList.addBefore(e, existing);
    ++this._size;
    return true;
  }

  setAt(idx: number, item: E): E {
    this.checkBound(idx);
    const e = this.getEntryAt(idx);
    const old = e.value;
    e.value = item;
    return old;
  }

  removeAt(idx: number): E {
    this.checkBound(idx);
    const e = this.getEntryAt(idx);
    this.linkedList.remove(e as LinkedListEntry<E>);
    --this._size;
    return e.value;
  }

  offerLast(item: E): boolean {
    if (this.isFull()) return false;
    const e = { value: item } as LinkedListEntry<E>;
    this.linkedList.addLast(e);
    ++this._size;
    return true;
  }

  clear() {
    this._size = 0;
    this.linkedList.clear();
    return this;
  }

  *[Symbol.iterator]() {
    for (const e of this.linkedList.entries()) {
      yield (e as unknown as ListEntry<E>).value;
    }
  }

  private getLinkedListIterator(
    start: number,
    count: number,
    advance: (cursor: LinkedListEntry<E>) => LinkedListEntry<E>
  ): ListIterator<E> {
    let cursor = this.getEntryAt(start);
    let lastResult: LinkedListEntry<E> | null = null;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        if (cursor === this.linkedList.header || count <= 0) {
          return { done: true, value: undefined };
        }
        const value = cursor.value;
        lastResult = cursor;
        cursor = advance(cursor);
        --count;
        return { done: false, value };
      },
      remove: () => {
        if (lastResult === null) throw new Error('Error invoking remove: lastResult is null');
        this.linkedList.remove(lastResult);
        const value = lastResult.value;
        lastResult = null;
        --this._size;
        return value;
      },
      setValue: (newValue: E) => {
        if (lastResult === null) throw new Error('Error Invoking setValue: lastResult is null');
        const value = lastResult.value;
        lastResult.value = newValue;
        return value;
      },
    };
  }

  listIterator(start?: number, count?: number): ListIterator<E> {
    const bounds = this.computeIteratorBounds(start, count);
    return this.getLinkedListIterator(
      bounds.start,
      bounds.count,
      (cursor: LinkedListEntry<E>) => cursor.after as LinkedListEntry<E>
    );
  }

  reverseListIterator(start?: number, count?: number): ListIterator<E> {
    const bounds = this.computeReverseIteratorBounds(start, count);
    return this.getLinkedListIterator(
      bounds.start,
      bounds.count,
      (cursor: LinkedListEntry<E>) => cursor.before as LinkedListEntry<E>
    );
  }

  clone(): LinkedList<E> {
    return LinkedList.create({ initial: this });
  }
}
