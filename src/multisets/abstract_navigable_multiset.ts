import { Constructor } from 'ts-fluent-iterators';
import { AbstractSortedMultiSet } from './abstract_sorted_multiset';
import { MultiSetEntry } from './multiset';
import { MutableNavigableMultiSet } from './mutable_navigable_multiset';
import { MutableMapEntry, MutableNavigableMap, SortedMapOptions } from '../maps';
import { UnderflowException } from '../utils';

export abstract class AbstractNavigableMultiSet<
  E,
  M extends MutableNavigableMap<E, number>,
  Options extends SortedMapOptions<E> = SortedMapOptions<E>,
>
  extends AbstractSortedMultiSet<E, M, Options>
  implements MutableNavigableMultiSet<E>
{
  protected constructor(ctor: Constructor<M, [Options | undefined]>, options?: Options) {
    super(ctor, options);
  }

  protected delegate() {
    return this.map as MutableNavigableMap<E, number>;
  }

  lower(key: E): E | undefined {
    return this.delegate().lowerKey(key);
  }

  lowerEntry(key: E): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().lowerEntry(key));
  }

  higher(key: E): E | undefined {
    return this.delegate().higherKey(key);
  }

  higherEntry(key: E): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().higherEntry(key));
  }

  floor(key: E): E | undefined {
    return this.delegate().floorKey(key);
  }

  floorEntry(key: E): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().floorEntry(key));
  }

  ceiling(key: E): E | undefined {
    return this.delegate().ceilingKey(key);
  }

  ceilingEntry(key: E): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().ceilingEntry(key));
  }

  pollFirstEntry(): MultiSetEntry<E> | undefined {
    const e = this.convert(this.delegate().firstEntry());
    if (!e) return undefined;
    this.setCount(e.key, 0);
    return e;
  }

  pollLastEntry(): MultiSetEntry<E> | undefined {
    const e = this.convert(this.delegate().lastEntry());
    if (!e) return undefined;
    this.setCount(e.key, 0);
    return e;
  }

  pollFirst(): E | undefined {
    return this.removeOne(this.delegate().firstEntry());
  }

  pollLast(): E | undefined {
    return this.removeOne(this.delegate().lastEntry());
  }

  private removeOne(e: MutableMapEntry<E, number> | undefined) {
    if (!e) return undefined;
    --this._size;
    --e.value;
    if (!e.value) {
      this.delegate().remove(e.key);
    }
    return e.key;
  }

  removeFirst(): E {
    const e = this.pollFirst();
    if (e === undefined) throw new UnderflowException();
    return e;
  }

  removeLast(): E {
    const e = this.pollLast();
    if (e === undefined) throw new UnderflowException();
    return e;
  }

  abstract clone(): AbstractNavigableMultiSet<E, M, Options>;
}
