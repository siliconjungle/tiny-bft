export const createOp = {
  proof: (publicKey, localSeq, signature) => ({
    type: 'proof',
    publicKey,
    localSeq,
    signature,
  }),
  set: (globalSeq, index, value) => ({
    type: 'set',
    globalSeq,
    index,
    value,
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
