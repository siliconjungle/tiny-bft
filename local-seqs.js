import dotenv from 'dotenv'
import { verifySignature } from './signatures'

dotenv.config()

const publicKeys = process.env.PUBLIC_KEYS ?? ''.split(',')

const MAX_LOCAL_SEQ = 1000000000
let maxGlobalSeq = -1
const localSeqs = {}

export const getLocalSeq = (publicKey) => localSeqs[publicKey] || -1

export const getLocalSeqs = () => {
  const ops = []

  for (const publicKey in localSeqs) {
    ops.push({
      type: 'proof',
      publicKey,
      localSeq: localSeqs[publicKey].seq,
      signature: localSeqs[publicKey].signature,
    })
  }

  return ops
}

export const isValidGlobalSeq = (seq) => seq <= maxGlobalSeq

export const shouldSetLocalSeq = (publicKey, seq, signature) =>
  publicKeys.includes(publicKey) &&
  seq < MAX_LOCAL_SEQ &&
  seq > getLocalSeq(publicKey) &&
  verifySignature(publicKey, signature, seq)

export const setLocalSeq = (publicKey, seq, signature) => {
  const currentSeq = getLocalSeq(publicKey)
  const diff = seq - currentSeq
  maxGlobalSeq += diff

  localSeqs[publicKey] = {
    seq,
    signature,
  }
}
