import { expect } from 'chai';
import { Comparators } from 'ts-fluent-iterators';
import {
  ArrayList,
  EmptyList,
  EmptyMultiSet,
  EmptySet,
  Immutable,
  ImmutableList,
  ImmutableNavigableMultiSet,
  ImmutableNavigableSet,
  ImmutableSortedMultiSet,
  ImmutableSortedSet,
  SingletonList,
  SingletonMultiSet,
  SingletonSet,
} from '../../src';

describe('Immutable', () => {
  describe('emptyList', () => {
    it('should return an empty immutable list', () => {
      const list = Immutable.emptyList();
      expect(list.size()).to.equal(0);
      expect(list).to.be.instanceof(EmptyList);
    });

    it('should always return the same instance', () => {
      const list1 = Immutable.emptyList();
      const list2 = Immutable.emptyList();
      expect(list1).to.equal(list2);
    });
  });

  describe('singletonList', () => {
    it('should create an immutable list with one element', () => {
      const list = Immutable.singletonList(42);
      expect(list).to.be.instanceof(SingletonList);
      expect(list.size()).to.equal(1);
      expect(list.getAt(0)).to.equal(42);
    });
  });

  describe('listOf', () => {
    it('should create an immutable list from given elements', () => {
      const list = Immutable.listOf(1, 2, 3);
      expect(list.size()).to.equal(3);
      expect(list.toArray()).to.deep.equal([1, 2, 3]);
    });

    it('should return empty list when no elements provided', () => {
      const list = Immutable.listOf();
      expect(list.size()).to.equal(0);
      expect(list).to.be.instanceof(EmptyList);
    });
    it('should return a SingletonList for one item', () => {
      const list = Immutable.listOf(11);
      expect(list).to.be.instanceOf(SingletonList);
      expect(list.getFirst()).to.equal(11);
    });
  });

  describe('asReadOnlyCollection', () => {
    it('should return an immutable view of a collection', () => {
      const list = ArrayList.create({ initial: [1, 2, 3] });
      const immutable = Immutable.asReadOnlyCollection(list);
      expect(immutable.size()).to.equal(3);
      list.add(4);
      expect(immutable.size()).to.equal(4);
    });

    it('should return the same instance if already immutable', () => {
      const immutable1 = Immutable.listOf(1, 2, 3);
      const immutable2 = Immutable.asReadOnlyCollection(immutable1);
      expect(immutable1).to.equal(immutable2);
    });
  });

  describe('toList', () => {
    it('should create an immutable list from a collection-like object', () => {
      const array = [7, 8, 9];
      const list = Immutable.toList(array);
      expect(list.toArray()).to.eql(array);
    });
    it('should return the argument is the argument is a readonly list', () => {
      const argList = Immutable.listOf(1, 2, 3);
      expect(Immutable.toList(argList)).to.equal(argList);
    });
  });

  describe('sortedListOf', () => {
    it('should create a sorted immutable list using the provided comparator', () => {
      const list = Immutable.sortedListOf(Comparators.reverse(), 4, 1, 3, 2, 5);
      expect(list.toArray()).to.eql([5, 4, 3, 2, 1]);
    });
  });

  describe('asReadOnlyList', () => {
    it('should wrap a mutable list as immutable', () => {
      const mutableList = ArrayList.create({ initial: [10, 20, 30] });
      const readOnlyList = Immutable.asReadOnlyList(mutableList);
      expect(readOnlyList.getFirst()).to.equal(10);
      expect(readOnlyList).to.be.instanceof(ImmutableList);
    });

    it('should return the same list if it is already readonly', () => {
      const readOnlyList = EmptyList.instance();
      const result = Immutable.asReadOnlyList(readOnlyList);
      expect(result).to.equal(readOnlyList);
    });
  });

  describe('emptySet', () => {
    it('should return an EmptySet instance', () => {
      const emptySet = Immutable.emptySet();
      expect(emptySet).to.be.instanceOf(EmptySet);
    });
  });

  describe('singletonSet', () => {
    it('should return a SingletonSet with the specified item', () => {
      const singletonSet = Immutable.singletonSet(123);
      expect(singletonSet).to.be.instanceOf(SingletonSet);
      expect(singletonSet.contains(123)).to.be.true;
    });
  });

  describe('setOf', () => {
    it('should create an immutable set from provided elements', () => {
      const set = Immutable.setOf(1, 2, 3);
      expect(set.size()).to.equal(3);
      expect(set.contains(2)).to.be.true;
      expect(set.contains(4)).to.be.false;
    });

    it('should return empty set when no elements provided', () => {
      const set = Immutable.setOf();
      expect(set.size()).to.equal(0);
      expect(set).to.be.instanceof(EmptySet);
    });

    it('should return a SingletonSet for one item', () => {
      const set = Immutable.setOf(29);
      expect(set).to.be.instanceOf(SingletonSet);
      expect(set.contains(29)).to.be.true;
    });
  });

  describe('multiSetOf', () => {
    it('should create an immutable multiset from given elements', () => {
      const multiset = Immutable.multiSetOf(1, 1, 2, 3, 3);
      expect(multiset.size()).to.equal(5);
      expect(multiset.count(1)).to.equal(2);
      expect(multiset.count(3)).to.equal(2);
    });

    it('should create a singleton multiset if only one element is provided', () => {
      const multiset = Immutable.multiSetOf(1);
      expect(multiset).to.be.instanceOf(SingletonMultiSet);
      expect(multiset.equals(Immutable.singletonMultiSet(1))).to.be.true;
    });

    it('should return empty multiset when no elements provided', () => {
      const multiset = Immutable.multiSetOf();
      expect(multiset.size()).to.equal(0);
      expect(multiset).to.equal(Immutable.emptyMultiSet());
    });
  });

  describe('sortedSetOf', () => {
    it('should create a sorted immutable set using the provided comparator', () => {
      const set = Immutable.sortedSetOf(Comparators.natural, 5, 2, 3, 1);
      expect(set.toArray()).to.eql([1, 2, 3, 5]);
    });
  });

  describe('toSet', () => {
    it('should create an EmptySet when no items are provided', () => {
      expect(Immutable.toSet([])).to.be.instanceOf(EmptySet);
    });

    it('should create an immutable set from a collection-like object', () => {
      const set = Immutable.toSet([3]);
      expect(set).to.be.instanceof(SingletonSet);
      expect(set.equals(Immutable.singletonSet(3))).to.be.true;
    });
    it('should create an immutable set from a collection-like object', () => {
      const array = [3, 1, 2];
      const set = Immutable.toSet(array);
      expect(set.contains(1)).to.be.true;
      expect(set.contains(4)).to.be.false;
    });
  });

  describe('toMultiSet', () => {
    it('should create an EmptyMultiSet when no items are provided', () => {
      expect(Immutable.toMultiSet([])).to.be.instanceOf(EmptyMultiSet);
    });

    it('should create an immutable set from a collection-like object', () => {
      const set = Immutable.toMultiSet([3]);
      expect(set).to.be.instanceof(SingletonMultiSet);
      expect(set.equals(Immutable.singletonMultiSet(3))).to.be.true;
    });
    it('should create an immutable set from a collection-like object', () => {
      const array = [3, 1, 2, 3];
      const set = Immutable.toMultiSet(array);
      expect(set.contains(1)).to.be.true;
      expect(set.contains(4)).to.be.false;
      expect(set.count(3)).equal(2);
    });
  });

  describe('toSortedList', () => {
    it('should return an empty list when no elements provided', () => {
      expect(Immutable.toSortedList([])).to.be.instanceof(EmptyList);
    });
    it('should return a SingletonList for one item', () => {
      const list = Immutable.toSortedList(ArrayList.create({ initial: [11] }));
      expect(list).to.be.instanceOf(SingletonList);
      expect(list.iterator().collect()).to.eql([11]);
    });
    it('should return a sorted list', () => {
      const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100000));
      const list = Immutable.toSortedList(arr);
      arr.sort(Comparators.natural);
      expect(list.toArray()).to.eql(arr);
    });
  });

  describe('sortedSetOf', () => {
    it('should return EmptySet with no items', () => {
      expect(Immutable.sortedSetOf(Comparators.natural)).to.be.instanceof(EmptySet);
    });
    it('should return a SingletonSet with a single item', () => {
      const set = Immutable.sortedSetOf(Comparators.natural, 1);
      expect(set).to.be.instanceOf(SingletonSet);
      expect(set.equals(Immutable.singletonSet(1))).to.be.true;
    });
    it('should return a sorted set', () => {
      const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100000));
      const set = Immutable.sortedSetOf(Comparators.natural, ...arr);
      expect(set).to.be.instanceOf(ImmutableSortedSet);
      expect(set.toArray()).eql(arr.sort(Comparators.natural));
    });
  });

  describe('toSortedSet', () => {
    it('should return an empty set when no elements provided', () => {
      expect(Immutable.toSortedSet([])).to.be.instanceof(EmptySet);
    });
    it('should return a SingletonSet for one item', () => {
      const set = Immutable.toSortedSet(ArrayList.create({ initial: [11, 11] }));
      expect(set).to.be.instanceOf(SingletonSet);
      expect(set.iterator().collect()).to.eql([11]);
    });
    it('should return a sorted set', () => {
      const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100000));
      const set = Immutable.toSortedSet(arr);
      arr.sort(Comparators.natural);
      expect(set.toArray()).to.eql(arr);
    });
  });

  describe('toNavigableSet', () => {
    it('should return an empty set when no elements provided', () => {
      expect(Immutable.toNavigableSet([])).to.be.instanceof(EmptySet);
    });
    it('should return a navigable set for one item', () => {
      const set = Immutable.toNavigableSet(ArrayList.create({ initial: [11, 11] }));
      expect(set).to.be.instanceOf(ImmutableNavigableSet);
      expect(set.iterator().collect()).to.eql([11]);
    });
    it('should return a navigable set', () => {
      const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100000));
      const set = Immutable.toNavigableSet(arr);
      expect(set).to.be.instanceof(ImmutableNavigableSet);
      arr.sort(Comparators.natural);
      expect(set.toArray()).to.eql(arr);
    });
  });

  describe('navigableSetOf', () => {
    it('should return EmptySet with no items', () => {
      expect(Immutable.navigableSetOf(Comparators.natural)).to.be.instanceof(EmptySet);
    });
    it('should return a SingletonSet with a single item', () => {
      const set = Immutable.navigableSetOf(Comparators.natural, 1);
      expect(set).to.be.instanceOf(ImmutableNavigableSet);
      expect(set.equals(Immutable.singletonSet(1))).to.be.true;
    });
    it('should return a sorted set', () => {
      const arr = Array.from({ length: 10 }, (_, i) => i).shuffle();
      const set = Immutable.navigableSetOf(Comparators.natural, ...arr);
      expect(set).to.be.instanceOf(ImmutableNavigableSet);
      expect(set.toArray()).eql(arr.sort(Comparators.natural));
    });
  });

  describe('sortedMultiSetOf', () => {
    it('should return EmptyMultiSet with no items', () => {
      expect(Immutable.sortedMultiSetOf(Comparators.natural)).to.be.instanceof(EmptyMultiSet);
    });
    it('should return a SingletonMultiSet with a single item', () => {
      const set = Immutable.sortedMultiSetOf(Comparators.natural, 1);
      expect(set).to.be.instanceOf(SingletonMultiSet);
      expect(set.equals(Immutable.singletonMultiSet(1))).to.be.true;
    });
    it('should return a sorted multiSet', () => {
      const arr = [1, 2, 3, 2, 3, 4, 1, 4, 0];
      const set = Immutable.sortedMultiSetOf(Comparators.natural, ...arr);
      expect(set).to.be.instanceOf(ImmutableSortedMultiSet);
      expect(set.toArray()).eql(arr.sort(Comparators.natural));
    });
  });

  describe('toSortedMultiSet', () => {
    it('should return an empty multiSet when no elements provided', () => {
      expect(Immutable.toSortedMultiSet([])).to.be.instanceof(EmptyMultiSet);
    });
    it('should return a SingletonMultiSet for one item', () => {
      const set = Immutable.toSortedMultiSet(ArrayList.create({ initial: [11] }));
      expect(set).to.be.instanceOf(SingletonMultiSet);
      expect(set.iterator().collect()).to.eql([11]);
    });
    it('should return a sorted multiSet', () => {
      const arr = [1, 2, 3, 2, 3, 4, 1, 4, 0];
      const set = Immutable.toSortedMultiSet(arr);
      arr.sort(Comparators.natural);
      expect(set.toArray()).to.eql(arr);
    });
  });

  describe('toNavigableMultiSet', () => {
    it('should return an empty set when no elements provided', () => {
      expect(Immutable.toNavigableMultiSet([])).to.be.instanceof(EmptyMultiSet);
    });
    it('should return a navigable set', () => {
      const arr = [1, 2, 3, 2, 3, 4, 1, 4, 0];
      const set = Immutable.toNavigableMultiSet(arr);
      expect(set).to.be.instanceof(ImmutableNavigableMultiSet);
      arr.sort(Comparators.natural);
      expect(set.toArray()).to.eql(arr);
    });
  });

  describe('navigableMultiSetOf', () => {
    it('should return EmptyMultiSet with no items', () => {
      expect(Immutable.navigableMultiSetOf(Comparators.natural)).to.be.instanceof(EmptyMultiSet);
    });
    it('should return a sorted set', () => {
      const arr = [1, 2, 3, 2, 3, 4, 1, 4, 0];
      const set = Immutable.navigableMultiSetOf(Comparators.natural, ...arr);
      expect(set).to.be.instanceOf(ImmutableNavigableMultiSet);
      expect(set.toArray()).eql(arr.sort(Comparators.natural));
    });
  });
});
