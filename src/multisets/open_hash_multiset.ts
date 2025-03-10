import { buildMultiSet, MultiSetInitializer } from './abstract_multiset';
import { MapBasedMultiSet } from './map_based_multiset';
import { HashMapOptions, OpenHashMap } from '../maps';
import { WithCapacity } from '../utils';

export class OpenHashMultiSet<E> extends MapBasedMultiSet<E, OpenHashMap<E, number>, HashMapOptions> {
  constructor(options?: HashMapOptions) {
    super(OpenHashMap, options);
  }

  static create<E>(initializer?: WithCapacity<HashMapOptions & MultiSetInitializer<E>>): OpenHashMultiSet<E> {
    return buildMultiSet<E, OpenHashMultiSet<E>, HashMapOptions>(OpenHashMultiSet, initializer);
  }

  clone(): OpenHashMultiSet<E> {
    return OpenHashMultiSet.create({ initial: this });
  }
}
