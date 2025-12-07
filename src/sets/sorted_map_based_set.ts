import { Constructor } from 'ts-fluent-iterators';
import { MapBasedSet } from './map_based_set';
import { MutableSortedSet } from './sorted_set';
import { MutableSortedMap, SortedMapOptions } from '../maps';

export abstract class SortedMapBasedSet<
  E,
  M extends MutableSortedMap<E, boolean>,
  Options extends SortedMapOptions<E> = SortedMapOptions<E>,
>
  extends MapBasedSet<E, M, Options>
  implements MutableSortedSet<E>
{
  protected constructor(ctor: Constructor<M, [Options | undefined]>, options?: Options) {
    super(ctor, options);
  }

  protected delegate(): M {
    return super.delegate() as M;
  }

  first() {
    return this.delegate().firstKey();
  }

  last() {
    return this.delegate().lastKey();
  }

  reverseIterator() {
    return this.delegate().reverseKeyIterator();
  }

  abstract clone(): SortedMapBasedSet<E, M, Options>;
}
