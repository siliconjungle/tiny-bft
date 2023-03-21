// TODO: Add database / local storage support
// TODO: Add a method for adding a new agent
// TODO: Add a method for creating new changes
// This is just another document with different permissions.
// There needs to be a way to link to a document given an agent.
// TODO: Add personal data storage for each agent

import tiny from 'tiny'
import localSeqs from './local-seqs'

export const applyOps = (ops) => {
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
