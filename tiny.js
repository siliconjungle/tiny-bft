import { isValidGlobalSeq } from './local-seqs'
import * as bytes from './bytes'

const NUM_BYTES = 1228800

let latestGlobalSeq = -1
const globalSeqs = new Array(NUM_BYTES).fill(-1)
const values = bytes.create(NUM_BYTES)

const shouldSet = (globalSeq, globalSeq2, value, value2) =>
  globalSeq2 > globalSeq || (globalSeq2 === globalSeq && value2 > value)

export const get = (index) => bytes.get(values, index)
export const getNextGlobalSeq = () => latestGlobalSeq + 1

export const set = (globalSeq, index, value) => {
  if (!isValidGlobalSeq(globalSeq)) {
    return
  }

  const currentGlobalSeq = globalSeqs[index]
  if (currentGlobalSeq === undefined || shouldSet(currentGlobalSeq, globalSeq, bytes.get(values, index), value)) {
    if (!bytes.shouldSet(value)) {
      return
    }

    globalSeqs[index] = globalSeq
    bytes.set(values, index, value)
    latestGlobalSeq = Math.max(latestGlobalSeq, globalSeq)
  }
}

export const getOps = () => {
  const ops = []
  for (let i = 0; i < NUM_BYTES; i++) {
    const globalSeq = globalSeqs[i]
    if (globalSeq !== -1) {
      ops.push({
        type: 'set',
        globalSeq,
        index: i,
        value: bytes.get(values, i),
      })
    }
  }
  return ops
}
