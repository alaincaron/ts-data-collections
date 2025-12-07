import { Constructor, FluentIterator } from 'ts-fluent-iterators';
import { MapBasedMultiSet } from './map_based_multiset';
import { MultiSetEntry } from './multiset';
import { MutableSortedMultiSet } from './mutable_sorted_multiset';
import { MutableSortedMap, SortedMapOptions } from '../maps';

export abstract class AbstractSortedMultiSet<
  E,
  M extends MutableSortedMap<E, number>,
  Options extends SortedMapOptions<E> = SortedMapOptions<E>,
>
  extends MapBasedMultiSet<E, M, Options>
  implements MutableSortedMultiSet<E>
{
  protected constructor(ctor: Constructor<M, [Options | undefined]>, options?: Options) {
    super(ctor, options);
  }

  protected delegate() {
    return this.map as MutableSortedMap<E, number>;
  }

  firstEntry(): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().firstEntry());
  }

  lastEntry(): MultiSetEntry<E> | undefined {
    return this.convert(this.delegate().lastEntry());
  }

  first(): E | undefined {
    return this.delegate().firstKey();
  }

  last(): E | undefined {
    return this.delegate().lastKey();
  }

  reverseEntryIterator(): FluentIterator<MultiSetEntry<E>> {
    return this.delegate()
      .reverseEntryIterator()
      .map(e => this.convert(e)!);
  }

  private *reverseFoldIterator(): IterableIterator<E> {
    for (const [key, count] of this.delegate().reverseEntries()) {
      for (let i = 0; i < count; ++i) yield key;
    }
  }

  reverseIterator(): FluentIterator<E> {
    return FluentIterator.from(this.reverseFoldIterator());
  }

  abstract clone(): AbstractSortedMultiSet<E, M, Options>;
}
