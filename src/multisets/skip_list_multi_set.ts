import { buildMultiSet, MultiSetInitializer } from './multi_set';
import { NavigableMultiSet } from './navigable_multi_set';
import { SkipListMap, SkipListMapOptions } from '../maps';

export class SkipListMultiSet<E> extends NavigableMultiSet<E> {
  constructor(options?: number | SkipListMapOptions<E>) {
    super(new SkipListMap(options), options);
  }

  static create<E>(initializer?: number | (SkipListMapOptions<E> & MultiSetInitializer<E>)): SkipListMultiSet<E> {
    return buildMultiSet<E, SkipListMultiSet<E>>(SkipListMultiSet, initializer);
  }

  clone(): SkipListMultiSet<E> {
    return SkipListMultiSet.create({ initial: this });
  }
}
