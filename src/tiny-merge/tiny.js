import * as bytes from './bytes.js'
import { createOp } from './messages.js'

export const NUM_BYTES = 1228800

class Tiny {
  constructor() {
    this.latestGlobalSeq = -1
    this.globalSeqs = new Array(NUM_BYTES).fill(-1)
    this.values = bytes.create(NUM_BYTES)
  }

  shouldSet = (globalSeq, globalSeq2, value, value2) => {
    return globalSeq2 > globalSeq || (globalSeq2 === globalSeq && value2 > value)
  }

  get = (index) => {
    return bytes.get(this.values, index)
  }

  getNextGlobalSeq = () => {
    return this.latestGlobalSeq + 1
  }

  set = (globalSeq, index, value) => {
    const currentGlobalSeq = this.globalSeqs[index]
    if (
      currentGlobalSeq === undefined ||
      this.shouldSet(currentGlobalSeq, globalSeq, bytes.get(this.values, index), value)
    ) {
      if (!bytes.shouldSet(value)) {
        return false
      }

      this.globalSeqs[index] = globalSeq
      bytes.set(this.values, index, value)
      this.latestGlobalSeq = Math.max(this.latestGlobalSeq, globalSeq)

      return true
    }

    return false
  }

  getOps = () => {
    const ops = []
    for (let i = 0; i < NUM_BYTES; i++) {
      const globalSeq = this.globalSeqs[i]
      if (globalSeq !== -1) {
        const op = createOp.set(globalSeq, i, bytes.get(this.values, i))
        ops.push(op)
      }
    }
    return ops
  }
}

export default Tiny
