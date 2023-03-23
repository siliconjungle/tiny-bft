import Tiny from './tiny.js'
import LocalSeqs from './local-seqs.js'
import * as bytes from './bytes.js'
import { toBuffer } from './signatures.js'

// If you also hand an agent id with a set op you can restrict who can set the value.
class OpsManager {
  constructor(publicKeys) {
    this.tiny = new Tiny()
    this.localSeqs = new LocalSeqs(publicKeys)
  }

  getLatestGlobalSeq = () => {
    return this.tiny.getNextGlobalSeq() - 1
  }

  getLatestLocalSeq = (publicKey) => {
    return this.localSeqs.getLocalSeq(publicKey)
  }

  getNextGlobalSeq = () => {
    return this.tiny.getNextGlobalSeq()
  }

  getNextLocalSeq = (publicKey) => {
    return this.localSeqs.getNextLocalSeq(publicKey)
  }

  getValueAtIndex = (index) => {
    return this.tiny.get(index)
  }

  getValues = () => {
    return bytes.duplicate(this.tiny.values)
  }

  applyOps = async (ops) => {
    const appliedOps = []

    for (const op of ops) {
      if (op.type === 'proof') {
        const appliedLocalSeq = await this.localSeqs.setLocalSeq(op.publicKey, op.localSeq, toBuffer(op.signature))

        if (appliedLocalSeq) {
          appliedOps.push(op)
        }
      } else if (op.type === 'set') {
        if (this.localSeqs.isValidSet(op)) {
          if (this.tiny.set(op.publicKey, op.globalSeq, op.index, op.value, toBuffer(op.signature))) {
            appliedOps.push(op)
          }
        }
      }
    }

    return appliedOps
  }

  getOps = () => {
    const ops = []
    ops.push(...this.localSeqs.getLocalSeqs())
    ops.push(...this.tiny.getOps())
    return ops
  }
}

export default OpsManager
