import { createHashBiMap, HashMultiMap } from '../../src';

export function createMultiMap<K, V>(...values: [K, V][]) {
  return HashMultiMap.create({ initial: values });
}

export function createBiMap<K, V>(...values: [K, V][]) {
  return createHashBiMap({ initial: values });
}
