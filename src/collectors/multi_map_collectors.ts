import { Collector } from 'ts-fluent-iterators';
import { HashMapOptions, LinkedHashMapOptions, SortedMapOptions } from '../maps';
import {
  AvlTreeMultiMap,
  HashMultiMap,
  LinkedHashMultiMap,
  MutableMultiMap,
  OpenHashMultiMap,
  SkipListMultiMap,
  SplayTreeMultiMap,
} from '../multimaps';
import { WithCapacity } from '../utils';

export class MultiMapCollector<K, V, M extends MutableMultiMap<K, V>> implements Collector<[K, V], M> {
  constructor(private readonly m: M) {}

  collect([k, v]: [K, V]) {
    this.m.put(k, v);
  }

  get result(): M {
    return this.m;
  }
}

export function hashMultiMapCollector<K, V>(
  arg?: HashMultiMap<K, V> | WithCapacity<HashMapOptions>
): MultiMapCollector<K, V, HashMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof HashMultiMap ? arg : HashMultiMap.create(arg));
}

export function linkedHashMultiMapCollector<K, V>(
  arg?: LinkedHashMultiMap<K, V> | WithCapacity<LinkedHashMapOptions>
): MultiMapCollector<K, V, LinkedHashMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof LinkedHashMultiMap ? arg : LinkedHashMultiMap.create(arg));
}

export function openHashMultiMapCollector<K, V>(
  arg?: OpenHashMultiMap<K, V> | WithCapacity<HashMapOptions>
): MultiMapCollector<K, V, OpenHashMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof OpenHashMultiMap ? arg : OpenHashMultiMap.create(arg));
}

export function splayTreeMultiMapCollector<K, V>(
  arg?: SplayTreeMultiMap<K, V> | WithCapacity<SortedMapOptions<K>>
): MultiMapCollector<K, V, SplayTreeMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof SplayTreeMultiMap ? arg : SplayTreeMultiMap.create(arg));
}

export function avlTreeMultiMapCollector<K, V>(
  arg?: AvlTreeMultiMap<K, V> | WithCapacity<SortedMapOptions<K>>
): MultiMapCollector<K, V, AvlTreeMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof AvlTreeMultiMap ? arg : AvlTreeMultiMap.create(arg));
}

export function skipListMultiMapCollector<K, V>(
  arg?: SkipListMultiMap<K, V> | WithCapacity<SortedMapOptions<K>>
): MultiMapCollector<K, V, SkipListMultiMap<K, V>> {
  return new MultiMapCollector(arg instanceof SkipListMultiMap ? arg : new SkipListMultiMap(arg));
}
