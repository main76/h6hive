const stdhive = require('./');
const { sentinel } = require('../src/hnode');
const assert = require('assert').strict;

if (require.main == module) {
  const radius = 3;
  const size = 3 * radius * (radius - 1) + 1;
  const shards = [
    0, 1, 12, 16,
    4, 14, 15, 18,
    9, 10, 11, 7
  ];
  const fill = '#'.repeat(8);
  const data = Array(size).fill(null);
  for (const shard of shards) {
    data[shard] = fill;
  }

  const hive = stdhive(radius, data);
  console.log(hive.ascii);

  const node = hive.get(1, 0, 0);
  assert.equal(node.s.sw, sentinel);

  console.log('Establish connection');
  hive.set(2, 0, 0, fill);
  console.log(hive.ascii);
  
  assert.equal(node.s.sw, hive.get(2, 1, 0));
  console.log('Sentinel test passed.');
}
