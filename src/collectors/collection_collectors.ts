import { Collector, Constructor } from 'ts-fluent-iterators';
import { MutableCollection } from '../collections';
import { WithCapacity } from '../utils';

export class CollectionCollector<
  A,
  C extends MutableCollection<A>,
  Options extends object = object,
> implements Collector<A, C> {
  private readonly c: C;

  constructor(c: C);
  constructor(ctor: Constructor<C>, options?: WithCapacity<Options>);
  constructor(arg1: C | Constructor<C>, options?: WithCapacity<Options>) {
    if (typeof arg1 == 'function') {
      if ('create' in arg1 && typeof arg1.create === 'function') {
        this.c = arg1.create(options);
      } else {
        this.c = new arg1(options);
      }
    } else {
      this.c = arg1;
    }
  }

  collect(a: A) {
    this.c.add(a);
  }

  get result(): C {
    return this.c;
  }
}
