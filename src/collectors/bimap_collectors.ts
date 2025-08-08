import { Collector } from 'ts-fluent-iterators';
import { HashMapOptions, SortedMapOptions } from '../maps';
import { WithCapacity } from '../utils';
import { BiMapOptions, createHashBiMap, MutableBiMap, createAvlTreeBiMap, createSplayTreeBiMap } from '../bimaps';

export class BiMapCollector<K, V> implements Collector<[K, V], MutableBiMap<K, V>> {
  constructor(private readonly m: MutableBiMap<K, V>) {}

  collect([k, v]: [K, V]) {
    this.m.put(k, v);
  }

  get result(): MutableBiMap<K, V> {
    return this.m;
  }
}

export function hashBiMapCollector<K, V>(initializer?: WithCapacity<BiMapOptions<HashMapOptions, HashMapOptions>>) {
  return new BiMapCollector(createHashBiMap<K, V>(initializer));
}

export function splayTreeBiMapCollector<K, V>(
  initializer?: WithCapacity<BiMapOptions<SortedMapOptions<K>, SortedMapOptions<V>>>
) {
  return new BiMapCollector(createSplayTreeBiMap(initializer));
}

export function avlTreeBiMapCollector<K, V>(
  initializer?: WithCapacity<BiMapOptions<SortedMapOptions<K>, SortedMapOptions<V>>>
) {
  return new BiMapCollector(createAvlTreeBiMap(initializer));
}
