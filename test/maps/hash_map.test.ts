import { expect } from 'chai';
import { HashMap, OverflowException } from '../../src';

describe('HashMap', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const map = new HashMap();
      expect(map.capacity()).equal(Infinity);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(Infinity);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const map = HashMap.create({ capacity: 2 });
      expect(map.capacity()).equal(2);
      expect(map.size()).equal(0);
      expect(map.remaining()).equal(2);
      expect(map.isEmpty()).to.be.true;
      expect(map.isFull()).to.be.false;
    });

    it('should initialize with the provided Map', () => {
      const map = HashMap.create({ initial: new Map().set('a', 1).set('b', 2) });
      expect(map.size()).equal(2);
      expect(map.get('a')).equal(1);
      expect(map.get('b')).equal(2);
    });

    it('should initialize with the provided IMap', () => {
      const map1 = new HashMap();
      map1.put('a', 1);
      map1.put('b', 2);
      const map = HashMap.create({ initial: map1 });
      expect(map.size()).equal(2);
      expect(map.get('a')).equal(1);
      expect(map.get('b')).equal(2);
    });

    it('should initialize with the provided Iterable', () => {
      const map = HashMap.create({
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
      const map = new HashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(4);
    });
    it('should return the old value if key already present', () => {
      const map = new HashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.put('foo', 2)).equal(4);
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(2);
    });

    it('should throw if adding a new element and map is full', () => {
      const map = HashMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.put('foo', 2)).equal(1);
      expect(() => map.put('bar', 1)).to.throw(OverflowException);
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('offer', () => {
    it('should return undefined if key is newly added', () => {
      const map = new HashMap();
      expect(map.offer('foo', 4)).to.deep.equal({ accepted: true });
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(4);
    });
    it('should return the old value if key already present', () => {
      const map = new HashMap();
      expect(map.put('foo', 4)).to.be.undefined;
      expect(map.offer('foo', 2)).to.deep.equal({ accepted: true, previous: 4 });
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(2);
    });

    it('should return false if offering a new element and map is full', () => {
      const map = HashMap.create({ capacity: 1 });
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.put('foo', 2)).equal(1);
      expect(map.offer('bar', 1)).to.deep.equal({ accepted: false });
      expect(map.isFull()).to.be.true;
      expect(map.size()).equal(1);
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new HashMap();
      a.put('foo', 1);
      const b = a.clone();
      expect(b).to.deep.equal(a);
      b.put('bar', 1);
      expect(b.size()).equal(2);
      expect(a.size()).equal(1);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const map = HashMap.create({ capacity: 3 });
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
      const map = new HashMap();
      expect(map.containsKey('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new HashMap();
      map.put('foo', 1);
      expect(map.containsKey('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new HashMap();
      map.put('foo', 1);
      expect(map.containsKey('foo')).to.be.true;
    });
  });

  describe('containsValue', () => {
    it('should return false on empty map', () => {
      const map = new HashMap();
      expect(map.containsValue('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const map = new HashMap();
      map.put('foo', 1);
      expect(map.containsValue('bar')).to.be.false;
    });
    it('should return true if present', () => {
      const map = new HashMap();
      map.put('foo', 1);
      expect(map.containsValue(1)).to.be.true;
    });
  });

  describe('remove', () => {
    it('should return undefined on empty map', () => {
      const map = new HashMap();
      expect(map.remove('foo')).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
      expect(map.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const map = new HashMap();
      expect(map.put('foo', 1)).to.be.undefined;
      expect(map.remove('bar')).to.be.undefined;
      expect(map.isEmpty()).to.be.false;
      expect(map.size()).equal(1);
      expect(map.remove('foo')).to.equal(1);
    });
  });

  describe('filterKeys', () => {
    it('should remove keys not matching predicate', () => {
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
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
    it('should create a Map with a double of the values', () => {
      const m = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      map.replaceValueIf(
        (k, _) => k.length > 3,
        (_, v) => v * 2
      );
      expect(map.size()).to.equal(3);
      expect(map.get('foo')).equal(1);
      expect(map.get('bar')).equal(2);
      expect(map.get('foobar')).equal(6);
    });
  });

  describe('non-primitive-types', () => {
    it('should handle objects', () => {
      const map = new HashMap();
      map.put({ a: 5 }, 'foo');
      expect(map.get({ a: 5 })).equal('foo');
      expect(map.put({ a: 5 }, 'bar')).equal('foo');
      expect(map.get({ a: 5 })).equal('bar');
      expect(map.get({ a: 6 })).to.be.undefined;
      expect(map.size()).equals(1);
    });
  });

  describe('putIfAbsent', () => {
    it('should return the value present in the map', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 12);
      expect(map.putIfAbsent('foo', 25)).equal(12);
      expect(map.get('foo')).equal(12);
      expect(map.size()).equal(1);
    });
    it('should put the value if not present in the map', () => {
      const map = new HashMap<string, number>();
      expect(map.putIfAbsent('bar', 25)).to.be.undefined;
      expect(map.get('bar')).equal(25);
      expect(map.size()).equal(1);
    });
  });

  describe('replace', () => {
    it('should replace existing value for existing key', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 5);
      expect(map.replace('foo', 4)).equal(5);
      expect(map.get('foo')).equal(4);
      expect(map.size()).equal(1);
    });
    it('should not modify non existing key', () => {
      const map = new HashMap<string, number>();
      expect(map.replace('bar', 4)).to.be.undefined;
      expect(map.get('bar')).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
    });
  });

  describe('replaceValue', () => {
    it('should replace value for existing key with matching value', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 5);
      expect(map.replaceValue('foo', 5, 4)).to.be.true;
      expect(map.get('foo')).equal(4);
      expect(map.size()).equal(1);
    });
    it('should not modify for existing key with non-matching value', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 5);
      expect(map.replaceValue('foo', 6, 4)).to.be.false;
      expect(map.get('foo')).equal(5);
      expect(map.size()).equal(1);
    });
    it('should not modify non existing key', () => {
      const map = new HashMap<string, number>();
      expect(map.replaceValue('bar', 4, 6)).to.be.false;
      expect(map.get('bar')).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
    });
  });

  describe('replaceAll', () => {
    it('should double all values', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 1);
      map.put('bar', 2);
      map.put('foobar', 3);
      map.replaceAll((_, v) => v * 2);
      expect(map.size()).to.equal(3);
      expect(map.get('foo')).equal(2);
      expect(map.get('bar')).equal(4);
      expect(map.get('foobar')).equal(6);
    });
  });

  describe('computeIfAbsent', () => {
    it('should use the mapper to create a missing mapping', () => {
      const map = new HashMap<string, number>();
      expect(map.computeIfAbsent('foo', _ => 0)).equal(0);
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(0);
    });

    it('should ignore use the result of the mapper returns null/undefined', () => {
      const map = new HashMap<string, number>();
      expect(map.computeIfAbsent('foo', _ => undefined)).to.be.undefined;
      expect(map.size()).equal(0);
      expect(map.computeIfAbsent('foo', _ => null)).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
    });
    it('should ignore the mapper if the key is present', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 12);
      expect(map.computeIfAbsent('foo', () => 0)).equal(12);
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(12);
    });
  });

  describe('computeIfPresent', () => {
    it('should ignpore the mapper if missing key', () => {
      const map = new HashMap<string, number>();
      expect(map.computeIfPresent('foo', _ => 0)).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
    });
    it('should remove the key if mapper returns undefined', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 15);
      expect(map.computeIfPresent('foo', _ => undefined)).to.be.undefined;
      expect(map.isEmpty()).to.be.true;
    });
    it('should remove the key if mapper returns null', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 15);
      expect(map.computeIfPresent('foo', _ => null)).to.be.undefined;
      expect(map.size()).equal(0);
    });
    it('should update the value with resulve of mapper', () => {
      const map = new HashMap<string, number>();
      map.put('foo', 12);
      expect(map.computeIfPresent('foo', () => 0)).equal(0);
      expect(map.size()).equal(1);
      expect(map.get('foo')).equal(0);
    });
  });
});
