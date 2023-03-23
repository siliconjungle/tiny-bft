import { NUM_BYTES } from './tiny.js'

export const createOp = {
  proof: (publicKey, localSeq, signature) => ({
    type: 'proof',
    publicKey,
    localSeq,
    signature,
  }),
  set: (publicKey, globalSeq, index, value, signature) => ({
    type: 'set',
    publicKey,
    globalSeq,
    index,
    value,
    signature,
  }),
}

export const createMessage = {
  connect: (ops) => ({
    type: 'connect',
    ops,
  }),
  patch: (ops) => ({
    type: 'patch',
    ops,
  }),
}

export const validateMessage = (message) => {
  if (message.type === undefined || typeof message.type !== 'string') {
    return false
  }

  if (message.type !== 'connect' && message.type !== 'patch') {
    return false
  }

  if (message.ops === undefined || !Array.isArray(message.ops)) {
    return false
  }

  const { ops } = message

  for (const op of ops) {
    if (op.type === undefined || typeof op.type !== 'string') {
      return false
    }

    if (op.type !== 'set' && op.type !== 'proof') {
      return false
    }

    if (op.type === 'set') {
      if (op.publicKey === undefined || typeof op.publicKey !== 'string') {
        return false
      }

      if (op.globalSeq === undefined || typeof op.globalSeq !== 'number') {
        return false
      }

      if (op.index === undefined || typeof op.index !== 'number') {
        return false
      }

      if (op.index < 0 || op.index > NUM_BYTES - 1) {
        return false
      }

      if (op.value === undefined || typeof op.value !== 'number') {
        return false
      }

      if (op.signature === undefined || typeof op.signature !== 'string') {
        return false
      }
    }

    if (op.type === 'proof') {
      if (op.publicKey === undefined || typeof op.publicKey !== 'string') {
        return false
      }
    
      if (op.localSeq === undefined || typeof op.localSeq !== 'number') {
        return false
      }

      if (op.signature === undefined || typeof op.signature !== 'string') {
        return false
      }
    }
  }

  return true
}
