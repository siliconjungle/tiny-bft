import dotenv from 'dotenv'
import { verifySignature } from './signatures'
import { createOp } from './messages'

dotenv.config()

const publicKeys = process.env.PUBLIC_KEYS ?? ''.split(',')

const MAX_LOCAL_SEQ = 1000000000
let maxGlobalSeq = -1
const localSeqs = {}

export const getLocalSeq = (publicKey) => localSeqs[publicKey] || -1
export const getNextLocalSeq = (publicKey) => getLocalSeq(publicKey) + 1

export const getLocalSeqs = () => {
  const ops = []

  for (const publicKey in localSeqs) {
    const op = createOp.proof(
      publicKey,
      localSeqs[publicKey].seq,
      localSeqs[publicKey].signature
    )

    ops.push(op)
  }

  return ops
}

export const isValidGlobalSeq = (seq) => seq > -2 && seq <= maxGlobalSeq

export const shouldSetLocalSeq = async (publicKey, seq, signature) =>
  publicKeys.includes(publicKey) &&
  seq < MAX_LOCAL_SEQ &&
  seq > getLocalSeq(publicKey) &&
  verifySignature(publicKey, signature, seq)

export const setLocalSeq = (publicKey, seq, signature) => {
  if (!shouldSetLocalSeq(publicKey, seq, signature)) {
    return
  }
  const currentSeq = getLocalSeq(publicKey)
  const diff = seq - currentSeq
  maxGlobalSeq += diff

  localSeqs[publicKey] = {
    seq,
    signature,
  }
}
