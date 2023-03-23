// circom zkp library.
// kzg commitments.
import { verifySignature } from './signatures.js'
import { createOp } from './messages.js'

export const MAX_LOCAL_SEQ = 1000000000

class LocalSeqs {
  constructor(publicKeys) {
    this.publicKeys = publicKeys
    this.maxGlobalSeq = -1
    this.localSeqs = {}
  }

  getLocalSeq = (publicKey) => {
    return this.localSeqs[publicKey] || -1
  }

  getNextLocalSeq = (publicKey) => {
    return this.getLocalSeq(publicKey) + 1
  }

  getLocalSeqs = () => {
    const ops = []

    for (const publicKey in this.localSeqs) {
      const op = createOp.proof(
        publicKey,
        this.localSeqs[publicKey].seq,
        this.localSeqs[publicKey].signature
      )

      ops.push(op)
    }

    return ops
  }

  isValidGlobalSeq = (seq) => {
    return seq > -2 && seq <= this.maxGlobalSeq
  }

  // Can crash if it's not a valid signature.
  shouldSetLocalSeq = async (publicKey, seq, signature) => {
    return (
      this.publicKeys.includes(publicKey) &&
      seq < MAX_LOCAL_SEQ &&
      seq > this.getLocalSeq(publicKey) &&
      verifySignature(publicKey, signature, seq)
    )
  }

  setLocalSeq = async (publicKey, seq, signature) => {
    const shouldSet = await this.shouldSetLocalSeq(publicKey, seq, signature)
    if (!shouldSet) {
      return false
    }

    const currentSeq = this.getLocalSeq(publicKey)
    const diff = seq - currentSeq
    this.maxGlobalSeq += diff

    this.localSeqs[publicKey] = {
      seq,
      signature,
    }

    return true
  }

  isValidSet = async (op) =>
    op.type === 'set' &&
    this.publicKeys.includes(op.publicKey) &&
    this.isValidGlobalSeq(op.globalSeq) &&
    verifySignature(op.publicKey, op.signature, { globalSeq: op.globalSeq, index: op.index, value: op.value })
}

export default LocalSeqs
