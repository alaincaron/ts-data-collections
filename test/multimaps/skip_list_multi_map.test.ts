import { expect } from 'chai';
import { Comparators } from 'ts-fluent-iterators';
import { list } from './helper';
import { MutableCollection, MutableMapEntry, OverflowException, SkipListMultiMap } from '../../src';

describe('SkipListMultiMap', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const map = new SkipListMultiMap();
      expect(map.capacity()).equal(Infinity);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(Infinity);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const map = SkipListMultiMap.create({ capacity: 2 });
      expect(map.capacity()).equal(2);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(2);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should initialize with the provided Map', () => {
      const map = SkipListMultiMap.create({ initial: new Map().set('a', 1).set('b', 2) });
      expect(map.size()).equal(2);
      expect(map.getValues('a')?.equals(list(1))).to.be.true;
      expect(map.getValues('b')?.equals(list(2))).to.be.true;
    });

    it('should initialize with the provided IMap', () => {
      const map1 = new SkipListMultiMap();
      map1.put('a', 1);
      map1.put('b', 2);
      const map = SkipListMultiMap.create({ initial: map1 });
      expect(map.size()).equal(2);
      expect(map.getValues('a')?.equals(list(1))).to.be.true;
      expect(map.getValues('b')?.equals(list(2))).to.be.true;
    });

    it('should initialize with the provided Iterable', () => {
      const map = SkipListMultiMap.create({
        initial: [
          ['a', 1],
          ['b', 2],
          ['a', 3],
          ['b', 4],
        ] as Array<[string, number]>,
      });
      expect(map.size()).equal(4);
      expect(map.getValues('a')?.equals(list(1, 3))).to.be.true;
      expect(map.getValues('b')?.equals(list(2, 4))).to.be.true;
    });
  });

  describe('put/getValues', () => {
    it('should return undefined if key is newly added', () => {
      const map = new SkipListMultiMap();
      expect(map.put('foo', 4)).to.be.true;
      expect(map.size()).equal(1);
      expect(map.getValues('foo')?.equals(list(4))).to.be.true;
    });
    it('should return the old value if key already present', () => {
      const map = new SkipListMultiMap();
      expect(map.put('foo', 4)).to.be.true;
      expect(map.put('foo', 2)).to.be.true;
      expect(map.size()).equal(2);
      expect(map.getValues('foo')?.equals(list(4, 2))).to.be.true;
    });

    it('should throw if adding a new element and map is full', () => {
      const map = SkipListMultiMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.true;
      expect(() => map.put('bar', 1)).to.throw(OverflowException);
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('offer', () => {
    it('should return true if key is accepted and added', () => {
      const map = new SkipListMultiMap();
      expect(map.offer('foo', 4)).to.be.true;
      expect(map.size()).equal(1);
      expect(map.getValues('foo')?.equals(list(4))).to.be.true;
    });
    it('should return true if key already present', () => {
      const map = new SkipListMultiMap();
      expect(map.put('foo', 4)).to.be.true;
      expect(map.offer('foo', 2)).to.be.true;
      expect(map.size()).equal(2);
      expect(map.getValues('foo')?.equals(list(4, 2))).to.be.true;
    });

    it('should return false if map is full', () => {
      const map = SkipListMultiMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.true;
      expect(map.offer('foo', 1)).to.be.false;
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new SkipListMultiMap();
      a.put('foo', 1);
      const b = a.clone();
      expect(b.equals(a)).to.be.true;
      b.put('bar', 1);
      expect(b.size()).equal(2);
      expect(a.size()).equal(1);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const map = SkipListMultiMap.create({ capacity: 3 });
      map.put('a', 1);
      map.put('b', 2);
      expect(map.size()).to.equal(2);
      expect(map.remaining()).to.equal(1);
      map.clear();
      expect(map.size()).to.equal(0);
      expect(map.remaining()).to.equal(3);
    });
  });

  describe('containsKey', () => {
    it('should return false on empty map', () => {
      const map = new SkipListMultiMap();
      expect(map.containsKey('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new SkipListMultiMap();
      map.put('foo', 1);
      expect(map.containsKey('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new SkipListMultiMap();
      map.put('foo', 1);
      expect(map.containsKey('foo')).to.be.true;
    });
  });

  describe('containsValue', () => {
    it('should return false on empty map', () => {
      const map = new SkipListMultiMap();
      expect(map.containsValue('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new SkipListMultiMap();
      map.put('foo', 1);
      expect(map.containsValue('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new SkipListMultiMap();
      map.put('foo', 1);
      expect(map.containsValue(1)).to.be.true;
    });
  });

  describe('remove', () => {
    it('should return undefined on empty map', () => {
      const map = new SkipListMultiMap();
      expect(map.removeKey('foo')).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
      expect(map.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const map = new SkipListMultiMap();
      expect(map.put('foo', 1)).to.be.true;
      expect(map.removeKey('bar')).to.be.undefined;
      expect(map.isEmpty()).to.be.false;
      expect(map.size()).equal(1);
      expect(map.removeKey('foo')?.equals(list(1))).to.be.true;
    });
  });

  describe('removeEntry', () => {
    it('should return undefined on empty map', () => {
      const map = new SkipListMultiMap();
      expect(map.removeEntry('foo', 1)).to.be.false;
      expect(map.isEmpty()).to.be.true;
      expect(map.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const map = new SkipListMultiMap();
      expect(map.put('foo', 1)).to.be.true;
      expect(map.removeEntry('foo', 2)).to.be.false;
      expect(map.isEmpty()).to.be.false;
      expect(map.size()).equal(1);
      expect(map.removeEntry('foo', 1)).to.be.true;
      expect(map.isEmpty()).to.be.true;
    });
  });

  describe('filterKeys', () => {
    it('should remove keys not matching predicate', () => {
      const map = new SkipListMultiMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      expect(map.filterKeys(k => k.startsWith('b'))).equal(2);
      expect(map.size()).equal(1);
      expect(map.containsKey('foo')).to.be.false;
      expect(map.containsKey('foobar')).to.be.false;
      expect(map.containsKey('bar')).to.be.true;
    });
  });
  describe('filterValues', () => {
    it('should remove values not matching predicate', () => {
      const map = new SkipListMultiMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      expect(map.filterValues(v => v % 2 === 0)).equal(2);
      expect(map.size()).equal(1);
      expect(map.containsKey('foo')).to.be.false;
      expect(map.containsKey('foobar')).to.be.false;
      expect(map.containsKey('bar')).to.be.true;
    });
  });

  describe('iterators', () => {
    const map = new SkipListMultiMap<string, number>();
    map.put('foo', 1);
    map.put('bar', 2);
    map.put('foobar', 3);
    map.put('foo', 4);
    map.put('foobar', 5);
    const sortedKeys = ['bar', 'foo', 'foobar'];
    it('keys should return all the keys in sorted order', () => {
      expect(Array.from(map.keys())).to.deep.equal(sortedKeys);
    });
    it('keyIterator should return all the keys in sorted order', () => {
      expect(map.keyIterator().collect()).to.deep.equal(sortedKeys);
    });
    it('entryIterator should return all entries sorted according to their key', () => {
      expect(map.entryIterator().collect()).to.deep.equal([
        ['bar', 2],
        ['foo', 1],
        ['foo', 4],
        ['foobar', 3],
        ['foobar', 5],
      ]);
    });
    it('valueIterator should return all values ordered according to the their key order', () => {
      expect(map.valueIterator().collect()).to.deep.equal([2, 1, 4, 3, 5]);
    });
    it('partitionIterator should return partitions ordered according to their key order', () => {
      const result = map.partitionIterator().collect();
      expect(result.length === 3);
      expect(result[0][0]).equal('bar');
      expect(result[0][1]?.equals(list(2))).to.be.true;
      expect(result[1][0]).equal('foo');
      expect(result[1][1]?.equals(list(1, 4))).to.be.true;
      expect(result[2][0]).equal('foobar');
      expect(result[2][1]?.equals(list(3, 5))).to.be.true;
    });
  });

  it('should return right navigation values', () => {
    const map = new SkipListMultiMap<string, number>();
    map.put('bar', 1);
    map.put('foo', 2);
    map.put('bar', 3);
    map.put('foo', 4);

    const barValue = list(1, 3);
    const fooValue = list(2, 4);

    expect(map.firstKey()).equal('bar');
    let e = map.firstEntry()!;
    expect(e.key).equal('bar');
    expect(e.value.equals(barValue)).to.be.true;

    expect(map.lastKey()).equal('foo');
    e = map.lastEntry()!;
    expect(e?.key).equal('foo');
    expect(e?.value?.equals(fooValue)).to.be.true;

    expect(map.lowerKey('bar')).to.be.undefined;
    expect(map.lowerEntry('bar')).to.be.undefined;

    expect(map.lowerKey('baz')).equal('bar');
    e = map.lowerEntry('baz')!;
    expect(e?.key).equal('bar');
    expect(e?.value.equals(barValue)).to.be.true;

    expect(map.higherKey('baz')).equal('foo');
    e = map.higherEntry('baz')!;
    expect(e.key).equal('foo');
    expect(e.value.equals(fooValue)).to.be.true;

    expect(map.floorKey('bar')).equal('bar');
    e = map.floorEntry('bar')!;
    expect(e.key).equal('bar');
    expect(e.value.equals(barValue)).to.be.true;

    expect(map.ceilingKey('baz')).equal('foo');
    e = map.ceilingEntry('baz')!;
    expect(e.key).equal('foo');
    expect(e.value.equals(fooValue)).to.be.true;

    expect(map.reverseEntryIterator().collect()).satisfies(
      (arr: MutableMapEntry<string, MutableCollection<number>>[]) => {
        expect(arr.length).equal(2);
        expect(arr[0].key).equal('foo');
        expect(arr[0].value.equals(fooValue)).to.be.true;
        expect(arr[1].key).equal('bar');
        expect(arr[1].value.equals(barValue)).to.be.true;
        return true;
      }
    );

    expect(map.reverseKeyIterator().collect()).to.deep.equal(['foo', 'bar']);

    expect(map.reverseValueIterator().collect()).to.deep.equal(fooValue.iterator().append(barValue).collect());

    expect(map.pollFirstEntry()).satisfies((e: MutableMapEntry<string, MutableCollection<number>>) => {
      expect(e.key).equal('bar');
      expect(e.value.equals(barValue)).to.be.true;
      return true;
    });

    expect(map.pollLastEntry()).satisfies((e: MutableMapEntry<string, MutableCollection<number>>) => {
      expect(e.key).equal('foo');
      expect(e.value.equals(fooValue)).to.be.true;
      return true;
    });
  });

  it('should respect the passed comparator', () => {
    const map = new SkipListMultiMap<string, number>({ comparator: Comparators.reversed });
    map.put('bar', 1);
    map.put('foo', 2);
    map.put('bar', 3);
    map.put('foo', 4);
    expect(map.firstKey()).equal('foo');
    let e = map.firstEntry()!;
    expect(e.key).equal('foo');
    expect(e.value!.equals(list(2, 4))).to.be.true;
    e = map.lastEntry()!;
    expect(e.key).equal('bar');
    expect(e.value!.equals(list(1, 3))).to.be.true;
  });
});
