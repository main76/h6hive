const { HNode, sentinel } = require('./hnode');

/**
 * @template dType
 * @class
 */
class Hive {
  /**
   * @type {HNode<dType>[]}
   */
  #satellite;
  /**
   * @type {number}
   */
  #x0;
  /**
   * @type {number[]} 
   */
  #y;
  /**
   * @type {number[]} 
   */
  #z;

  /**
   * @param {HDerivative} derivative 
   * @param {dType[]} values when `values[i] === null`, `sentinel` will be appended.
   */
  constructor(derivative, values) {
    if (!derivative) {
      throw new Error('derivative function is required');
    }
    values = values || [];
    let x, y = 0, z = 0, i = 0, me = this, dx, nodes;
    this.#y = [];
    this.#z = [];
    this.#satellite = nodes = [];

    function append() {
      dx = derivative.dx(y, z);
      x = -1;
      while (++x < dx) {
        const value = values[i++];
        nodes.push(me.#createNode(x, y, z, value));
      }
    }

    append();
    this.#x0 = i;

    while (derivative.dy(y++)) {
      append(this.#y[y] = i);
    }
    this.#y[y = 0] = i;

    while (derivative.dz(z++)) {
      append(this.#z[z] = i);
    }
    this.#z[z = 0] = i;

    if (i == 0) {
      throw new Error('Empty hive, please check the derivative parameter');
    }
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @param {dType} value 
   */
  #createNode(x, y, z, value) {
    return value === null ? sentinel : new HNode(value, { x, y, z }, this);
  }

  get yspan() {
    return this.#y.length;
  }

  get zspan() {
    return this.#z.length;
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  get(x, y, z) {
    return this.#satellite[this.index(x, y, z)];
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @param {dType} value
   */
  set(x, y, z, value) {
    const i = this.index(x, y, z);
    let node = this.#satellite[i];
    if (!node) {
      throw new Error('Index out of range!');
    }
    if (node != sentinel) {
      node.data = value;
    }
    else {
      this.#satellite[i] = this.#createNode(x, y, z, value);
    }
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  index(x, y, z) {
    if ((y != 0 && z != 0) || y + z < 0) {
      if (y > z) {
        return this.index(x + z, y - z, 0);
      }
      else {
        return this.index(x + y, 0, z - y);
      }
    }
    if (x >= 0) {
      let [v, w] = y ? [y, this.#y] : [z, this.#z];
      if (v == 0) {
        v = 1;
        w = [this.#x0, 0];
      }
      const xcol = w[v];
      if (xcol != undefined) {
        const i = xcol + x;
        if (i < w[0]) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * @param {number} i 
   */
  nodes(i) {
    return this.#satellite[i];
  }

  /**
   * @param {(data: dType, i: number) => HNode<dType>} condition 
   */
  *find(condition) {
    let i = -1;
    while (++i < this.#satellite.length) {
      let node = this.#satellite[i];
      if (condition(node, i)) {
        yield node;
      }
    }
  }

  /**
   * @param {(data: dType, i: number) => HNode<dType>} condition 
   */
  findOne(condition) {
    return this.find(condition).next()?.value;
  }

  /**
   * @param {(data: dType, i: number) => HNode<dType>} condition 
   */
  *rfind(condition) {
    let i = this.#satellite.length;
    while (i--) {
      let node = this.#satellite[i];
      if (condition(node, i)) {
        yield node;
      }
    }
  }

  /**
   * @param {(data: dType, i: number) => HNode<dType>} condition 
   */
  rfindOne(condition) {
    return this.rfind(condition).next()?.value;
  }

  get ascii() {
    const baseSize = 4;
    const wingSize = 2;
    const textSize = 12;
    const maxWidth = baseSize + wingSize * 2
      + (this.yspan + this.zspan - 2) * (baseSize + wingSize);

    /**
     * @type {string[][]}
     */
    const lines = [];

    /**
     * @param {number} y 
     */
    function getLine(y) {
      if (!lines[y]) {
        lines[y] = Array(maxWidth).fill(' ');
      }
      return lines[y];
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {HNode<dType>} node 
     */
    function drawHexagon(x, y, node) {
      if (node === sentinel) {
        return;
      }

      let line = getLine(y++);
      for (let i = 0; i < baseSize; i++) {
        line[x + i] = '_';
      }

      line = getLine(y++);
      line[x - 1] = '/';
      line[x + baseSize] = '\\';

      line = getLine(y++);
      line[x - 2] = '/';
      line[x + baseSize + 1] = '\\';

      let text = node.toString().replace(/\r\n|\r|\n/, ' ');
      text = text.length > textSize ? text.substring(0, textSize) : text;
      drawText(x - 1, y - 1, text);
      
      line = getLine(y++);
      line[x - 2] = '\\';
      line[x + baseSize + 1] = '/';

      line = getLine(y);
      line[x - 1] = '\\';
      line[x + baseSize] = '/';

      for (let i = 0; i < baseSize; i++) {
        line[x + i] = '_';
      }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     */
    function drawText(x, y, text) {
      if (text.length > textSize / 2) {
        // two lines
        const parts = text.split(/\s|\t/);

        for (let i = 1; i < parts.length; i++) {
          let top = parts.slice(0, i).join(' ');
          let bot = parts.slice(i).join(' ');

          if (top.length <= textSize / 2 && bot.length <= textSize / 2) {
            drawText(x, y, top);
            drawText(x, y + 1, bot);
            return;
          }
        }

        let trunc = Math.floor(text.length / 2);
        drawText(x, y, text.substring(0, trunc));
        drawText(x, y + 1, text.substring(trunc));
        return;
      }

      let offset = x + Math.floor((textSize / 2 - text.length) / 2);
      let line = getLine(y);
      for (let i = 0; i < text.length; i++) {
        line[offset + i] = text[i];
      }
    }

    // draw x0
    let xbias = (baseSize + wingSize) * this.yspan - baseSize;
    let ybias = 0;
    for (let i = 0; i < this.#x0; i++) {
      const node = this.#satellite[i];
      drawHexagon(xbias, ybias, node);
      ybias += 2 * wingSize;
    }

    // draw xy
    for (let j = 1; j < this.yspan; j++) {
      xbias = (baseSize + wingSize) * (this.yspan - j) - baseSize;
      ybias = wingSize * j;
      for (let i = this.#y[j]; i < this.#y[(j + 1) % this.yspan]; i++) {
        const node = this.#satellite[i];
        drawHexagon(xbias, ybias, node);
        ybias += 2 * wingSize;
      }
    }
    
    // draw xz
    for (let j = 1; j < this.zspan; j++) {
      xbias = (baseSize + wingSize) * (this.yspan + j) - baseSize;
      ybias = wingSize * j;
      for (let i = this.#z[j]; i < this.#z[(j + 1) % this.zspan]; i++) {
        const node = this.#satellite[i];
        drawHexagon(xbias, ybias, node);
        ybias += 2 * wingSize;
      }
    }

    const asciiLines = [];
    for (const line of lines) {
      let lineStr = line.join('').trimEnd();
      if (lineStr.length) {
        asciiLines.push(lineStr);
      }
    }

    return asciiLines.join('\n');
  }
}

/**
 * @typedef {object} HDimension
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {object} HDerivative
 * @property {(y:number, z:number) => number} dx
 * @property {(y:number) => boolean} dy
 * @property {(z:number) => boolean} dz
 */

/**
 * @template dType
 * @typedef {Hive<dType>} Hive<dType>
 */

module.exports = { Hive };
