import { Provider } from 'ts-fluent-iterators';
export type PutValue<V> = { data: V } | { provider: Provider<V> };
export type PutOpts = { insertMissing: boolean } | { updateExisting: boolean };
export type PutArgs = PutValue<V> & PutOpts;
