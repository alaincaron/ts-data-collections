import { BinaryPredicate, FluentIterator, iterator } from 'ts-fluent-iterators';
import { buildMap } from './abstract_map';
import { AbstractNavigableMap } from './abstract_navigable_map';
import { SortedMapOptions } from './abstract_sorted_map';
import { MapInitializer, MutableMapEntry } from './mutable_map';
import { DoubleLinkedList, WithCapacity } from '../utils';

export interface SkipListNode<K, V> extends MutableMapEntry<K, V> {
  up: SkipListNode<K, V> | undefined;
  down: SkipListNode<K, V> | undefined;
  level: number;
}

export interface SkipListMapOptions<K> extends SortedMapOptions<K> {
  probability?: number;
}

export class SkipListMap<K, V> extends AbstractNavigableMap<K, V> {
  private _layers: DoubleLinkedList<SkipListNode<K, V>>[];
  private _size: number = 0;
  private readonly probability: number;

  constructor(options?: SkipListMapOptions<K>) {
    super(options);
    this._layers = [new DoubleLinkedList()];
    this.probability = (options as any)?.probability ?? 0.5;
  }

  static create<K, V>(initializer?: WithCapacity<SkipListMapOptions<K> & MapInitializer<K, V>>): SkipListMap<K, V> {
    return buildMap<K, V, SkipListMap<K, V>, SkipListMapOptions<K>>(SkipListMap, initializer);
  }

  private createNode(key: K, value: V, level: number): SkipListNode<K, V> {
    return { key, value, up: undefined, down: undefined, level };
  }

  clear(): SkipListMap<K, V> {
    this._layers = [new DoubleLinkedList()];
    this._size = 0;
    return this;
  }

  size() {
    return this._size;
  }

  putIfAbsent(key: K, value: V): V | undefined {
    return this.doPut(key, value, false);
  }

  put(key: K, value: V): V | undefined {
    return this.doPut(key, value, true);
  }

  private doPut(key: K, value: V, updateExisting: boolean): V | undefined {
    const { node, exact } = this.findNodeEntry(key);

    if (node && exact) {
      const oldValue = node.value;
      if (updateExisting) node.value = value;
      return oldValue;
    }

    if (this.handleOverflow(key, value)) return undefined;

    let currentLevel = 0;
    let newNode = this.createNode(key, value, currentLevel);
    this.horizontalInsert(currentLevel, node, newNode);

    const nbLayers = this._layers.length;
    while (this.shouldPropagateUp()) {
      const newUpNode = this.createNode(key, value, currentLevel + 1);
      this.addNodeToNextLevel(currentLevel, newNode, newUpNode);
      this.verticalLink(newUpNode, newNode);
      if (nbLayers < this._layers.length) break;
      newNode = newUpNode;
      ++currentLevel;
    }

    ++this._size;
    return undefined;
  }

  firstEntry() {
    return this._layers[0].first();
  }

  lastEntry() {
    return this._layers[0].last();
  }

  lowerEntry(key: K) {
    const { node, exact } = this.findNodeEntry(key);
    if (!node || !exact) return node;
    return this._layers[0].before(node);
  }

  higherEntry(key: K) {
    let { node } = this.findNodeEntry(key);
    if (node) {
      return this._layers[0].after(node);
    }

    node = this._layers[0].first();
    return node && this.comparator(node.key, key) > 0 ? node : undefined;
  }

  ceilingEntry(key: K) {
    const nodeEntry = this.findNodeEntry(key);
    let { node } = nodeEntry;

    if (node) {
      return nodeEntry.exact ? node : this._layers[0].after(node);
    }

    node = this._layers[0].first();
    return node && this.comparator(node.key, key) >= 0 ? node : undefined;
  }

  floorEntry(key: K) {
    return this.findNodeEntry(key)?.node;
  }

  pollLastEntry() {
    const e = this._layers[0].last();
    if (!e) return undefined;
    this.removeEntry(e);
    return e;
  }

  pollFirstEntry() {
    const e = this._layers[0].first();
    if (!e) return undefined;
    this.removeEntry(e);
    return e;
  }

