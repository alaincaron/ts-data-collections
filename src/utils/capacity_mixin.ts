import { Constructor } from 'ts-fluent-iterators';
import { AddCapacity, ContainerOptions } from './container';

export function CapacityMixin<TBase extends Constructor<any, any[]>>(
  Base: TBase
): Constructor<TBase, AddCapacity<ConstructorParameters<TBase>>> {
  class Derived extends Base {
    readonly _capacity: number;

    constructor(...args: any[]) {
      super(...args);
      const arg0 = args[0];
      if (typeof arg0 === 'number') this._capacity = Math.floor(arg0);
      else this._capacity = Math.floor(arg0?.capacity ?? Infinity);
    }

    capacity() {
      return this._capacity;
    }

    buildOptions(): ContainerOptions {
      const options = super.buildOptions();
      const capacity = this._capacity;
      if (Number.isFinite(capacity)) {
        options.capacity = capacity;
      }
      return options;
    }
  }

  return Derived;
}
