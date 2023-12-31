import { Queue } from '../queues';
import { CapacityMixin, ContainerOptions, UnderflowException } from '../utils';

export abstract class Stack<E> extends Queue<E> {
  constructor(options?: number | ContainerOptions) {
    super(options);
  }

  push(item: E) {
    this.add(item);
  }

  tryPush(item: E): boolean {
    return this.offer(item);
  }

  pop(): E {
    return this.remove();
  }

  trySwap(): boolean {
    if (this.size() >= 2) {
      const a = this.pop();
      const b = this.pop();
      this.push(a);
      this.push(b);
      return true;
    }
    return false;
  }

  swap() {
    if (!this.trySwap()) throw new UnderflowException('Need at least two elements for a swap');
  }

  abstract clone(): Stack<E>;
}

export const BoundedStack = CapacityMixin(Stack);
