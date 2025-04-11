[**ts-data-collections**](../README.md)

---

[ts-data-collections](../README.md) / qsort

# Function: qsort()

## Call Signature

> **qsort**\<`E`\>(`arr`): `E`[]

Sorts (using quicksort) an array according to the specified comparator.

### Type Parameters

#### E

`E`

### Parameters

#### arr

`E`[]

The array to be sorted

### Returns

`E`[]

The sorted array (same instance as input)

## Call Signature

> **qsort**\<`E`\>(`arr`, `arg2`): `E`[]

Sorts (using quicksort) an array according to the specified comparator.

### Type Parameters

#### E

`E`

### Parameters

#### arr

`E`[]

The array to be sorted

#### arg2

Optional start index or comparator function

`undefined` | `number` | `Comparator`\<`E`\>

### Returns

`E`[]

The sorted array (same instance as input)

## Call Signature

> **qsort**\<`E`\>(`arr`, `left`, `arg3`): `E`[]

Sorts (using quicksort) an array according to the specified comparator.

### Type Parameters

#### E

`E`

### Parameters

#### arr

`E`[]

The array to be sorted

#### left

`number`

#### arg3

Optional end index or comparator function

`undefined` | `number` | `Comparator`\<`E`\>

### Returns

`E`[]

The sorted array (same instance as input)

## Call Signature

> **qsort**\<`E`\>(`arr`, `left`, `right`, `comparator`): `E`[]

Sorts (using quicksort) an array according to the specified comparator.

### Type Parameters

#### E

`E`

### Parameters

#### arr

`E`[]

The array to be sorted

#### left

`number`

#### right

`number`

#### comparator

`undefined` | `Comparator`\<`E`\>

### Returns

`E`[]

The sorted array (same instance as input)
