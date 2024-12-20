import { buildMultiSet, MultiSetInitializer } from './abstract_multiset';
import { AbstractNavigableMultiSet } from './abstract_navigable_multiset';
import { SortedMapOptions, SplayTreeMap } from '../maps';
import { WithCapacity } from '../utils';

export class SplayTreeMultiSet<E> extends AbstractNavigableMultiSet<E> {
  constructor(options?: SortedMapOptions<E>) {
    super(new SplayTreeMap(options));
  }

  static create<E>(initializer?: WithCapacity<SortedMapOptions<E> & MultiSetInitializer<E>>): SplayTreeMultiSet<E> {
    return buildMultiSet<E, SplayTreeMultiSet<E>, SortedMapOptions<E>>(SplayTreeMultiSet, initializer);
  }

  clone(): SplayTreeMultiSet<E> {
    return SplayTreeMultiSet.create({ initial: this });
  }
}
