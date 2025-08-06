import { HashMapOptions, LinkedHashMapOptions, SortedMapOptions } from '../maps';
import {
  AvlTreeMultiSet,
  HashMultiSet,
  LinkedHashMultiSet,
  OpenHashMultiSet,
  SkipListMultiSet,
  SplayTreeMultiSet,
} from '../multisets';
import { WithCapacity } from '../utils';
import { CollectionCollector } from './collection_collectors';

export function hashMultiSetCollector<E>(
  arg?: HashMultiSet<E> | WithCapacity<HashMapOptions>
): CollectionCollector<E, HashMultiSet<E>> {
  return new CollectionCollector(arg instanceof HashMultiSet ? arg : HashMultiSet.create(arg));
}

export function linkedHashMultiSetCollector<E>(
  arg?: LinkedHashMultiSet<E> | WithCapacity<LinkedHashMapOptions>
): CollectionCollector<E, LinkedHashMultiSet<E>> {
  return new CollectionCollector(arg instanceof LinkedHashMultiSet ? arg : LinkedHashMultiSet.create(arg));
}

export function openHashMultiSetCollector<E>(
  arg?: OpenHashMultiSet<E> | WithCapacity<HashMapOptions>
): CollectionCollector<E, OpenHashMultiSet<E>> {
  return new CollectionCollector(arg instanceof OpenHashMultiSet ? arg : OpenHashMultiSet.create(arg));
}

export function splayTreeMultiSetCollector<E>(
  arg?: SplayTreeMultiSet<E> | WithCapacity<SortedMapOptions<E>>
): CollectionCollector<E, SplayTreeMultiSet<E>> {
  return new CollectionCollector(arg instanceof SplayTreeMultiSet ? arg : SplayTreeMultiSet.create(arg));
}

export function avlTreeMultiSetCollector<E>(
  arg?: AvlTreeMultiSet<E> | WithCapacity<SortedMapOptions<E>>
): CollectionCollector<E, AvlTreeMultiSet<E>> {
  return new CollectionCollector(arg instanceof AvlTreeMultiSet ? arg : AvlTreeMultiSet.create(arg));
}

export function skipListMultiSetCollector<E>(
  arg?: SkipListMultiSet<E> | WithCapacity<SortedMapOptions<E>>
): CollectionCollector<E, SkipListMultiSet<E>> {
  return new CollectionCollector(arg instanceof SkipListMultiSet ? arg : SkipListMultiSet.create(arg));
}
