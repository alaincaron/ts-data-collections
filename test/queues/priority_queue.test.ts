import { expect } from 'chai';
import { Generators } from 'ts-fluent-iterators';
import { OverflowException, PriorityQueue, UnderflowException } from '../../src';

function isHeap<E>(items: E[]): boolean {
  let parent = 0;
  for (;;) {
    const left = (parent << 1) + 1;
    if (left >= items.length) return true;
    if (items[parent] > items[left]) return false;
    const right = left + 1;
    if (right < items.length && items[parent] > items[right]) return false;
    ++parent;
  }
}

describe('PriorityQueue', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const queue = new PriorityQueue();
      expect(queue.capacity()).equal(Infinity);
      expect(queue.size()).equal(0);
      expect(queue.remaining()).equal(Infinity);
      expect(queue.isEmpty()).to.be.true;
      expect(queue.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const queue = PriorityQueue.create({ capacity: 2 });
      expect(queue.capacity()).equal(2);
      expect(queue.size()).equal(0);
      expect(queue.remaining()).equal(2);
      expect(queue.isEmpty()).to.be.true;
      expect(queue.isFull()).to.be.false;
    });

    it('should have the same elements as the array argument', () => {
      const arr = [1, 2];
      const queue = PriorityQueue.create({ capacity: 2, initial: arr });
      expect(queue.capacity()).equal(2);
      expect(queue.size()).equal(2);
      expect(queue.remaining()).equal(0);
      expect(queue.isEmpty()).to.be.false;
      expect(queue.isFull()).to.be.true;
      expect(queue.toArray()).to.deep.equal(arr);
    });

    it('should be identical to the PriorityQueue argument', () => {
      const arr = [1, 2];
      const queue1 = PriorityQueue.create({ capacity: 3, initial: arr });
      expect(queue1.capacity()).equal(3);
      const queue2 = PriorityQueue.create({ initial: queue1 });
      expect(queue2).to.deep.equal(queue1);
      expect(queue2.capacity()).equal(3);
    });

    it('should be identical to the Collection argument', () => {
      const arr = [1, 2];
      const queue1 = PriorityQueue.create({ initial: arr });
      const queue2 = PriorityQueue.create({ initial: queue1 });
      expect(queue2.capacity()).equal(Infinity);
      expect(queue2.toArray()).to.deep.equal(arr);
    });

    it('should use the function provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i + 1);
      const queue = PriorityQueue.create({ initial: { length: arr.length, seed: i => i + 1 } });
      expect(queue.toArray()).to.deep.equal(arr);
    });

    it('should use the iterator provided in the ArrayGenerator', () => {
      const queue = PriorityQueue.create({ initial: { length: 10, seed: Generators.range() } });
      expect(queue.size()).equal(10);
      expect(queue.toArray()).to.deep.equal(Array.from({ length: 10 }, (_, i) => i));
    });

    it('should use the iterable provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i);
      const queue = PriorityQueue.create({ initial: { length: 10, seed: arr } });
      expect(queue.size()).equal(2);
      expect(queue.toArray()).to.deep.equal(arr);
    });

    it('should throw if number of inital elements exceed capacity', () => {
      expect(() => PriorityQueue.create({ capacity: 5, initial: { length: 10, seed: i => i + 1 } })).to.throw(
        OverflowException
      );
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new PriorityQueue();
      const b = a.clone();
      expect(b).to.deep.equal(a);
      b.add('foo');
      expect(b.size()).equal(1);
      expect(a.size()).equal(0);
    });
  });

  describe('ordering', () => {
    it('should remove object according to sort order', () => {
      const queue = PriorityQueue.create({ capacity: 2 });
      queue.add('foo');
      queue.add('bar');
      expect(queue.size()).equal(2);
      expect(() => queue.add('foobar')).to.throw(OverflowException);
      expect(queue.remove()).equal('bar');
      expect(queue.remove()).equal('foo');
      expect(queue.poll()).to.be.undefined;
      expect(queue.isEmpty()).to.be.true;
      expect(() => queue.remove()).to.throw(UnderflowException);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const queue = PriorityQueue.create({ capacity: 3, initial: { length: 2, seed: (i: number) => i } });
      expect(queue.size()).to.equal(2);
      expect(queue.remaining()).to.equal(1);
      queue.clear();
      expect(queue.size()).to.equal(0);
      expect(queue.remaining()).to.equal(3);
      expect(queue.toArray()).to.deep.equal([]);
    });
  });

  describe('contains', () => {
    it('should return false on empty queue', () => {
      const queue = new PriorityQueue();
      expect(queue.contains('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const queue = PriorityQueue.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(queue.contains(10)).to.be.false;
    });
    it('should return true if present', () => {
      const queue = PriorityQueue.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(queue.contains(9)).to.be.true;
    });
  });

  describe('find', () => {
    it('should return undefined on empty queue', () => {
      const queue = new PriorityQueue();
      expect(queue.find(x => x === 'foo')).to.be.undefined;
    });
    it('should return undefined if no match', () => {
      const queue = PriorityQueue.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(queue.find(x => x >= 10)).to.be.undefined;
    });
    it('should return the first item matching the predicate', () => {
      const queue = PriorityQueue.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(queue.find(x => x >= 5)).equal(5);
    });
  });

  describe('removeItem', () => {
    it('should return false on empty queue', () => {
      const queue = new PriorityQueue();
      expect(queue.removeItem(1)).to.be.false;
      expect(queue.isEmpty()).to.be.true;
      expect(queue.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const arr = [1, 2, 3];
      const queue = PriorityQueue.create({ initial: arr });
      expect(queue.removeItem(4)).to.be.false;
      expect(queue.isEmpty()).to.be.false;
      expect(queue.size()).equal(3);
    });
    it('should remove first occurence and return true if item is present', () => {
      const arr = [1, 0, 2, 0, 3];
      const queue = PriorityQueue.create({ initial: arr });
      expect(queue.removeItem(0)).to.be.true;
      expect(queue.isEmpty()).to.be.false;
      expect(queue.size()).equal(4);
      expect(isHeap(queue.toArray())).to.be.true;
      expect(Array.from(queue.drain())).to.deep.equal([0, 1, 2, 3]);
      expect(queue.isEmpty()).to.be.true;
    });
  });

  describe('filter', () => {
    it('should return 0 on empty queue', () => {
      const queue = new PriorityQueue();
      expect(queue.filter(i => i === 0)).equal(0);
      expect(queue.isEmpty()).to.be.true;
      expect(queue.size()).equal(0);
    });

    it('should return 0 if all items match the predicate', () => {
      const arr = [1, 2, 3];
      const queue = PriorityQueue.create({ initial: arr });
      expect(queue.filter(i => i > 0)).equal(0);
      expect(queue.isEmpty()).to.be.false;
      expect(queue.size()).equal(3);
    });
    it('should remove all items not matching the filter', () => {
      const arr = [1, 0, 2, -1, 3];
      const queue = PriorityQueue.create({ initial: arr });
      expect(queue.filter(i => i > 0)).equal(2);
      expect(queue.isEmpty()).to.be.false;
      expect(queue.size()).equal(3);
      expect(isHeap(queue.toArray())).to.be.true;
      expect(Array.from(queue.drain())).to.deep.equal([1, 2, 3]);
      expect(queue.isEmpty()).to.be.true;
    });
  });

  describe('offerFully', () => {
    it('should refuse all the items if not enough capacity remaining', () => {
      const queue = PriorityQueue.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(queue.offerFully(data)).equal(0);
      expect(queue.isEmpty()).to.be.true;
      expect(queue.offerFully(PriorityQueue.create({ initial: data }))).equal(0);
      expect(queue.isEmpty()).to.be.true;
    });
    it('should accept all items if enough capacity remaining', () => {
      const queue = PriorityQueue.create({ capacity: 6 });
      const data = [1, 2, 3];
      expect(queue.offerFully(data)).equal(3);
      expect(queue.size()).equal(3);
      expect(queue.offerFully(PriorityQueue.create({ initial: data }))).equal(3);
      expect(queue.size()).equal(6);
    });
  });

  describe('offerPartially', () => {
    it('should accept elements up to the remaining capacity', () => {
      const queue = PriorityQueue.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(queue.offerPartially(data)).equal(2);
      expect(queue.toArray()).to.deep.equal([1, 2]);
      queue.clear();
      expect(queue.offerPartially(PriorityQueue.create({ initial: data }))).equal(2);
      expect(queue.toArray()).to.deep.equal([1, 2]);
    });
    it('should accept all items if enough capacity remaining', () => {
      const queue = PriorityQueue.create({ capacity: 6 });
      const data = [1, 2, 3];
      expect(queue.offerPartially(data)).equal(3);
      expect(queue.size()).equal(3);
      expect(queue.offerPartially(PriorityQueue.create({ initial: data }))).equal(3);
      expect(queue.size()).equal(6);
    });
  });

  describe('equals/hashCode', () => {
    it('should return true for same queue', () => {
      const queue = PriorityQueue.create({ initial: [1, 2] });
      expect(queue.equals(queue)).to.be.true;
      const cl = queue.clone();
      expect(queue.equals(cl)).to.be.false;
      expect(queue.hashCode() === cl.hashCode());
    });
  });
});
