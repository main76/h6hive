/**
 * Hive Node
 * @template dType
 */
class HNode {
  /**
   * @type {dType}
   */
  #data;
  /**
   * @typedef {import("./hive").HDimension}
   */
  #vector;
  /**
   * @type {import("./hive").Hive<dType>}
   */
  #parent;

  /**
   * constructor of HNode
   * @param {dType} data 
   * @param {import("./hive").HDimension} vector
   * @param {import('./hive').Hive<dType>} parent
   */
  constructor(data, vector, parent) {
    this.#data = data;
    this.#vector = vector;
    this.#parent = parent;
  }

  get data() {
    return this.#data;
  }

  set data(value) {
    this.#data = value;
  }

  get vector() {
    return this.#vector;
  }

  get parent() {
    return this.#parent;
  }

  get n() {
    let i = this.#parent.index(this.#vector.x - 1, this.#vector.y, this.#vector.z);
    return this.#parent.nodes(i);
  }

  get s() {
    let i = this.#parent.index(this.#vector.x + 1, this.#vector.y, this.#vector.z);
    return this.#parent.nodes(i);
  }

  get nw() {
    let i = this.#parent.index(this.#vector.x, this.#vector.y, this.#vector.z - 1);
    return this.#parent.nodes(i);
  }

  get se() {
    let i = this.#parent.index(this.#vector.x, this.#vector.y, this.#vector.z + 1);
    return this.#parent.nodes(i);
  }

  get ne() {
    let i = this.#parent.index(this.#vector.x, this.#vector.y - 1, this.#vector.z);
    return this.#parent.nodes(i);
  }

  get sw() {
    let i = this.#parent.index(this.#vector.x, this.#vector.y + 1, this.#vector.z);
    return this.#parent.nodes(i);
  }

  toString() {
    if (this.#data == null) {
      return 'null';
    }
    return this.#data.toString();
  }
}

/**
 * @type {import("./hive").Hive<dType>}
 */
const fakeHive = {
  index() {
    return 0;
  },
  nodes() {
    return sentinel;
  }
};

const sentinel = new HNode(null, {}, fakeHive);

module.exports = {
  HNode,
  sentinel
};
