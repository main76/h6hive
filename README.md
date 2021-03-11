# H6HIVE

A hive-like hexagon vector for **ES2019**, initially designed for board games.

## Installation

npm for GitHub repository only:
```
npm i main76/h6hive -s
```

## HIVE

Hive is something like a tree, but not exactly the same. The children nodes are horizontal hexagons. Also it is currently size fixed.

I might be considering implement a scalable Hive class in the future.

### Axios

- x-axis: :arrow_down:
- y-axis: :arrow_lower_left:
- z-axis: :arrow_lower_right:

There stands an identity that `unit vector y` + `unit vector z` = `unit vector x`,
which means you only need either two of them to describe a coordinate.

### Data Binding

No data binding at all, use member function `set` to update the nodes.

## HNODE

HNode is something like a tree node, but with more directions.

### Basic

Six directions for each node. See the example output of `test/index.js` for detail.

```
        ____
       /    \
  ____/north \____
 /    \  0   /    \
/north \____/north \
\west 3/    \east 5/
 \____/center\____/
 /    \  1   /    \
/south \____/south \
\west 4/    \east 6/
 \____/south \____/
      \  2   /
       \____/
```

### Sentinel

When the value is null strictly, a `sentinel` node will be added to the hive.
`sentinel` is a node that connects to itself in all directions, which can be used as boundaries for zones.

```
              ____
             /    \
            / #### \____
            \ #### /    \
  ____       \____/ #### \____
 /    \      /    \ #### /    \
/ #### \    / #### \____/ #### \
\ #### /    \ #### /    \ #### /
 \____/      \____/      \____/
 /    \
/ #### \____        ____
\ #### /    \      /    \
 \____/ #### \    / #### \____
 /    \ #### /    \ #### /    \
/ #### \____/      \____/ #### \
\ #### /           /    \ #### /
 \____/       ____/ #### \____/
             /    \ #### /
            / #### \____/
            \ #### /
             \____/
```

For more, see the source code of `test/sentinel.js`.

## Test

- [x] Basic directions
- [x] Chain calling
- [x] Sentinel behavior
- [x] Set node
- [x] to ascii string
