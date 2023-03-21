import dotenv from 'dotenv'
import { generateKeyPair, signData } from './signatures'
import {
  getLocalSeq,
  getLocalSeqs,
  isValidGlobalSeq,
  shouldSetLocalSeq,
  setLocalSeq,
} from './local-seqs'

dotenv.config()

describe('local-seqs', () => {
  describe('getLocalSeq', () => {
    it('should return the correct local sequence', async () => {
      const keyPair = await generateKeyPair()
      const publicKey = keyPair.publicKey

      expect(getLocalSeq(publicKey)).toBe(-1)
    })
  })

  describe('getLocalSeqs', () => {
    it('should return an empty array initially', () => {
      expect(getLocalSeqs()).toEqual([])
    })
  })

  describe('isValidGlobalSeq', () => {
    it('should return false for a sequence higher than the maximum', () => {
      expect(isValidGlobalSeq(Infinity)).toBe(false)
    })

    it('should return true for a sequence equal to or lower than the maximum', () => {
      expect(isValidGlobalSeq(-1)).toBe(true)
    })
  })

  describe('shouldSetLocalSeq and setLocalSeq', () => {
    const seq = 5

    it('should return false for an unrecognized public key', async () => {
      const keyPair = await generateKeyPair()
      const publicKey = keyPair.publicKey
      const privateKey = keyPair.privateKey
      const signature = await signData(privateKey, seq)
      const shouldSet = await shouldSetLocalSeq(publicKey, seq, signature)
      expect(shouldSet).toBe(false)
    })

    it('should correctly set a local sequence for a recognized public key', async () => {
      const publicKey = process.env.PUBLIC_KEYS.split(',')[0]
      const privateKey = process.env.PRIVATE_KEYS.split(',')[0]
      const signature = await signData(privateKey, seq)
      const shouldSet = await shouldSetLocalSeq(publicKey, seq, signature)
      expect(shouldSet).toBe(true)

      if (shouldSet) {
        setLocalSeq(publicKey, seq, signature)
      }

      expect(getLocalSeq(publicKey).seq).toBe(seq)
      expect(getLocalSeqs()).toEqual([
        {
          type: 'proof',
          publicKey,
          localSeq: seq,
          signature,
        },
      ])
    })
  })
})
