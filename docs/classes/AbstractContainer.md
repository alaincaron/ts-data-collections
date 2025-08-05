[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / AbstractContainer

# Abstract Class: AbstractContainer

A `Container` is an object that can contain objects.

## Extended by

- [`AbstractCollection`](AbstractCollection.md)

## Implements

- [`Container`](../interfaces/Container.md)

## Methods

### capacity()

> **capacity**(): `number`

Returns the capacity of this [Container](../interfaces/Container.md), i.e. the maximum
number of elements it can contain.

#### Returns

`number`

The capacity of this [Container](../interfaces/Container.md)

#### Implementation of

[`Container`](../interfaces/Container.md).[`capacity`](../interfaces/Container.md#capacity)

---

### isEmpty()

> **isEmpty**(): `boolean`

Returns `true` if this [Container](../interfaces/Container.md) is empty, i.e., its size is `0`.

#### Returns

`boolean`

`true` if this [Container](../interfaces/Container.md) is empty, `false` otherwise.

#### Implementation of

[`Container`](../interfaces/Container.md).[`isEmpty`](../interfaces/Container.md#isempty)

---

### isFull()

> **isFull**(): `boolean`

Returns `true` if this [Container](../interfaces/Container.md) is full, i.e. its size is greater than or equal to is capacity.\*

#### Returns

`boolean`

`true` if this [Container](../interfaces/Container.md) is full, false otherwise.

#### Implementation of

[`Container`](../interfaces/Container.md).[`isFull`](../interfaces/Container.md#isfull)

---

### remaining()

> **remaining**(): `number`

Returns the number of elements that can be added to this
[Container](../interfaces/Container.md) without exceeding its `capacity`.

#### Returns

`number`

the number of elements that can be added to this [Container](../interfaces/Container.md) without exceeding its `capacity`.

#### Implementation of

[`Container`](../interfaces/Container.md).[`remaining`](../interfaces/Container.md#remaining)

---

### size()

> `abstract` **size**(): `number`

Returns the number of items in this [Container](../interfaces/Container.md).

#### Returns

`number`

the number of items in this [Container](../interfaces/Container.md).

#### Implementation of

[`Container`](../interfaces/Container.md).[`size`](../interfaces/Container.md#size)
