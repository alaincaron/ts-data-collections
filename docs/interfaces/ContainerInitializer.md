[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / ContainerInitializer

# Interface: ContainerInitializer\<ContainerLike\>

Interface for initializing a container with initial elements.
This is used by container factory methods to create new instances
with predefined content.

## Type Parameters

### ContainerLike

`ContainerLike` _extends_ `object`

## Properties

### initial?

> `optional` **initial**: `ContainerLike`

Optional initial elements to populate the container with.
Can be an array, another container, or any object implementing
the ContainerLike interface.
