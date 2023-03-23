import * as bytes from './bytes.js'
import { createOp } from './messages.js'

export const NUM_BYTES = 1228800

class Tiny {
  constructor() {
    this.latestGlobalSeq = -1
    this.globalSeqs = new Array(NUM_BYTES).fill(-1)
    this.values = bytes.create(NUM_BYTES)
    this.publicKeys = new Array(NUM_BYTES).fill('')
    this.signatures = new Array(NUM_BYTES).fill('')
  }

  shouldSet = (globalSeq, globalSeq2, value, value2) => {
    return globalSeq2 > globalSeq || (globalSeq2 === globalSeq && value2 > value)
  }

  get = (index) => {
    return bytes.get(this.values, index)
  }

  getValues = () => {
    return bytes.duplicate(this.values)
  }

  getNextGlobalSeq = () => {
    return this.latestGlobalSeq + 1
  }

  set = (publicKey, globalSeq, index, value, signature) => {
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
      this.publicKeys[index] = publicKey
      this.signatures[index] = signature
      this.latestGlobalSeq = Math.max(this.latestGlobalSeq, globalSeq)

      return true
    }

    return false
  }

  getOps = () => {
    const ops = []
    for (let i = 0; i < NUM_BYTES; i++) {
      const globalSeq = this.globalSeqs[i]
      const publicKey = this.publicKeys[i]
      const signature = this.signatures[i]

      if (globalSeq !== -1) {
        const op = createOp.set(publicKey, globalSeq, i, bytes.get(this.values, i), signature)
        ops.push(op)
      }
    }
    return ops
  }
}

export default Tiny
