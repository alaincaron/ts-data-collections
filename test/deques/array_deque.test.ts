import { expect } from 'chai';
import { Generators } from 'ts-fluent-iterators';
import { ArrayDeque, OverflowException, UnderflowException } from '../../src';

describe('ArrayDeque', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const deque = new ArrayDeque();
      expect(deque.capacity()).equal(Infinity);
      expect(deque.size()).equal(0);
      expect(deque.remaining()).equal(Infinity);
      expect(deque.isEmpty()).to.be.true;
      expect(deque.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      expect(deque.capacity()).equal(2);
      expect(deque.size()).equal(0);
      expect(deque.remaining()).equal(2);
      expect(deque.isEmpty()).to.be.true;
      expect(deque.isFull()).to.be.false;
    });

    it('should have the same elements as the array argument', () => {
      const arr = [1, 2];
      const deque = ArrayDeque.create({ capacity: 2, initial: arr });
      expect(deque.capacity()).equal(2);
      expect(deque.size()).equal(2);
      expect(deque.remaining()).equal(0);
      expect(deque.isEmpty()).to.be.false;
      expect(deque.isFull()).to.be.true;
      expect(deque.toArray()).to.deep.equal(arr);
    });

    it('should be identical to the ArrayDeque argument', () => {
      const arr = [1, 2];
      const deque1 = ArrayDeque.create({ capacity: 3, initial: arr });
      expect(deque1.capacity()).equal(3);
      const deque2 = ArrayDeque.create({ initial: deque1 });
      expect(deque2).to.deep.equal(deque1);
      expect(deque2.capacity()).equal(3);
    });

    it('should be identical to the Collection argument', () => {
      const arr = [1, 2];
      const deque1 = ArrayDeque.create({ initial: arr });
      const deque2 = ArrayDeque.create({ initial: deque1 });
      expect(deque2.capacity()).equal(Infinity);
      expect(deque2.toArray()).to.deep.equal(arr);
    });

    it('should use the function provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i + 1);
      const deque = ArrayDeque.create({ initial: { length: arr.length, seed: i => i + 1 } });
      expect(deque.toArray()).to.deep.equal(arr);
    });

    it('should use the iterator provided in the ArrayGenerator', () => {
      const deque = ArrayDeque.create({ initial: { length: 10, seed: Generators.range() } });
      expect(deque.size()).equal(10);
      expect(deque.toArray()).to.deep.equal(Array.from({ length: 10 }, (_, i) => i));
    });

    it('should use the iterable provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i);
      const deque = ArrayDeque.create({ initial: { length: 10, seed: arr } });
      expect(deque.size()).equal(2);
      expect(deque.toArray()).to.deep.equal(arr);
    });

    it('should throw if number of initial elements exceed capacity', () => {
      expect(() => ArrayDeque.create({ capacity: 0, initial: { length: 10, seed: i => i + 1 } })).to.throw(
        OverflowException
      );
    });

    it('should use the specified capacity as per options with overwrite strategy', () => {
      const deque = ArrayDeque.create({ capacity: 2, overflowStrategy: 'overwrite' });
      expect(deque.overflowStrategy()).equal('overwrite');
      expect(deque.capacity()).equal(2);
      expect(deque.isEmpty()).to.be.true;
    });

    it('should have the same elements as the array argument with overwrite strategy', () => {
      const arr = [1, 2];
      const deque = ArrayDeque.create({ capacity: 2, initial: arr, overflowStrategy: 'overwrite' });
      expect(deque.overflowStrategy()).equal('overwrite');
      expect(deque.capacity()).equal(2);
      expect(deque.size()).equal(2);
      expect(deque.remaining()).equal(0);
      expect(deque.isEmpty()).to.be.false;
      expect(deque.isFull()).to.be.true;
      expect(deque.toArray()).to.deep.equal(arr);
    });

    it('should be identical to the Collection argument with overwrite strategy', () => {
      const arr = [1, 2];
      const deque1 = ArrayDeque.create({ initial: arr, overflowStrategy: 'throw' });
      const deque2 = ArrayDeque.create({ initial: deque1, overflowStrategy: 'overwrite' });
      expect(deque1.overflowStrategy()).equal('throw');
      expect(deque2.overflowStrategy()).equal('overwrite');
      expect(deque2.capacity()).equal(Infinity);
      expect(deque2.toArray()).to.deep.equal(arr);
    });

    it('should use the function provided in the ArrayGenerator with overwrite strategy', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i + 1);
      const deque = ArrayDeque.create({
        initial: { length: arr.length, seed: i => i + 1 },
        overflowStrategy: 'overwrite',
      });
      expect(deque.overflowStrategy()).equal('overwrite');
      expect(deque.toArray()).to.deep.equal(arr);
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new ArrayDeque();
      const b = a.clone();
      expect(b).to.deep.equal(a);
      expect(b.overflowStrategy()).equal('throw');
      b.add('foo');
      expect(b.size()).equal(1);
      expect(a.size()).equal(0);
    });

    it('should create a deep equal copy with overwrite strategy', () => {
      const a = new ArrayDeque({ overflowStrategy: 'overwrite' });
      const b = a.clone();
      expect(b).to.deep.equal(a);
      expect(b.overflowStrategy()).equal('overwrite');
      b.add('foo');
      expect(b.size()).equal(1);
      expect(a.size()).equal(0);
    });
  });

  describe('FIFO', () => {
    it('should behave as a FIFO with standard methods', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      deque.add('foo');
      deque.add('bar');
      expect(deque.size()).equal(2);
      expect(() => deque.add('foobar')).to.throw(OverflowException);
      expect(deque.remove()).equal('foo');
      expect(deque.remove()).equal('bar');
      expect(deque.poll()).to.be.undefined;
      expect(deque.isEmpty()).to.be.true;
      expect(() => deque.remove()).to.throw(UnderflowException);
    });
    it('should behave as a FIFO with addFirst/removeLast', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      expect(deque.addFirst('foo').addFirst('bar').size()).equal(2);
      expect(() => deque.addFirst('foobar')).to.throw(OverflowException);
      expect(deque.removeLast()).equal('foo');
      expect(deque.removeLast()).equal('bar');
      expect(deque.pollLast()).to.be.undefined;
      expect(deque.isEmpty()).to.be.true;
      expect(() => deque.removeLast()).to.throw(UnderflowException);
    });
    it('should behave as a FIFO with addLast/removeFirst', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      expect(deque.addLast('foo').addLast('bar').size()).equal(2);
      expect(() => deque.addLast('foobar')).to.throw(OverflowException);
      expect(deque.removeFirst()).equal('foo');
      expect(deque.removeFirst()).equal('bar');
      expect(deque.pollFirst()).to.be.undefined;
      expect(deque.isEmpty()).to.be.true;
      expect(() => deque.removeFirst()).to.throw(UnderflowException);
    });

    it('should overwrite if overflow', () => {
      const deque = ArrayDeque.create({ capacity: 2, overflowStrategy: 'overwrite' });
      expect(deque.overflowStrategy()).equal('overwrite');
      expect(deque.add('foo')).equal(true);
      expect(deque.add('bar')).equal(true);
      expect(deque.size()).equal(2);
      deque.add('foobar');
      expect(deque.size()).equal(2);
      expect(deque.remove()).equal('bar');
      expect(deque.remove()).equal('foobar');
      expect(deque.poll()).to.be.undefined;
      expect(deque.isEmpty()).to.be.true;
      expect(() => deque.remove()).to.throw(UnderflowException);
    });
  });

  describe('LIFO', () => {
    it('can be used as a Stack with addLast/removeLast', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      expect(deque.addLast('foo').addLast('bar').size()).equal(2);
      expect(() => deque.addLast('foobar')).to.throw(OverflowException);
      expect(deque.removeLast()).equal('bar');
      expect(deque.removeLast()).equal('foo');
      expect(deque.pollLast()).to.be.undefined;
      expect(() => deque.removeLast()).to.throw(UnderflowException);
    });
    it('can be used as a Stack with addFirst/removeFirst', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      expect(deque.addFirst('foo').addFirst('bar').size()).equal(2);
      expect(() => deque.addFirst('foobar')).to.throw(OverflowException);
      expect(deque.removeFirst()).equal('bar');
      expect(deque.removeFirst()).equal('foo');
      expect(deque.pollFirst()).to.be.undefined;
      expect(() => deque.removeFirst()).to.throw(UnderflowException);
    });

    it('should overwrite first if overflow', () => {
      const deque = ArrayDeque.create({ capacity: 2, overflowStrategy: 'overwrite' });
      expect(deque.overflowStrategy()).equal('overwrite');
      expect(deque.add('foo')).equal(true);
      expect(deque.add('bar')).equal(true);
      expect(deque.size()).equal(2);
      expect(deque.addFirst('foobar').size()).equal(2);
      expect(deque.remove()).equal('foobar');
      expect(deque.remove()).equal('bar');
      expect(deque.poll()).to.be.undefined;
      expect(deque.isEmpty()).to.be.true;
      expect(() => deque.remove()).to.throw(UnderflowException);
    });
  });

  describe('offerFirst', () => {
    it('should add item on an empty list', () => {
      const deque = new ArrayDeque();
      expect(deque.offerFirst('foo')).equal(true);
      expect(deque.size()).equal(1);
      expect(deque.peekFirst()).equal('foo');
      expect(deque.peekLast()).equal('foo');
    });
    it('should return false if capacity is reached', () => {
      const deque = ArrayDeque.create({ capacity: 1 });
      expect(deque.offerFirst('foo')).equal(true);
      expect(deque.isFull()).equal(true);
      expect(deque.offerFirst('bar')).equal(false);
      expect(deque.size()).equal(1);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const deque = ArrayDeque.create({ capacity: 3, initial: { length: 2, seed: (i: number) => i } });
      expect(deque.size()).to.equal(2);
      expect(deque.remaining()).to.equal(1);
      deque.clear();
      expect(deque.size()).to.equal(0);
      expect(deque.remaining()).to.equal(3);
      expect(deque.toArray()).to.deep.equal([]);
    });
  });

  describe('contains', () => {
    it('should return false on empty deque', () => {
      const deque = new ArrayDeque();
      expect(deque.contains('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const deque = ArrayDeque.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(deque.contains(10)).to.be.false;
    });
    it('should return true if present', () => {
      const deque = ArrayDeque.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(deque.contains(9)).to.be.true;
    });
  });

  describe('find', () => {
    it('should return undefined on empty deque', () => {
      const deque = new ArrayDeque();
      expect(deque.find(x => x === 'foo')).to.be.undefined;
    });
    it('should return undefined if no match', () => {
      const deque = ArrayDeque.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(deque.find(x => x >= 10)).to.be.undefined;
    });
    it('should return the first item matching the predicate', () => {
      const deque = ArrayDeque.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(deque.find(x => x >= 5)).equal(5);
    });
  });

  describe('removeItem', () => {
    it('should return false on empty deque', () => {
      const deque = new ArrayDeque();
      expect(deque.removeItem(1)).to.be.false;
      expect(deque.isEmpty()).to.be.true;
      expect(deque.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const arr = [1, 2, 3];
      const deque = ArrayDeque.create({ initial: arr });
      expect(deque.removeItem(4)).to.be.false;
      expect(deque.isEmpty()).to.be.false;
      expect(deque.size()).equal(3);
    });
    it('should remove first occurrence and return true if item is present', () => {
      const arr = [1, 0, 2, 0, 3];
      const deque = ArrayDeque.create({ initial: arr });
      expect(deque.removeItem(0)).to.be.true;
      expect(deque.isEmpty()).to.be.false;
      expect(deque.size()).equal(4);
      expect(deque.toArray()).deep.equal([1, 2, 0, 3]);
    });
  });

  describe('filter', () => {
    it('should return 0 on empty deque', () => {
      const deque = new ArrayDeque();
      expect(deque.filter(i => i === 0)).equal(0);
      expect(deque.isEmpty()).to.be.true;
      expect(deque.size()).equal(0);
    });

    it('should return 0 if all items match the predicate', () => {
      const arr = [1, 2, 3];
      const deque = ArrayDeque.create({ initial: arr });
      expect(deque.filter(i => i > 0)).equal(0);
      expect(deque.isEmpty()).to.be.false;
      expect(deque.size()).equal(3);
    });
    it('should remove all items not matching the filter', () => {
      const arr = [1, 0, 2, -1, 3];
      const deque = ArrayDeque.create({ initial: arr });
      expect(deque.filter(i => i > 0)).equal(2);
      expect(deque.isEmpty()).to.be.false;
      expect(deque.size()).equal(3);
      expect(deque.toArray()).deep.equal([1, 2, 3]);
    });
  });

  describe('grow deque as necessary', () => {
    it('with add/remove', () => {
      const deque = new ArrayDeque();
      for (let i = 0; i < 8; ++i) deque.add(i);
      for (let i = 0; i < 4; ++i) {
        expect(deque.remove()).equal(i);
      }
      for (let i = 8; i < 50; ++i) deque.add(i);
      for (let i = 4; i < 50; ++i) {
        expect(deque.remove()).equals(i);
      }
      expect(deque.isEmpty()).to.be.true;
    });
    it('with addLast/removeFirst', () => {
      const deque = new ArrayDeque();
      for (let i = 0; i < 8; ++i) deque.addLast(i);
      for (let i = 0; i < 4; ++i) {
        expect(deque.removeFirst()).equal(i);
      }
      for (let i = 8; i < 50; ++i) deque.addLast(i);
      for (let i = 4; i < 50; ++i) {
        expect(deque.removeFirst()).equals(i);
      }
      expect(deque.isEmpty()).to.be.true;
    });

    it('with addFirst/removeLast', () => {
      const deque = new ArrayDeque();
      for (let i = 0; i < 8; ++i) deque.addFirst(i);
      for (let i = 0; i < 4; ++i) {
        expect(deque.removeLast()).equal(i);
      }
      for (let i = 8; i < 50; ++i) deque.addFirst(i);
      for (let i = 4; i < 50; ++i) {
        expect(deque.removeLast()).equals(i);
      }
      expect(deque.isEmpty()).to.be.true;
    });
  });

  describe('offerFully', () => {
    it('should refuse all the items if not enough capacity remaining', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(deque.offerFully(data)).equal(0);
      expect(deque.isEmpty()).to.be.true;
      expect(deque.offerFully(ArrayDeque.create({ initial: data }))).equal(0);
      expect(deque.isEmpty()).to.be.true;
    });
    it('should accept all items if enough capacity remaining', () => {
      const deque = ArrayDeque.create({ capacity: 6 });
      const data = [1, 2, 3];
      expect(deque.offerFully(data)).equal(3);
      expect(deque.size()).equal(3);
      expect(deque.offerFully(ArrayDeque.create({ initial: data }))).equal(3);
      expect(deque.size()).equal(6);
    });
    it("should refuse the items even if overflowStrategy is overwrite if we can't free enough room", () => {
      const deque = ArrayDeque.create({ capacity: 2, overflowStrategy: 'overwrite' });
      const data = [1, 2, 3];
      expect(deque.offerFully(data)).equal(0);
      expect(deque.size()).equal(0);
    });
    it('should accept all items if enough capacity remaining with overflowStrategy set to overwrite', () => {
      const deque = ArrayDeque.create({ capacity: 6, overflowStrategy: 'overwrite' });
      const data = [1, 2, 3];
      expect(deque.offerFully(data)).equal(3);
      expect(deque.size()).equal(3);
      expect(deque.offerFully(ArrayDeque.create({ initial: data }))).equal(3);
      expect(deque.size()).equal(6);
      expect(deque.toArray()).to.deep.equal([...data, ...data]);
    });
  });

  describe('offerPartially', () => {
    it('should accept elements up to the remaining capacity', () => {
      const deque = ArrayDeque.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(deque.offerPartially(data)).equal(2);
      expect(deque.toArray()).to.deep.equal([1, 2]);
      deque.clear();
      expect(deque.offerPartially(ArrayDeque.create({ initial: data }))).equal(2);
      expect(deque.toArray()).to.deep.equal([1, 2]);
    });
    it('should accept all items if enough capacity remaining', () => {
      const deque = ArrayDeque.create({ capacity: 6 });
      const data = [1, 2, 3];
      expect(deque.offerPartially(data)).equal(3);
      expect(deque.size()).equal(3);
      expect(deque.offerPartially(ArrayDeque.create({ initial: data }))).equal(3);
      expect(deque.size()).equal(6);
    });
    it('should accept only elements as up to the capacity and overwrite', () => {
      const deque = ArrayDeque.create({ capacity: 2, overflowStrategy: 'overwrite' });
      const data = [1, 2, 3];
      expect(deque.offerPartially(data)).equal(2);
      expect(deque.toArray()).to.deep.equal([1, 2]);
    });
    it('should accept all items', () => {
      const deque = ArrayDeque.create({ capacity: 6, overflowStrategy: 'overwrite' });
      const data = [1, 2, 3];
      expect(deque.offerPartially(data)).equal(3);
      expect(deque.size()).equal(3);
      expect(deque.offerPartially(ArrayDeque.create({ initial: data }))).equal(3);
      expect(deque.size()).equal(6);
    });
  });

  describe('getFirst', () => {
    it('should return the first element on a non-empty list', () => {
      const deque = ArrayDeque.create({ initial: [2, 4, 1] });
      expect(deque.getFirst()).equal(2);
      expect(deque.size()).equal(3);
    });
    it('should throw on an empty list', () => {
      const deque = new ArrayDeque();
      expect(() => deque.getFirst()).to.throw(UnderflowException);
    });
  });

  describe('getLast', () => {
    it('should return the last element on a non-empty list', () => {
      const deque = ArrayDeque.create({ initial: [2, 4, 1] });
      expect(deque.getLast()).equal(1);
      expect(deque.size()).equal(3);
    });
    it('should throw on an empty list', () => {
      const deque = new ArrayDeque();
      expect(() => deque.getLast()).to.throw(UnderflowException);
    });
  });

  describe('removeFirstOccurrence', () => {
    it('should remove the first occurrence only', () => {
      const deque = ArrayDeque.create({ initial: [1, 3, 2, 3] });
      expect(deque.removeFirstOccurrence(3)).to.be.true;
      expect(deque.toArray()).to.deep.equal([1, 2, 3]);
    });
    it('should not remove any element if not present', () => {
      const deque = ArrayDeque.create({ initial: [1, 2, 3] });
      expect(deque.removeFirstOccurrence(4)).to.be.false;
      expect(deque.toArray()).to.deep.equal([1, 2, 3]);
    });
  });

  describe('removeLastOccurrence', () => {
    it('should remove the last occurrence only', () => {
      const deque = ArrayDeque.create({ initial: [1, 2, 3, 2] });
      expect(deque.removeLastOccurrence(2)).to.be.true;
      expect(deque.toArray()).to.deep.equal([1, 2, 3]);
    });
    it('should not remove any element if not present', () => {
      const deque = ArrayDeque.create({ initial: [1, 2, 3] });
      expect(deque.removeLastOccurrence(4)).to.be.false;
      expect(deque.toArray()).to.deep.equal([1, 2, 3]);
    });
  });

  describe('resize', () => {
    function getInternalSize<E>(deque: ArrayDeque<E>) {
      const buffer = (deque as any).buffer;
      return buffer.length;
    }
    it('should not modify the length of internal array is newSize not greater  than current size', () => {
      const deque = ArrayDeque.create({ initial: [1, 2, 3, 2] });
      const initialLen = getInternalSize(deque);
      deque.resize(deque.size() - 1);
      expect(getInternalSize(deque)).equal(initialLen);
      expect(deque.toArray()).deep.equal([1, 2, 3, 2]);
    });
    it('should modify the length of internal array is newSize is greater than current size', () => {
      const deque = ArrayDeque.create({ initial: [1, 2, 3, 2] });
      const initialLen = getInternalSize(deque);
      deque.resize(initialLen + 1);
      expect(getInternalSize(deque)).to.be.greaterThan(initialLen);
      expect(deque.toArray()).deep.equal([1, 2, 3, 2]);
    });
  });

  describe('queueIterator', () => {
    it('should remove elements in the right order', () => {
      const a = [1, 2, 3, 2];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.queueIterator();
      let i = 0;
      for (;;) {
        const item = iterator.next();
        expect(item.done).equal(i === a.length);
        if (item.done) break;
        expect(item.value).equal(a[i]);
        expect(iterator.remove()).equal(a[i]);
        ++i;
      }
      expect(i).equal(a.length);
      expect(deque.size()).equal(0);
    });
    it('should remove all even elements', () => {
      const deque = ArrayDeque.create<number>({ initial: { length: 251, seed: i => i } });
      const iterator = deque.queueIterator();
      let last = -1;
      for (;;) {
        const item = iterator.next();
        if (item.done) break;
        const value = item.value;
        expect(value).equal(last + 1);
        if (value % 2 === 0) expect(iterator.remove()).equal(value);
        last = value;
      }
      expect(deque.toArray()).to.deep.equal(Array.from({ length: 125 }, (_, i) => 2 * i + 1));
    });
    it('should set value of elements in the right order', () => {
      const a = [1, 2, 3, 2];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.queueIterator();
      let i = 0;
      for (;;) {
        const item = iterator.next();
        expect(item.done).equal(i === a.length);
        if (item.done) break;
        expect(item.value).equal(a[i]);
        expect(iterator.setValue(item.value + 1)).equal(item.value);
        ++i;
      }
      expect(i).equal(a.length);
      expect(deque.toArray()).deep.equal(a.map(x => x + 1));
    });
    it('should not allow remove/setValue after remove', () => {
      const a = [1, 2, 3, 2];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.queueIterator();
      const item = iterator.next();
      expect(item.done).to.be.false;
      expect(item.value).equal(1);
      expect(iterator.remove()).equal(1);
      expect(() => iterator.remove()).to.throw(Error);
      expect(() => iterator.setValue(2)).to.throw(Error);
      a.shift();
      expect(deque.toArray()).deep.equal(a);
    });
  });
  describe('reverseQueueIterator', () => {
    it('should remove elements in the right order', () => {
      const a = [2, 3, 2, 1];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.reverseQueueIterator();
      let i = 0;
      for (;;) {
        const item = iterator.next();
        expect(item.done).equal(i === a.length);
        if (item.done) break;
        const v = a[a.length - i - 1];
        expect(item.value).equal(v);
        expect(iterator.remove()).equal(v);
        ++i;
      }
      expect(i).equal(a.length);
      expect(deque.size()).equal(0);
    });
    it('should remove all even elements', () => {
      const deque = ArrayDeque.create<number>({ initial: { length: 251, seed: i => i } });
      const iterator = deque.reverseQueueIterator();
      let last = 251;
      for (;;) {
        const item = iterator.next();
        if (item.done) break;
        const value = item.value;
        expect(value).equal(last - 1);
        if (value % 2 === 0) expect(iterator.remove()).equal(value);
        last = value;
      }
      expect(deque.toArray()).to.deep.equal(Array.from({ length: 125 }, (_, i) => 2 * i + 1));
    });

    it('should set value of elements in the right order', () => {
      const a = [2, 3, 2, 1];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.reverseQueueIterator();
      let i = 0;
      for (;;) {
        const item = iterator.next();
        expect(item.done).equal(i === a.length);
        if (item.done) break;
        expect(item.value).equal(a[a.length - i - 1]);
        expect(iterator.setValue(item.value + 1)).equal(item.value);
        ++i;
      }
      expect(i).equal(a.length);
      expect(deque.toArray()).deep.equal(a.map(x => x + 1));
    });
    it('should not allow remove/setValue after remove', () => {
      const a = [2, 3, 2, 1];
      const deque = ArrayDeque.create({ initial: a });
      const iterator = deque.reverseQueueIterator();
      const item = iterator.next();
      expect(item.done).to.be.false;
      expect(item.value).equal(1);
      expect(iterator.remove()).equal(1);
      expect(() => iterator.remove()).to.throw(Error);
      expect(() => iterator.setValue(2)).to.throw(Error);
      a.pop();
      expect(deque.toArray()).deep.equal(a);
    });
  });
});
