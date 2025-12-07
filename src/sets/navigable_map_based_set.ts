import { Constructor } from 'ts-fluent-iterators';
import { MutableNavigableSet } from './navigable_set';
import { SortedMapBasedSet } from './sorted_map_based_set';
import { MutableNavigableMap, SortedMapOptions } from '../maps';

export abstract class NavigableMapBasedSet<
  E,
  M extends MutableNavigableMap<E, boolean>,
  Options extends SortedMapOptions<E>,
>
  extends SortedMapBasedSet<E, M, Options>
  implements MutableNavigableSet<E>
{
  protected constructor(ctor: Constructor<M, [Options | undefined]>, options?: Options) {
    super(ctor, options);
  }

  protected delegate(): M {
    return super.delegate() as M;
  }

  floor(e: E) {
    return this.delegate().floorKey(e);
  }

  ceiling(e: E) {
    return this.delegate().ceilingKey(e);
  }

  lower(e: E) {
    return this.delegate().lowerKey(e);
  }

  higher(e: E) {
    return this.delegate().higherKey(e);
  }

  pollFirst() {
    return this.delegate().pollFirstEntry()?.key;
  }

  pollLast() {
    return this.delegate().pollLastEntry()?.key;
  }

  abstract clone(): NavigableMapBasedSet<E, M, Options>;
}
