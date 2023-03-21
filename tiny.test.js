import dotenv from 'dotenv'
import { get, getNextGlobalSeq, set, getOps } from './tiny'
import {
  isValidGlobalSeq,
  setLocalSeq,
  getNextLocalSeq,
} from './local-seqs'
import { signData } from './signatures'

dotenv.config()

describe('tiny', () => {
  const index = 0
  const value = 1
  const value2 = 2
  const value3 = 3

  describe('get', () => {
    it('should return the initial value for an index', () => {
      expect(get(index)).toBe(0)
    })
  })

  describe('getNextGlobalSeq', () => {
    it('should return the next global sequence', () => {
      expect(getNextGlobalSeq()).toBe(0)
    })
  })

  describe('set', () => {
    it('should update the value and global sequence for an index', async () => {
      const globalSeq = getNextGlobalSeq()
      const publicKey = process.env.PUBLIC_KEYS.split(',')[0]
      const privateKey = process.env.PRIVATE_KEYS.split(',')[0]
      const nextLocalSeq = getNextLocalSeq(publicKey)
      const signature = await signData(privateKey, nextLocalSeq)

      setLocalSeq(publicKey, nextLocalSeq, signature)
      set(globalSeq, index, value)

      expect(get(index)).toBe(value)
      expect(getNextGlobalSeq()).toBe(globalSeq + 1)
    })

    it('should not update the value if the global sequence is invalid', () => {
      const invalidGlobalSeq = -2

      set(invalidGlobalSeq, index, value2)

      expect(get(index)).toBe(value)
      expect(isValidGlobalSeq(invalidGlobalSeq)).toBe(false)
    })

    it('should not update the value if the global sequence is lower than the current one', () => {
      const lowerGlobalSeq = getNextGlobalSeq() - 2

      set(lowerGlobalSeq, index, value2)

      expect(get(index)).toBe(value)
    })

    it('should update the value if the global sequence is the same but the new value is higher', () => {
      const sameGlobalSeq = getNextGlobalSeq() - 1

      set(sameGlobalSeq, index, value3)

      expect(get(index)).toBe(value3)
    })
  })

  describe('getOps', () => {
    it('should return an array with the operations', () => {
      const ops = getOps()
      expect(ops).toEqual([
        {
          type: 'set',
          globalSeq: 0,
          index,
          value: value3,
        },
      ])
    })
  })
})
