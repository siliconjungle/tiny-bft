import EventEmitter from 'events'
import Tiny from './tiny.js'
import LocalSeqs from './local-seqs.js'

class OpsManager extends EventEmitter {
  constructor(publicKeys) {
    super()
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
    return this.tiny.getValues()
  }

  applyOps = async (ops) => {
    const appliedOps = []

    for (const op of ops) {
      if (op.type === 'proof') {
        const appliedLocalSeq = await this.localSeqs.setLocalSeq(op.publicKey, op.localSeq, op.signature)

        if (appliedLocalSeq) {
          appliedOps.push(op)
        }
      } else if (op.type === 'set') {
        if (this.localSeqs.isValidSet(op)) {
          if (this.tiny.set(op.publicKey, op.globalSeq, op.index, op.value, op.signature)) {
            appliedOps.push(op)
          }
        }
      }
    }

    if (appliedOps.length > 0) {
      this.emit('change', this.getValues())
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
