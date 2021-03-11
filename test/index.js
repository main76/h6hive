const { Hive } = require('..');
const assert = require('assert').strict;

/**
 * @template dType
 * @param {number} radius 
 * @param {dType[]} data 
 */
function stdhive(radius, data) {
  /**
   * @type {import("../src/hive").HDerivative}
   */
  const dxyz = {
    dx(y, z) {
      return radius * 2 - 1 - y - z;
    },
    dy(y) {
      return y < radius - 1;
    },
    dz(z) {
      return z < radius - 1;
    }
  };

  const size = 3 * radius * (radius - 1) + 1;
  assert.equal(data.length, size, 'data size does not fit the expectation.');

  return new Hive(dxyz, data);
}

if (require.main == module) {
  const radius = 2;
  const data = [
    'north 0',
    'center 1',
    'south 2',
    'north west 3',
    'south west 4',
    'north east 5',
    'south east 6'
  ];

  const hive = stdhive(radius, data);
  const center = hive.get(1, 0, 0);
  console.log(hive.ascii);

  assert.equal(center.n, hive.get(0, 0, 0));
  assert.equal(center.s, hive.get(2, 0, 0));
  assert.equal(center.nw, hive.get(0, 1, 0));
  assert.equal(center.sw, hive.get(1, 1, 0));
  assert.equal(center.ne, hive.get(0, 0, 1));
  assert.equal(center.se, hive.get(1, 0, 1));
  console.log('Basic 6-direction-test passed');

  assert.equal(center.s.nw.n, center.nw);
  assert.equal(center.nw.ne, center.n);
  assert.equal(center.s.n, center);
  assert.equal(center.ne.n, undefined);
  console.log('Chain test passed');
}

module.exports = stdhive;
