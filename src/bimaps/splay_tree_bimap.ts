import { BiMap, BiMapOptions } from './bimap';
import { MapInitializer, SortedMapOptions, SplayTreeMap } from '../maps';
import { WithCapacity } from '../utils';
import { MutableBiMap } from './bimap_interface';

export function createSplayTreeBiMap<K, V>(
  initializer?: WithCapacity<BiMapOptions<SortedMapOptions<K>, SortedMapOptions<V>> & MapInitializer<K, V>>
): MutableBiMap<K, V> {
  return BiMap.create<K, V, SplayTreeMap<K, V>, SplayTreeMap<V, K>, SortedMapOptions<K>, SortedMapOptions<V>>(
    SplayTreeMap,
    SplayTreeMap,
    initializer
  );
}
