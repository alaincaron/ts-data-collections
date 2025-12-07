import { BinaryPredicate, Comparator, Comparators, Constructor } from 'ts-fluent-iterators';
import { AbstractMap } from './abstract_map';
import { MapInitializer, MapLike, MutableMapEntry } from './mutable_map';
import { ArrayList, LinkedList, MutableList } from '../lists';
import {
  buildOptions,
  ContainerInitializer,
  ContainerOptions,
  equalsAny,
  extractOptions,
  WithCapacity,
} from '../utils';

export abstract class ListBasedMap<
  K,
  V,
  L extends MutableList<MutableMapEntry<K, V>>,
  Options extends object = object,
> extends AbstractMap<K, V> {
  private readonly _delegate: L;
  protected constructor(ctor: Constructor<L, [Options | undefined]>, options?: Options) {
    super();
    this._delegate = 'create' in ctor && typeof ctor.create === 'function' ? ctor.create(options) : new ctor(options);
  }

  protected delegate() {
    return this._delegate;
  }

  size() {
    return this._delegate.size();
  }

  capacity() {
    return this._delegate.capacity();
  }

  clear(): ListBasedMap<K, V, L, Options> {
    this._delegate.clear();
    return this;
  }

  getEntry(key: K) {
    return this._delegate.find(e => equalsAny(e.key, key));
  }

  put(key: K, value: V) {
    const e = this.getEntry(key);
    if (!e) {
      this._delegate.add({ key, value });
      return undefined;
    }
    const oldValue = e.value;
    e.value = value;
    return oldValue;
  }

  putIfAbsent(key: K, value: V): V | undefined {
    const entry = this.getEntry(key);
    if (!entry) this._delegate.add({ key, value });
    return entry?.value;
  }

  remove(key: K) {
    return this._delegate.removeFirstMatchingItem(e => equalsAny(e.key, key))?.value;
  }

  filterEntries(predicate: BinaryPredicate<K, V>) {
    return this._delegate.filter(e => predicate(e.key, e.value));
  }

  entryIterator() {
    return this._delegate.iterator();
  }

  buildOptions() {
    return buildOptions(this._delegate);
  }

  sort(comparator: Comparator<K> = Comparators.natural) {
    this._delegate.sort((e1, e2) => comparator(e1.key, e2.key));
  }

  protected static createMap<
    K,
    V,
    L extends MutableList<MutableMapEntry<K, V>>,
    M extends ListBasedMap<K, V, L, Options>,
    Options extends object = object,
  >(mapFactory: Constructor<M>, initializer?: WithCapacity<Options & ContainerInitializer<MapLike<K, V>>>): M {
    const { options, initialElements } = extractOptions<M, Options>(initializer);
    const result = new mapFactory(options);

    if (initialElements) result.putAll(initialElements);
    return result;
  }
}

export class ArrayMap<K, V> extends ListBasedMap<K, V, ArrayList<MutableMapEntry<K, V>>> {
  constructor(options?: ContainerOptions) {
    super(ArrayList, options);
  }

  static create<K, V>(initializer?: WithCapacity<MapInitializer<K, V>>): ArrayMap<K, V> {
    return ListBasedMap.createMap<K, V, ArrayList<MutableMapEntry<K, V>>, ArrayMap<K, V>>(ArrayMap, initializer);
  }

  clone() {
    return ArrayMap.create({ initial: this });
  }
}

export class LinkedMap<K, V> extends ListBasedMap<K, V, LinkedList<MutableMapEntry<K, V>>> {
  constructor(options?: ContainerOptions) {
    super(LinkedList, options);
  }

  static create<K, V>(initializer?: WithCapacity<MapInitializer<K, V>>): LinkedMap<K, V> {
    return ListBasedMap.createMap<K, V, LinkedList<MutableMapEntry<K, V>>, LinkedMap<K, V>>(LinkedMap, initializer);
  }

  clone(): LinkedMap<K, V> {
    return LinkedMap.create({ initial: this });
  }
}
