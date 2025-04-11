[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / select

# Function: select()

> **select**\<`E`\>(`arr`, `k`, `comparator`): `E`

Locates the k-th element in the list according to specified comparator

## Type Parameters

### E

`E`

## Parameters

### arr

`E`[]

The array on which the k-th element is to be found. The array is modified by this function. To avoid modifying the array, clonet it before passing it to this function.

### k

`number`

The position of the element to locate.

### comparator

`Comparator`\<`E`\> = `Comparators.natural`

## Returns

`E`
