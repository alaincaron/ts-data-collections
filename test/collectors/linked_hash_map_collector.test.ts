import { expect } from 'chai';
import { CollisionHandlers } from 'ts-fluent-iterators';
import { HashMap, LinkedHashMap, linkedHashMapCollector } from '../../src';

describe('LinkedHashMapCollector', () => {
  it('should add items to the wrapped collection using default collision handler', () => {
    const collector = linkedHashMapCollector();
    collector.collect(['foo', 3]);
    collector.collect(['foo', 6]);
    const result = collector.result;
    expect(result.equals(HashMap.create({ initial: new Map().set('foo', 6) }))).to.be.true;
    expect(result.constructor.name).equals('LinkedHashMap');
  });

  it('should add items to the built collection using the default collision handler', () => {
    const map = new LinkedHashMap();
    const collector = linkedHashMapCollector({ arg: map });
    collector.collect(['foo', 6]);
    collector.collect(['foo', 3]);
    const result = collector.result;
    expect(result).to.equal(map);
    expect(result.equals(HashMap.create({ initial: new Map().set('foo', 3) }))).to.be.true;
    expect(result.constructor.name).equals('LinkedHashMap');
  });

  it('should throw on collision', () => {
    const collector = linkedHashMapCollector({ collisionHandler: CollisionHandlers.reject });
    collector.collect(['foo', 3]);
    expect(() => collector.collect(['foo', 6])).to.throw(Error);
    const result = collector.result;
    expect(result.equals(HashMap.create({ initial: new Map().set('foo', 3) }))).to.be.true;
    expect(result.constructor.name).equals('LinkedHashMap');
  });

  it('should keep previous on collision', () => {
    const map = new LinkedHashMap();
    const collector = linkedHashMapCollector({ arg: map, collisionHandler: CollisionHandlers.ignore });
    collector.collect(['foo', 3]);
    collector.collect(['foo', 6]);
    const result = collector.result;
    expect(result).to.equal(map);
    expect(result.equals(HashMap.create({ initial: new Map().set('foo', 3) }))).to.be.true;
    expect(result.constructor.name).equals('LinkedHashMap');
  });

  it('should overwrite previous value on collision', () => {
    const map = new LinkedHashMap();
    const collector = linkedHashMapCollector({ arg: map, collisionHandler: CollisionHandlers.overwrite });
    collector.collect(['foo', 3]);
    collector.collect(['foo', 6]);
    const result = collector.result;
    expect(result).to.equal(map);
    expect(result.equals(HashMap.create({ initial: new Map().set('foo', 6) }))).to.be.true;
    expect(result.constructor.name).equals('LinkedHashMap');
  });
});
