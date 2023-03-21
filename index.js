// TODO: Add database / local storage support
// TODO: Add a method for adding a new agent
// TODO: Add a method for creating new changes

import * as tiny from './tiny'
import * as localSeqs from './local-seqs'

export const applyOps = async (ops) => {
  for (const op of ops) {
    if (op.type === 'proof') {
      localSeqs.setLocalSeq(op.publicKey, op.localSeq, op.signature)
    } else if (op.type === 'set') {
      tiny.set(op.globalSeq, op.index, op.value)
    }
  }
}

export const getOps = () => {
  const ops = []
  ops.push(...localSeqs.getLocalSeqs())
  ops.push(...tiny.getOps())
  return ops
}
