import { create, shouldSet, set, get, getLength } from '../bytes'

describe('create', () => {
  it('should create a new Uint8Array of the specified size', () => {
    const size = 10
    const byteArray = create(size)
    expect(byteArray).toBeInstanceOf(Uint8Array)
    expect(byteArray.length).toBe(size)
  })
})

describe('shouldSet', () => {
  it('should return true for values between 0 and 256', () => {
    expect(shouldSet(0)).toBeTruthy()
    expect(shouldSet(128)).toBeTruthy()
    expect(shouldSet(256)).toBeTruthy()
  })

  it('should return false for values less than 0 or greater than 256', () => {
    expect(shouldSet(-1)).toBeFalsy()
    expect(shouldSet(257)).toBeFalsy()
  })
})

describe('set', () => {
  it('should set the value at the specified index', () => {
    const byteArray = create(5)
    const index = 2
    const value = 42
    set(byteArray, index, value)
    expect(byteArray[index]).toBe(value)
  })
})

describe('get', () => {
  it('should return the value at the specified index', () => {
    const byteArray = create(5)
    const index = 3
    const value = 37
    byteArray[index] = value
    expect(get(byteArray, index)).toBe(value)
  })
})

describe('getLength', () => {
  it('should return the length of the byteArray', () => {
    const size = 10
    const byteArray = create(size)
    expect(getLength(byteArray)).toBe(size)
  })
})
