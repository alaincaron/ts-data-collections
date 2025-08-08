import { expect } from 'chai';
import { createBiMap } from './helper';
import { BiMapCollector, hashBiMapCollector, createHashBiMap } from '../../src';

describe('HashBiMapCollector', () => {
  it('should add items to the wrapped collection', () => {
    const collector = hashBiMapCollector();
    collector.collect(['foo', 3]);
    collector.collect(['bar', 6]);
    const result = collector.result;
    expect(result.equals(createBiMap(['foo', 3], ['bar', 6]))).to.be.true;
    expect(result.keyIterator().collect().sort()).to.deep.equal(['bar', 'foo']);
    expect(result.valueIterator().collect().sort()).to.deep.equal([3, 6]);
  });

  it('should add items to the built collection using', () => {
    const map = createHashBiMap<string, number>();
    const collector = new BiMapCollector(map);
    collector.collect(['foo', 6]);
    collector.collect(['bar', 3]);
    const result = collector.result;
    expect(result).equal(map);
    expect(result.equals(createBiMap(['foo', 6], ['bar', 3]))).to.be.true;
    expect(result.keyIterator().collect().sort()).to.deep.equal(['bar', 'foo']);
    expect(result.valueIterator().collect().sort()).to.deep.equal([3, 6]);
  });
});