  remove(key: K) {
    const e = this.getEntry(key);
    if (!e) return undefined;
    this.removeEntry(e);
    return e.value;
  }

  entryIterator() {
    return new FluentIterator(this._layers[0].entries());
  }

  reverseEntryIterator() {
    return new FluentIterator(this._layers[0].entriesReversed());
  }

  clone(): SkipListMap<K, V> {
    return SkipListMap.create({ initial: this });
  }

  private removeEmptyLayers() {
    for (let i = this._layers.length - 1; i > 0; --i) {
      const linkedList = this._layers[i];
      if (!linkedList.isEmpty()) break;
      this._layers.pop();
    }
  }

  private removeEntry(entry: SkipListNode<K, V>) {
    let e: SkipListNode<K, V> | undefined = entry;
    while (e) {
      this._layers[e.level].remove(e);
      e = e.up;
    }
    this.removeEmptyLayers();
    --this._size;
  }

  filterEntries(predicate: BinaryPredicate<K, V>): number {
    const original_size = this.size();
    for (const e of this._layers[0].entries()) {
      if (!predicate(e.key, e.value)) {
        this.removeEntry(e);
      }
    }
    return original_size - this.size();
  }

  getEntry(key: K): SkipListNode<K, V> | undefined {
    const { node, exact } = this.findNodeEntry(key);
    return node && exact ? node : undefined;
  }

  private addNodeToNextLevel(level: number, node: SkipListNode<K, V>, upNode: SkipListNode<K, V>) {
    const linkedList = this._layers[level];
    if (linkedList.isFirst(node)) {
      if (++level >= this._layers.length) {
        this._layers.push(new DoubleLinkedList<SkipListNode<K, V>>());
      }
      this.horizontalInsert(level, undefined, upNode);
      return;
    }

    for (;;) {
      if (node.up) break;
      const before = linkedList.before(node);
      if (!before) break;
      node = before;
    }
    ++level;
    if (!node.up && level >= this._layers.length) {
      this._layers.push(new DoubleLinkedList<SkipListNode<K, V>>());
    }
    this.horizontalInsert(level, node.up, upNode);
  }

  private findNodeEntry(key: K): { node?: SkipListNode<K, V>; exact?: boolean } {
    let idx = this._layers.length - 1;
    let node: SkipListNode<K, V> | undefined;
    let c: number | undefined = undefined;

    for (;;) {
      const linkedList = this._layers[idx];
      node = linkedList.first();
      if (!node) {
        return {};
      }
      c = this.comparator(node.key, key);
      if (c === 0) {
        while (node.down) node = node.down;
        return { node, exact: true };
      }
      if (c > 0) {
        if (idx === 0) {
          return {};
        }
        --idx;
        continue;
      }
      break;
    }

    for (;;) {
      const linkedList = this._layers[idx];
      let next = linkedList.after(node);
      let c1: number | undefined = undefined;
      while (next && (c1 = this.comparator(next.key, key)) <= 0) {
        node = next;
        c = c1;
        next = linkedList.after(node);
      }
      if (c === 0) {
        while (node.down) node = node.down;
        return { node, exact: true };
      }

      if (!node.down) break;
      --idx;
      node = node.down;
    }

    return { node };
  }

  layers() {
    const result = [];
    for (const layer of this._layers) {
      result.push(
        iterator(layer.entries())
          .map(x => x.key)
          .collect()
      );
    }
    return result;
  }

  private shouldPropagateUp() {
    return Math.random() < this.probability;
  }

  private horizontalInsert(level: number, node: SkipListNode<K, V> | undefined, newNode: SkipListNode<K, V>) {
    const linkedList = this._layers[level];
    if (node) {
      linkedList.addAfter(newNode, node);
    } else {
      linkedList.addFirst(newNode);
    }
  }

  private verticalLink(upNode: SkipListNode<K, V>, downNode: SkipListNode<K, V>) {
    upNode.down = downNode;
    downNode.up = upNode;
  }
}
