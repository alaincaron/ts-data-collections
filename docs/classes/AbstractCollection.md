[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / AbstractCollection

# Class: `abstract` AbstractCollection\<E\>

A `Collection` represents a group of objects, known as its
elements. Some collections allow duplicate elements and others do
not. Some are ordered and others unordered.

## Extends

- [`AbstractContainer`](AbstractContainer.md)

## Type Parameters

### E

`E`

## Implements

- `MutableCollection`\<`E`\>

## Methods

### \[iterator\]()

> `abstract` **\[iterator\]**(): `Iterator`\<`E`\>

Used to make this MutableCollection being seen as an
`Iterable<A>`. This allows them to be used in APIs expecting an
`Iterable<A>`

#### Returns

`Iterator`\<`E`\>

#### Implementation of

`MutableCollection.[iterator]`

---

### add()

> **add**(`item`): `boolean`

Ensures that this `Collection` contains the specified element.
Returns `true` if this `Collection` changed as a result of the
call. Returns false if this `Collection` does not allow
duplicates and already contains the specified element.

#### Parameters

##### item

`E`

the item whose presence in the `Collection` is to be ensured

#### Returns

`boolean`

true if this collection changed as a result of the call.

#### Throws

Overflowexception if the capacity of the `Collection`
would be exceeded by adding this element.

#### Implementation of

`MutableCollection.add`

---

### addFully()

> **addFully**\<`E1`\>(`container`): `number`

Adds all the items of the `container` to this `Collection` if
there is enough remaining capacity.

#### Type Parameters

##### E1

`E1`

#### Parameters

##### container

[`CollectionLike`](../type-aliases/CollectionLike.md)\<`E1`\>

The container of items to add.

#### Returns

`number`

The number of items added, which is the number of items
in the container.

#### Throws

Overflowexception if there remaining capacity of this
`Collection` is less than the number of items in the `container`.

#### Implementation of

`MutableCollection.addFully`

---

### buildOptions()

> **buildOptions**(): [`ContainerOptions`](../interfaces/ContainerOptions.md)

Returns the options used to build this `Collection`. This is
used buildCollection to initialize the built `Collection` with
the same options as the source `Collection`, e.g. in clone
operation.

#### Returns

[`ContainerOptions`](../interfaces/ContainerOptions.md)

---

### capacity()

> **capacity**(): `number`

Returns the capacity of this [Container](../interfaces/Container.md), i.e. the maximum
number of elements it can contain.

#### Returns

`number`

The capacity of this [Container](../interfaces/Container.md)

#### Implementation of

`MutableCollection.capacity`

#### Inherited from

[`AbstractContainer`](AbstractContainer.md).[`capacity`](AbstractContainer.md#capacity)

---

### clear()

> `abstract` **clear**(): `this`

Removes all elements from this `Collection`

@

#### Returns

`this`

This collection.

#### Implementation of

`MutableCollection.clear`

---

### clone()

> `abstract` **clone**(): `AbstractCollection`\<`E`\>

Returns a clone of this `Collection`.

The clone `Collection` will have the same elements and capacity
as the original one and also all other settings returned by `Collection.buildOptions.

#### Returns

`AbstractCollection`\<`E`\>

#### Implementation of

`MutableCollection.clone`

---

### contains()

> **contains**(`item`): `boolean`

Returns `true` if this `Collection` contains the specified
`item`. The comparison is done using equalsAny.

#### Parameters

##### item

`E`

The item whose presence is tested.

#### Returns

`boolean`

`true` if this `Collections contains the specified
`item`, `false` otherwise.

#### Implementation of

`MutableCollection.contains`

---

### containsAll()

> **containsAll**\<`E1`\>(`iteratorLike`): `boolean`

Returns true if this `Collection` contains all the elements in the specified `IteratorLike`.

#### Type Parameters

##### E1

`E1`

#### Parameters

##### iteratorLike

`IteratorLike`\<`E1`\>

The items to be checked for containment in this `Collection`.

#### Returns

`boolean`

true if this collection contains all the elements in the specified `IteratorLike`

#### Implementation of

`MutableCollection.containsAll`

---

### equals()

> `abstract` **equals**(`other`): `boolean`

Returns true if this collection is equal to the specified argument `other`.

#### Parameters

##### other

`unknown`

#### Returns

`boolean`

#### Implementation of

`MutableCollection.equals`

---

### filter()

> `abstract` **filter**(`predicate`): `number`

Removes items from this `Collection` for which the argument
`predicate` evaluates to `false`.

#### Parameters

##### predicate

`Predicate`\<`E`\>

the predicate used for filtering
item of this `Collection`.

#### Returns

`number`

the number of elements removed from this `Collection`

#### Implementation of

`MutableCollection.filter`

---

### find()

> **find**(`predicate`): `undefined` \| `E`

Finds an item for which the argument `predicate` evaluates to `true`.

#### Parameters

##### predicate

`Predicate`\<`E`\>

the predicate used to select an item

#### Returns

`undefined` \| `E`

An item for which the `predicate` evaluates to `true` or
`undefined`

#### Implementation of

`MutableCollection.find`

---

### hashCode()

> `abstract` **hashCode**(): `number`

Returns a hashCode for this `Collection`

#### Returns

`number`

#### Implementation of

`MutableCollection.hashCode`

---

### includes()

> **includes**(`item`): `boolean`

Returns `true` if this `Collection` contains the specified
`item`. The comparison is done using identify operator (`===`)/

#### Parameters

##### item

`E`

The item whose presence is tested.

#### Returns

`boolean`

`true` if this `Collections contains the specified
`item`, `false` otherwise.

#### Implementation of

`MutableCollection.includes`

---

### isEmpty()

> **isEmpty**(): `boolean`

Returns `true` if this [Container](../interfaces/Container.md) is empty, i.e., its size is `0`.

#### Returns

`boolean`

`true` if this [Container](../interfaces/Container.md) is empty, `false` otherwise.

#### Implementation of

`MutableCollection.isEmpty`

#### Inherited from

[`AbstractContainer`](AbstractContainer.md).[`isEmpty`](AbstractContainer.md#isempty)

---

### isFull()

> **isFull**(): `boolean`

Returns `true` if this [Container](../interfaces/Container.md) is full, i.e. its size is greater than or equal to is capacity.\*

#### Returns

`boolean`

`true` if this [Container](../interfaces/Container.md) is full, false otherwise.

#### Implementation of

`MutableCollection.isFull`

#### Inherited from

[`AbstractContainer`](AbstractContainer.md).[`isFull`](AbstractContainer.md#isfull)

---

### iterator()

> **iterator**(): `FluentIterator`\<`E`\>

Returns a `FluentIterator` (
https://github.com/alaincaron/ts-fluent-iterators/blob/main/docs/classes/FluentIterator.md)
yielding all elements of this `Collection`.

#### Returns

`FluentIterator`\<`E`\>

a `FluentIterator` yielding all elements of this `Collection`.

#### Implementation of

`MutableCollection.iterator`

---

### offer()

> `abstract` **offer**(`item`): `boolean`

Inserts an element if possible, without exceeding the `capacity`
of this `Collection`, otherwise returning false.

#### Parameters

##### item

`E`

the item to add to the `Collection`

#### Returns

`boolean`

`true` if the element can be added without exceeding the `capacity`, `false` otherwise.

#### Implementation of

`MutableCollection.offer`

---

### offerPartially()

> **offerPartially**\<`E1`\>(`container`): `number`

Adds as many items as possible of the `container` to this
`Collection` as long there is remaining capacity. Items are
added one by one until all items are added or the `Collection` is
[full](../interfaces/Container.md#isfull).

#### Type Parameters

##### E1

`E1`

#### Parameters

##### container

The container of items to add.

`IteratorLike`\<`E1`\> | [`CollectionLike`](../type-aliases/CollectionLike.md)\<`E1`\>

#### Returns

`number`

The number of items added

#### Implementation of

`MutableCollection.offerPartially`

---

### remaining()

> **remaining**(): `number`

Returns the number of elements that can be added to this
[Container](../interfaces/Container.md) without exceeding its `capacity`.

#### Returns

`number`

the number of elements that can be added to this [Container](../interfaces/Container.md) without exceeding its `capacity`.

#### Implementation of

`MutableCollection.remaining`

#### Inherited from

[`AbstractContainer`](AbstractContainer.md).[`remaining`](AbstractContainer.md#remaining)

---

### removeAll()

> **removeAll**(`c`): `number`

Removes all of this collection's elements that are also contained
in the specified `Collection`. After this call returns, this
`Collection` will contain no elements in common with the
specified `Collection`.

#### Parameters

##### c

`Collection`\<`E`\>

`Collection` containing elements to be removed from this `Collection`.

#### Returns

`number`

The number of elements that were removed as a result of this call.

#### Implementation of

`MutableCollection.removeAll`

---

### removeItem()

> **removeItem**(`item`): `boolean`

Removes an instance of item from the `Collection`

#### Parameters

##### item

`E`

The `item` to remove from the `Collection`

#### Returns

`boolean`

`true` if an element was removed from the `Collection`, `false` otherwise.

#### Remarks

The comparison for equality is made using the function equalsAny.

#### Implementation of

`MutableCollection.removeItem`

---

### removeMatchingItem()

> `abstract` **removeMatchingItem**(`predicate`): `undefined` \| `E`

Removes an item for which the `predicate` returns `true`.

#### Parameters

##### predicate

`Predicate`\<`E`\>

The predicate that is being evaluated for each element.

#### Returns

`undefined` \| `E`

the element removed from the `Collection` or `undefined`
if there are no items for which the `predicate` evaluated to
`true`.

#### Implementation of

`MutableCollection.removeMatchingItem`

---

### retainAll()

> **retainAll**(`c`): `number`

Retains only the elements in this `Collection` that are contained
in the specified `Collection`. In other words, removes from this
`Collection all of its elements that are not contained in the
specified `Collection`.

#### Parameters

##### c

`Collection`\<`E`\>

`Collection` containing elements to be retained in this `Collection`.

#### Returns

`number`

The number of elements that were removed as a result of this call.

#### Implementation of

`MutableCollection.retainAll`

---

### size()

> `abstract` **size**(): `number`

Returns the number of items in this [Container](../interfaces/Container.md).

#### Returns

`number`

the number of items in this [Container](../interfaces/Container.md).

#### Implementation of

`MutableCollection.size`

#### Inherited from

[`AbstractContainer`](AbstractContainer.md).[`size`](AbstractContainer.md#size)

---

### toArray()

> **toArray**(): `E`[]

Returns an array containing all elements of this `Collection`

#### Returns

`E`[]

an array containing all elements of this `Collection`

#### Implementation of

`MutableCollection.toArray`

---

### toJSON()

> **toJSON**(): `string`

Returns a JSON string representation of this `Collection`.

#### Returns

`string`

#### Implementation of

`MutableCollection.toJSON`
