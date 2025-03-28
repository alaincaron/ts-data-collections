import { expect } from 'chai';
import { LinkedHashMap, Ordering, OverflowException, OverflowStrategy } from '../../src';

function collectKeys<K, V>(m: LinkedHashMap<K, V>): K[] {
  return Array.from(m.keys());
}

describe('LinkedHashMap', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const map = new LinkedHashMap();
      expect(map.capacity()).equal(Infinity);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(Infinity);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const map = LinkedHashMap.create({ capacity: 2 });
      expect(map.capacity()).equal(2);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(2);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should initialize with the provided Map and respect access ordering', () => {
      const map = LinkedHashMap.create({ ordering: Ordering.ACCESS, initial: new Map().set('a', 1).set('b', 2) });
      expect(map.size()).equal(2);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
      expect(map.get('b')).equal(2);
      expect(map.get('a')).equal(1);
      expect(collectKeys(map)).to.deep.equal(['b', 'a']);
    });

    it('should initialize with the provided Map and respect insertion ordering', () => {
      const map = LinkedHashMap.create({ ordering: Ordering.INSERTION, initial: new Map().set('a', 1).set('b', 2) });
      expect(map.size()).equal(2);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
      expect(map.get('b')).equal(2);
      expect(map.get('a')).equal(1);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
      expect(map.put('a', 3)).equal(1);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
    });

    it('should initialize with the provided Map and respect modification ordering', () => {
      const map = LinkedHashMap.create({ ordering: Ordering.MODIFICATION, initial: new Map().set('a', 1).set('b', 2) });
      expect(map.size()).equal(2);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
      expect(map.get('b')).equal(2);
      expect(map.get('a')).equal(1);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
      expect(map.put('a', 3)).equal(1);
      expect(collectKeys(map)).to.deep.equal(['b', 'a']);
    });

    it('should initialize with the provided IMap', () => {
      const map1 = new LinkedHashMap();
      map1.put('a', 1);
      map1.put('b', 2);
      const map = LinkedHashMap.create({ initial: map1 });
      expect(map.size()).equal(2);
      expect(map.get('b')).equal(2);
      expect(map.get('a')).equal(1);
      expect(collectKeys(map)).to.deep.equal(['a', 'b']);
    });

    it('should initialize with the provided Iterable', () => {
      const map = LinkedHashMap.create({
        initial: [
          ['a', 1],
          ['b', 2],
        ] as Array<[string, number]>,
      });
      expect(map.size()).equal(2);
      expect(map.get('a')).equal(1);
      expect(map.get('b')).equal(2);
    });
  });

  describe('put/get', () => {
    it('should return undefined if key is newly added', () => {
      const map = new LinkedHashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(4);
    });
    it('should return the old value if key already present', () => {
      const map = new LinkedHashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.put('foo', 2)).equal(4);
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(2);
    });

    it('should throw if adding a new element and map is full', () => {
      const map = LinkedHashMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.put('foo', 2)).equal(1);
      expect(() => map.put('bar', 1)).to.throw(OverflowException);
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('offer', () => {
    it('should return undefined if key is newly added', () => {
      const map = new LinkedHashMap();
      expect(map.offer('foo', 4)).to.deep.equal({ accepted: true });
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(4);
    });
    it('should return the old value if key already present', () => {
      const map = new LinkedHashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.offer('foo', 2)).to.deep.equal({ accepted: true, previous: 4 });
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(2);
    });

    it('should return false if offering a new element and map is full', () => {
      const map = LinkedHashMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.put('foo', 2)).equal(1);
      expect(map.offer('bar', 1)).to.deep.equal({ accepted: false });
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new LinkedHashMap();
      a.put('foo', 1);
      const b = a.clone();
      expect(collectKeys(b)).to.deep.equal(collectKeys(a));
      b.put('bar', 1);
      expect(b.size()).equal(2);
      expect(a.size()).equal(1);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const map = LinkedHashMap.create({ capacity: 3 });
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
      const map = new LinkedHashMap();
      expect(map.containsKey('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new LinkedHashMap();
      map.put('foo', 1);
      expect(map.containsKey('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new LinkedHashMap();
      map.put('foo', 1);
      expect(map.containsKey('foo')).to.be.true;
    });
  });

  describe('containsValue', () => {
    it('should return false on empty map', () => {
      const map = new LinkedHashMap();
      expect(map.containsValue('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new LinkedHashMap();
      map.put('foo', 1);
      expect(map.containsValue('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new LinkedHashMap();
      map.put('foo', 1);
      expect(map.containsValue(1)).to.be.true;
    });
  });

  describe('remove', () => {
    it('should return undefined on empty map', () => {
      const map = new LinkedHashMap();
      expect(map.remove('foo')).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
      expect(map.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const map = new LinkedHashMap();
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.remove('bar')).to.be.undefined;
      expect(map.isEmpty()).to.be.false;
      expect(map.size()).equal(1);
      expect(map.remove('foo')).to.equal(1);
    });
  });

  describe('filterKeys', () => {
    it('should remove keys not matching predicate', () => {
      const map = new LinkedHashMap<string, number>();
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
      const map = new LinkedHashMap<string, number>();
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

  describe('transformValues', () => {
    it('should double all values', () => {
      const map = new LinkedHashMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      map.transformValues(v => v * 2);
      expect(map.size()).to.equal(3);
      expect(map.get('foo')).equal(2);
      expect(map.get('bar')).equal(4);
      expect(map.get('foobar')).equal(6);
    });
  });

  describe('mapValues', () => {
    it('should create a new Map with a double of the values', () => {
      const m = new LinkedHashMap<string, number>();
      m.put('foo', 1);
      m.put('bar', 2);
      m.put('foobar', 3);
      const m2 = m.mapValues(v => v * 2);
      expect(m2.size()).to.equal(3);
      expect(m2.get('foo')).equal(2);
      expect(m2.get('bar')).equal(4);
      expect(m2.get('foobar')).equal(6);
      expect(m2.equals(m)).to.be.false;
      expect(m2.constructor).equals(m.constructor);
    });
  });

  describe('replaceValueIf', () => {
    it('should double all values associated with a key longer than 3', () => {
      const map = new LinkedHashMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      map.replaceValueIf(
        ([k, _]) => k.length > 3,
        v => v * 2
      );
      expect(map.size()).to.equal(3);
      expect(map.get('foo')).equal(1);
      expect(map.get('bar')).equal(2);
      expect(map.get('foobar')).equal(6);
    });
  });

  describe('toJSON', () => {
    it('should return the JSON string', () => {
      const map = LinkedHashMap.create({
        initial: [
          ['a', 1],
          ['b', 2],
        ] as Array<[string, number]>,
      });
      expect(map.toJSON()).equal('{"a":1,"b":2}');
    });
  });

  describe('overflowHandler', () => {
    const initialMap = new LinkedHashMap();
    initialMap.put('a', 1);
    initialMap.put('b', 2);
    it('should remove the first alement', () => {
      const map = LinkedHashMap.create({
        capacity: 2,
        overflowStrategy: OverflowStrategy.REMOVE_LEAST_RECENT,
        initial: initialMap,
      });
      map.put('c', 3);
      const map2 = LinkedHashMap.create({
        initial: [
          ['b', 2],
          ['c', 3],
        ] as [string, number][],
      });
      expect(map.equals(map2)).to.be.true;
    });
    it('should remove the last alement', () => {
      const map = LinkedHashMap.create({
        capacity: 2,
        overflowStrategy: OverflowStrategy.REMOVE_MOST_RECENT,
        initial: initialMap,
      });
      map.put('c', 3);
      const map2 = LinkedHashMap.create({
        initial: [
          ['a', 1],
          ['c', 3],
        ] as [string, number][],
      });
      expect(map.equals(map2)).to.be.true;
    });
    it('should discard the element inserted', () => {
      const map = LinkedHashMap.create({
        capacity: 2,
        overflowStrategy: OverflowStrategy.DISCARD,
        initial: initialMap,
      });
      expect(map.put('c', 3)).to.be.undefined;
      expect(map.equals(initialMap)).to.be.true;
    });
  });
});
