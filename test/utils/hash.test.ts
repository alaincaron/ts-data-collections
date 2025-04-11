import { expect } from 'chai';
import {
  Cyrb53HashFunction,
  FNV1a32HashFunction,
  Funnel,
  hashAny,
  hashIterableOrdered,
  hashIterableUnordered,
  PrimitiveSink,
} from '../../src';

describe('Hash Utils', () => {
  describe('hashAny', () => {
    it('should hash primitives consistently', () => {
      // Test null and undefined
      expect(hashAny(null)).to.equal(0);
      expect(hashAny(undefined)).to.equal(0);

      // Test numbers
      const num = 42;
      expect(hashAny(num)).to.be.a('number');
      expect(hashAny(num)).to.equal(hashAny(num)); // Consistent hashing

      // Test strings
      const str = 'test string';
      expect(hashAny(str)).to.be.a('number');
      expect(hashAny(str)).to.equal(hashAny(str)); // Consistent hashing

      // Test booleans
      expect(hashAny(true)).to.be.a('number');
      expect(hashAny(true)).to.equal(hashAny(true));
      expect(hashAny(false)).to.not.equal(hashAny(true));

      // Test bigint
      const bigNum = BigInt(42);
      expect(hashAny(bigNum)).to.be.a('number');
      expect(hashAny(bigNum)).to.equal(hashAny(bigNum));
    });

    it('should hash arrays and buffers', () => {
      // Test arrays
      const arr = [1, 2, 3];
      expect(hashAny(arr)).to.be.a('number');
      expect(hashAny(arr)).to.equal(hashAny(arr));

      // Test typed arrays
      const uint8Array = new Uint8Array([1, 2, 3]);
      expect(hashAny(uint8Array)).to.be.a('number');
      expect(hashAny(uint8Array)).to.equal(hashAny(uint8Array));

      // Test ArrayBuffer
      const arrayBuffer = new ArrayBuffer(3);
      const view = new DataView(arrayBuffer);
      view.setUint8(0, 1);
      view.setUint8(1, 2);
      view.setUint8(2, 3);
      expect(hashAny(arrayBuffer)).to.be.a('number');
      expect(hashAny(arrayBuffer)).to.equal(hashAny(arrayBuffer));
    });

    it('should hash Set and Map consistently', () => {
      // Test Set
      const set = new Set([1, 2, 3]);
      expect(hashAny(set)).to.be.a('number');
      expect(hashAny(set)).to.equal(hashAny(set));

      // Test Map
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      expect(hashAny(map)).to.be.a('number');
      expect(hashAny(map)).to.equal(hashAny(map));
    });

    it('should hash Symbol using their toString function', () => {
      expect(hashAny(Symbol.iterator)).equal(hashAny(Symbol.iterator.toString()));
    });

    it('should hash object using hashCode method if present', () => {
      class Toto {
        hashCode() {
          return 5;
        }
      }
      const x = new Toto();
      expect(hashAny(x)).equal(x.hashCode());
    });

    it('should hash object using toSink if present', () => {
      class Toto {
        toSink(sink: PrimitiveSink) {
          sink.putNumber(5);
          sink.putString('foobar');
        }
      }
      const x = new Toto();
      expect(hashAny(x)).equal(
        FNV1a32HashFunction.instance()
          .hashObject(x, (x, sink) => x.toSink(sink))
          .asNumber()
      );
    });
  });

  describe('hashIterableOrdered', () => {
    it('should maintain order sensitivity', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [3, 2, 1];
      const hash1 = hashIterableOrdered(arr1);
      const hash2 = hashIterableOrdered(arr2);
      expect(hash1).to.not.equal(hash2);
    });

    it('should be consistent for same ordered input', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(hashIterableOrdered(arr1)).to.equal(hashIterableOrdered(arr2));
    });
  });

  describe('hashIterableUnordered', () => {
    it('should be order insensitive', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [3, 2, 1];
      const hash1 = hashIterableUnordered(arr1);
      const hash2 = hashIterableUnordered(arr2);
      expect(hash1).to.equal(hash2);
    });

    it('should be consistent for same elements', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(hashIterableUnordered(arr1)).to.equal(hashIterableUnordered(arr2));
    });
  });

  describe('HashFunctions', () => {
    describe('FNV1a32HashFunction', () => {
      const fnv = FNV1a32HashFunction.instance();

      it('should hash numbers consistently', () => {
        const num = 42;
        const hash1 = fnv.hashNumber(num);
        const hash2 = fnv.hashNumber(num);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });

      it('should hash strings consistently', () => {
        const str = 'test';
        const hash1 = fnv.hashString(str);
        const hash2 = fnv.hashString(str);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });

      it('should hash objects using funnel', () => {
        interface TestObject {
          id: number;
          name: string;
        }

        const funnel: Funnel<TestObject> = (obj, sink) => {
          sink.putNumber(obj.id);
          sink.putString(obj.name);
        };

        const obj = { id: 1, name: 'test' };
        const hash1 = fnv.hashObject(obj, funnel);
        const hash2 = fnv.hashObject(obj, funnel);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });
    });

    describe('Cyrb53HashFunction', () => {
      const cyrb = Cyrb53HashFunction.instance();

      it('should hash numbers consistently', () => {
        const num = 42;
        const hash1 = cyrb.hashNumber(num);
        const hash2 = cyrb.hashNumber(num);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });

      it('should hash strings consistently', () => {
        const str = 'test';
        const hash1 = cyrb.hashString(str);
        const hash2 = cyrb.hashString(str);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });

      it('should hash objects using funnel', () => {
        interface TestObject {
          id: number;
          name: string;
        }

        const funnel: Funnel<TestObject> = (obj, sink) => {
          sink.putNumber(obj.id);
          sink.putString(obj.name);
        };

        const obj = { id: 1, name: 'test' };
        const hash1 = cyrb.hashObject(obj, funnel);
        const hash2 = cyrb.hashObject(obj, funnel);
        expect(hash1.asNumber()).to.equal(hash2.asNumber());
      });
    });
  });
});
