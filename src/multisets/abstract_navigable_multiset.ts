import { AbstractSortedMultiSet } from './abstract_sorted_multiset';
import { Count } from './map_based_multiset';
import { NavigableMultiSet } from './navigable_multiset';
import { MapEntry, NavigableMap } from '../maps';

export abstract class AbstractNavigableMultiSet<E> extends AbstractSortedMultiSet<E> implements NavigableMultiSet<E> {
  protected constructor(mapFactory: NavigableMap<E, Count> | (new () => NavigableMap<E, Count>)) {
    super(mapFactory);
  }

  protected delegate() {
    return this.map as NavigableMap<E, Count>;
  }

  lower(key: E): E | undefined {
    return this.delegate().lowerKey(key);
  }

  lowerEntry(key: E): MapEntry<E, number> | undefined {
    const e = this.delegate().lowerEntry(key);
    return e && { key: e.key, value: e.value.count };
  }

  higher(key: E): E | undefined {
    return this.delegate().higherKey(key);
  }

  higherEntry(key: E): MapEntry<E, number> | undefined {
    const e = this.delegate().higherEntry(key);
    return e && { key: e.key, value: e.value.count };
  }

  floor(key: E): E | undefined {
    return this.delegate().floorKey(key);
  }

  floorEntry(key: E): MapEntry<E, number> | undefined {
    const e = this.delegate().floorEntry(key);
    return e && { key: e.key, value: e.value.count };
  }

  ceiling(key: E): E | undefined {
    return this.delegate().ceilingKey(key);
  }

  ceilingEntry(key: E): MapEntry<E, number> | undefined {
    const e = this.delegate().ceilingEntry(key);
    return e && { key: e.key, value: e.value.count };
  }

  pollFirstEntry(): MapEntry<E, number> | undefined {
    const e = this.delegate().pollFirstEntry();
    return e && { key: e.key, value: e.value.count };
  }

  pollLastEntry(): MapEntry<E, number> | undefined {
    const e = this.delegate().pollLastEntry();
    return e && { key: e.key, value: e.value.count };
  }

  pollFirst(): E | undefined {
    const e = this.delegate().firstEntry();
    if (!e) return undefined;
    this.removeItem(e.key);
    return e.key;
  }

  pollLast(): E | undefined {
    const e = this.delegate().lastEntry();
    if (!e) return undefined;
    this.removeItem(e.key);
    return e.key;
  }

  abstract clone(): AbstractNavigableMultiSet<E>;
}
