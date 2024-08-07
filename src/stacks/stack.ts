import { Queue, QueueOptions } from '../queues';
import { UnderflowException } from '../utils';

export abstract class Stack<E> extends Queue<E> {
  constructor(options?: QueueOptions) {
    super(options);
  }

  push(item: E): Stack<E> {
    this.add(item);
    return this;
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

  swap(): Stack<E> {
    if (!this.trySwap()) throw new UnderflowException('Need at least two elements for a swap');
    return this;
  }

  abstract clone(): Stack<E>;
}
