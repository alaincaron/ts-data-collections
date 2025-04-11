import { FNV1a32HashFunction, HashFunction } from './hashFunction';

export function hashIterableOrdered<X>(iter: Iterable<X>, hashFunction?: HashFunction): number {
  let hash = 31;
  for (const item of iter) {
    hash = ((hash << 5) - hash + hashAny(item, hashFunction)) | 0;
  }
  return hash;
}

export function hashIterableUnordered<X>(iter: Iterable<X>, hashFunction?: HashFunction): number {
  let hash = 31;
  for (const item of iter) {
    hash = (hash + hashAny(item, hashFunction)) | 0;
  }
  return hash;
}

const BUFFER_TYPES = new Set([
  Uint8Array,
  Int8Array,
  Uint8ClampedArray,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  DataView,
]);

export function hashAny(x: any, hashFunction?: HashFunction): number {
  if (x === null || x === undefined) return 0;
  if (typeof x.hashCode === 'function') return x.hashCode();
  hashFunction ??= FNV1a32HashFunction.instance();
  switch (typeof x) {
    case 'string':
      return hashFunction.hashString(x).asNumber();
    case 'number':
      return hashFunction.hashNumber(x).asNumber();
    case 'boolean':
      return hashFunction.hashBoolean(x).asNumber();
    case 'function':
    case 'symbol':
      return hashFunction.hashString(x.toString()).asNumber();
    case 'bigint':
      return hashFunction.hashNumber(Number(BigInt.asIntN(32, x))).asNumber();
    default:
      if (typeof x.toSink === 'function') {
        const hasher = hashFunction.newHasher();
        x.toSink(hasher);
        return hasher.hash().asNumber();
      }
      if (x instanceof Set || x instanceof Map) return hashIterableUnordered(x, hashFunction);
      if (x instanceof ArrayBuffer) return hashFunction.hashBytes(Buffer.from(x)).asNumber();
      if (BUFFER_TYPES.has(x.constructor)) return hashFunction.hashBytes(Buffer.from(x)).asNumber();
      if (typeof x[Symbol.iterator] === 'function') return hashIterableOrdered(x, hashFunction);
      return hashIterableUnordered(Object.entries(x), hashFunction);
  }
}
