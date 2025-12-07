import { BinaryPredicate, Constructor, Predicate, SumCollector } from 'ts-fluent-iterators';
import { AbstractMultiMap } from './abstract_multimap';
import { MutableCollection } from '../collections';
import { ArrayList } from '../lists';
import { buildMap, MutableMap } from '../maps';
import { buildOptions, OverflowException } from '../utils';

export type WithCollectionFactory<Type, V> = Type & { collectionFactory?: Constructor<MutableCollection<V>> };

export abstract class MapBasedMultiMap<K, V> extends AbstractMultiMap<K, V> {
  private readonly collectionFactory: Constructor<MutableCollection<V>>;

  protected constructor(
    protected readonly map: MutableMap<K, MutableCollection<V>>,
    collectionFactory?: Constructor<MutableCollection<V>>
  ) {
    super();
    this.collectionFactory = collectionFactory ?? (ArrayList as unknown as Constructor<MutableCollection<V>>);
  }

  capacity(): number {
    return Infinity;
  }

  size() {
    return this.map
      .valueIterator()
      .map(c => c.size())
      .collectTo(new SumCollector());
  }

  getValues(k: K): MutableCollection<V> | undefined {
    return this.map.get(k);
  }

  removeEntry(key: K, value: V): boolean {
    const values = this.getValues(key);
    if (values?.removeItem(value)) {
      if (values.isEmpty()) this.map.remove(key);
      return true;
    }
    return false;
  }

  removeKey(key: K): MutableCollection<V> | undefined {
    return this.map.remove(key);
  }

  put(key: K, value: V): boolean {
    let values = this.getValues(key);

    if (!values) {
      values = new this.collectionFactory()!;
      this.map.put(key, values);
    }

    if (!this.isFull()) {
      const result = values.add(value);
      if (values.isEmpty()) this.map.remove(key);
      return result;
    }

    if (values.isEmpty()) this.map.remove(key);
    if (values.clone().add(value)) {
      throw new OverflowException();
    }
    return false;
  }

  clear() {
    this.map.clear();
    return this;
  }

  filterKeys(predicate: Predicate<K>): number {
    const initial_size = this.size();
    const nbRemovedKeys = this.map.filterKeys(predicate);
    if (!nbRemovedKeys) return 0;
    return initial_size - this.size();
  }

  filterEntries(predicate: BinaryPredicate<K, V>): number {
    const nbRemoved = this.map
      .entryIterator()
      .map(e => e.value.filter(v => predicate(e.key, v)))
      .collectTo(new SumCollector());
    if (nbRemoved) {
      this.map.filterEntries((_, c) => !c.isEmpty());
    }
    return nbRemoved;
  }

  partitions(): IterableIterator<[K, MutableCollection<V>]> {
    return this.map.entries();
  }

  toJSON() {
    return this.map.toJSON();
  }

  buildOptions() {
    return {
      ...super.buildOptions(),
      collectionFactory: this.collectionFactory,
      delegate: {
        ...buildOptions(this.map),
        factory: this.map.constructor as Constructor<MutableMap<K, MutableCollection<V>>>,
      },
    };
  }

  abstract clone(): MapBasedMultiMap<K, V>;

  protected cloneDelegate<M extends MutableMap<K, MutableCollection<V>>>(factory: Constructor<M>): M {
    return buildMap<K, MutableCollection<V>, M>(factory, { initial: this.map });
  }
}
