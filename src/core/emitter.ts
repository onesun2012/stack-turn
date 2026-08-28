type Handler = (payload: never) => void;

export class Emitter<E extends Record<string, unknown>> {
  private handlers = new Map<keyof E, Set<Handler>>();

  on<K extends keyof E>(key: K, fn: (payload: E[K]) => void): () => void {
    const set = this.handlers.get(key) ?? new Set<Handler>();
    set.add(fn as Handler);
    this.handlers.set(key, set);
    return () => { set.delete(fn as Handler); };
  }

  emit<K extends keyof E>(key: K, payload: E[K]): void {
    this.handlers.get(key)?.forEach((fn) => (fn as (p: E[K]) => void)(payload));
  }
}