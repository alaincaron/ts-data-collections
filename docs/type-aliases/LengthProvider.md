[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / LengthProvider

# Type Alias: LengthProvider

> **LengthProvider** = \{ `length`: [`NumberProvider`](NumberProvider.md); \} \| \{ `size`: [`NumberProvider`](NumberProvider.md); \}

Interface for objects that can provide a numeric length or size.
This is used to abstract over different ways of getting an object's size,
such as arrays (length) and collections (size).
