import {
  generateKeyPair,
  signData,
  verifySignature,
  toString,
  toBuffer,
} from './signatures'

describe('signatures', () => {
  describe('signData', () => {
    it('should sign data with a private key', async () => {
      const data = Buffer.from('test data')
      const { privateKey } = await generateKeyPair()
      const signature = await signData(privateKey, data)

      expect(signature).toBeTruthy()
    })
  })

  describe('verifySignature', () => {
    it('should correctly verify a valid signature', async () => {
      const data = Buffer.from('test data')
      const { publicKey, privateKey } = await generateKeyPair()
      const signature = await signData(privateKey, data)
      const isValid = await verifySignature(publicKey, signature, data)

      expect(isValid).toBe(true)
    })

    it('should reject an invalid signature', async () => {
      const data = Buffer.from('test data')
      const wrongData = Buffer.from('wrong data')
      const { publicKey, privateKey } = await generateKeyPair()
      const signature = await signData(privateKey, data)
      const isValid = await verifySignature(publicKey, signature, wrongData)

      expect(isValid).toBe(false)
    })
  })

  describe('toString', () => {
    it('should convert a buffer to a hex string', async () => {
      const keyPair = await generateKeyPair()
      const privateKey = keyPair.privateKey
      const data = 'test data'
      const signature = await signData(privateKey, data)
      const signatureHex = toString(signature)

      expect(signatureHex).toEqual(expect.any(String))
      expect(/^[\da-f]+$/i.test(signatureHex)).toBe(true)
    })
  })

  describe('toBuffer', () => {
    it('should convert a hex string to a buffer', async () => {
      const keyPair = await generateKeyPair()
      const privateKey = keyPair.privateKey
      const data = 'test data'
      const signature = await signData(privateKey, data)
      const signatureHex = toString(signature)
      const signatureBuffer = toBuffer(signatureHex)

      expect(signatureBuffer).toEqual(expect.any(Buffer))
      expect(signatureBuffer).toEqual(signature)
    })
  })
})
