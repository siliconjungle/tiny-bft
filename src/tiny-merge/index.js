import Tiny from './tiny'
import LocalSeqs from './local-seqs'
import * as bytes from './bytes'

// If you also hand an agent id with a set op you can restrict who can set the value.
export class OpManager {
  constructor() {
    this.tiny = new Tiny()
    this.localSeqs = new LocalSeqs()
  }

  getLatestGlobalSeq() {
    return this.tiny.getNextGlobalSeq() - 1
  }

  getLatestLocalSeq(publicKey) {
    return this.localSeqs.getLocalSeq(publicKey)
  }

  getValueAtIndex (index) {
    return this.tiny.get(index)
  }

  getValues () {
    return bytes.duplicate(this.tiny.values)
  }

  async applyOps(ops) {
    const appliedOps = []

    for (const op of ops) {
      if (op.type === 'proof') {
        const appliedLocalSeq = await this.localSeqs.setLocalSeq(op.publicKey, op.localSeq, op.signature)

        if (appliedLocalSeq) {
          appliedOps.push(op)
        }
      } else if (op.type === 'set') {
        if (this.localSeqs.isValidGlobalSeq(op.globalSeq)) {
          if (this.tiny.set(op.globalSeq, op.index, op.value)) {
            appliedOps.push(op)
          }
        }
      }
    }

    return appliedOps
  }

  getOps() {
    const ops = []
    ops.push(...this.localSeqs.getLocalSeqs())
    ops.push(...this.tiny.getOps())
    return ops
  }
}
